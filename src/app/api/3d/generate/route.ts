import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data/products";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { isValidGlbUrl } from "@/lib/utils/model3d";
import { hasAdminSession } from "@/lib/admin/session";

export const runtime = "nodejs";
export const maxDuration = 300;

const MESHY_IMAGE_TO_3D_URL = "https://api.meshy.ai/openapi/v1/image-to-3d";
const POLL_INTERVAL_MS = 5_000;
const MAX_POLL_ATTEMPTS = 72;

interface Generate3DRequest {
  productId?: string;
  imageUrl?: string;
  model3dUrl?: string;
}

interface ProductUpdateResult {
  updated: boolean;
  model3dUrl: string;
}

type RouteFailure = {
  error: string;
  status: number;
};

type MeshyTaskResult = RouteFailure | {
  taskId: string;
  apiKey: string;
};

type MeshyGenerateResult = RouteFailure | {
  model3dUrl: string;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(value);
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? value as Record<string, unknown> : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getProductSlug(productId: string) {
  const product = products.find((item) => item.id === productId || item.slug === productId);
  return product?.slug ?? productId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function resolveRequestUrl(value: string, origin: string) {
  const url = new URL(value, origin);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL must use http or https.");
  }
  return url.toString();
}

function findMeshyTaskId(payload: unknown): string | null {
  const record = readRecord(payload);
  if (!record) return null;

  const result = readRecord(record.result);
  const data = readRecord(record.data);

  return (
    readString(record.result) ??
    readString(record.id) ??
    readString(record.task_id) ??
    readString(record.taskId) ??
    readString(result?.id) ??
    readString(result?.task_id) ??
    readString(data?.id) ??
    readString(data?.task_id) ??
    null
  );
}

function findMeshyGlbUrl(payload: unknown): string | null {
  const record = readRecord(payload);
  if (!record) return null;

  const modelUrls = readRecord(record.model_urls);
  const output = readRecord(record.output);
  const assets = readRecord(record.assets);

  const candidates = [
    modelUrls?.glb,
    record.glb_url,
    record.glbUrl,
    record.model3dUrl,
    record.modelUrl,
    output?.glb,
    output?.glb_url,
    assets?.glb,
  ];

  for (const candidate of candidates) {
    const value = readString(candidate);
    if (value && isValidGlbUrl(value)) return value;
  }

  return null;
}

function readMeshyStatus(payload: unknown) {
  const status = readString(readRecord(payload)?.status);
  return status?.toUpperCase() ?? null;
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

async function meshyFetch(url: string, apiKey: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    return await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function createMeshyImageTo3DTask(imageUrl: string): Promise<MeshyTaskResult> {
  const apiKey = process.env.MESHY_API_KEY?.trim();
  if (!apiKey) {
    return {
      error: "Meshy is not configured. Set MESHY_API_KEY.",
      status: 503,
    };
  }

  const response = await meshyFetch(MESHY_IMAGE_TO_3D_URL, apiKey, {
    method: "POST",
    body: JSON.stringify({
      image_url: imageUrl,
      enable_pbr: true,
      should_remesh: true,
      should_texture: true,
    }),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    console.error("[3d/generate] Meshy task creation failed", {
      status: response.status,
      response: payload,
    });
    return {
      error: "Meshy image-to-3D task creation failed.",
      status: 502,
    };
  }

  const taskId = findMeshyTaskId(payload);
  if (!taskId) {
    console.error("[3d/generate] Meshy returned no task id", payload);
    return {
      error: "Meshy returned no task id.",
      status: 502,
    };
  }

  return { taskId, apiKey };
}

async function pollMeshyTask(taskId: string, apiKey: string) {
  const statusUrl = `${MESHY_IMAGE_TO_3D_URL}/${encodeURIComponent(taskId)}`;

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    const response = await meshyFetch(statusUrl, apiKey, { method: "GET" });
    const payload = await readJsonResponse(response);

    if (!response.ok) {
      console.error("[3d/generate] Meshy task polling failed", {
        taskId,
        status: response.status,
        attempt,
        response: payload,
      });
      throw new Error("Meshy task status check failed.");
    }

    const glbUrl = findMeshyGlbUrl(payload);
    if (glbUrl) return glbUrl;

    const status = readMeshyStatus(payload);
    if (status === "FAILED" || status === "EXPIRED" || status === "CANCELED" || status === "CANCELLED") {
      console.error("[3d/generate] Meshy task failed", { taskId, status, payload });
      throw new Error("Meshy image-to-3D generation failed.");
    }

    if (status === "SUCCEEDED") {
      console.error("[3d/generate] Meshy task succeeded without GLB URL", { taskId, payload });
      throw new Error("Meshy returned no GLB URL.");
    }
  }

  throw new Error("Meshy image-to-3D generation timed out before returning a GLB.");
}

async function generateMeshyGlbUrl(imageUrl: string): Promise<MeshyGenerateResult> {
  const taskResult = await createMeshyImageTo3DTask(imageUrl);
  if ("error" in taskResult) return taskResult;

  try {
    return { model3dUrl: await pollMeshyTask(taskResult.taskId, taskResult.apiKey) };
  } catch (err) {
    console.error("[3d/generate] Meshy generation failed", err);
    return {
      error: err instanceof Error ? err.message : "Meshy generation failed.",
      status: 502,
    };
  }
}

async function downloadGlbToPublicModels(remoteModelUrl: string, productId: string) {
  const response = await fetch(remoteModelUrl);
  if (!response.ok) {
    console.error("[3d/generate] GLB download failed", {
      status: response.status,
      remoteModelUrl,
    });
    throw new Error("Generated GLB could not be downloaded.");
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 4 || bytes.subarray(0, 4).toString("utf8") !== "glTF") {
    console.error("[3d/generate] downloaded file is not a GLB", {
      remoteModelUrl,
      bytes: bytes.length,
    });
    throw new Error("Downloaded file is not a valid GLB.");
  }

  const slug = getProductSlug(productId);
  const fileName = `${slug}.glb`;
  const modelsDir = path.join(process.cwd(), "public", "models");
  const filePath = path.join(modelsDir, fileName);

  await mkdir(modelsDir, { recursive: true });
  await writeFile(filePath, bytes);

  return `/models/${fileName}`;
}

function findProductObjectRange(source: string, productId: string) {
  const idPattern = new RegExp(`id:\\s*["']${productId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`);
  const idMatch = idPattern.exec(source);
  if (!idMatch) return null;

  const start = source.lastIndexOf("{", idMatch.index);
  if (start === -1) return null;

  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return { start, end: index + 1 };
  }

  return null;
}

async function updateProductsTsModelUrl(productId: string, model3dUrl: string): Promise<ProductUpdateResult> {
  const productsPath = path.join(process.cwd(), "src", "lib", "data", "products.ts");
  const source = await readFile(productsPath, "utf8");
  const range = findProductObjectRange(source, productId);

  if (!range) {
    console.warn("[3d/generate] product not found in products.ts", { productId });
    return { updated: false, model3dUrl };
  }

  const block = source.slice(range.start, range.end);
  const modelLine = `    model3dUrl: "${model3dUrl}",`;
  let nextBlock = block;

  if (/\n\s*model3dUrl:\s*["'][^"']*["'],?/.test(nextBlock)) {
    nextBlock = nextBlock.replace(/\n\s*model3dUrl:\s*["'][^"']*["'],?/, `\n${modelLine}`);
  } else if (/\n\s*modelUrl:\s*["'][^"']*["'],?/.test(nextBlock)) {
    nextBlock = nextBlock.replace(/\n\s*modelUrl:\s*["'][^"']*["'],?/, `\n${modelLine}`);
  } else {
    nextBlock = nextBlock.replace(/(\n\s*coverImage:\s*["'][^"']*["'],)/, `$1\n${modelLine}`);
  }

  if (nextBlock === block) {
    console.warn("[3d/generate] could not insert model3dUrl into product block", { productId });
    return { updated: false, model3dUrl };
  }

  await writeFile(productsPath, `${source.slice(0, range.start)}${nextBlock}${source.slice(range.end)}`);
  return { updated: true, model3dUrl };
}

async function storeSupabaseModelUrl(productId: string, imageUrl: string, model3dUrl: string) {
  const product = products.find((item) => item.id === productId || item.slug === productId);
  const db = getSupabaseAdmin();

  let productQuery = db.schema("public").from("products").select("id").limit(1);
  productQuery = isUuid(productId)
    ? productQuery.eq("id", productId)
    : productQuery.eq("slug", product?.slug ?? productId);

  const { data: dbProduct, error: productError } = await productQuery.maybeSingle();

  if (productError) {
    console.error("[3d/generate] product lookup failed", {
      productId,
      message: productError.message,
      details: productError.details,
      hint: productError.hint,
    });
    throw new Error(productError.message);
  }

  const dbProductId = (dbProduct as { id?: string } | null)?.id;
  if (!dbProductId) {
    console.warn("[3d/generate] product not found in Supabase products table", {
      productId,
      slug: product?.slug,
    });
    return false;
  }

  const { data: existingAsset, error: assetLookupError } = await db
    .schema("public")
    .from("product_assets")
    .select("id")
    .eq("product_id", dbProductId)
    .limit(1)
    .maybeSingle();

  if (assetLookupError) {
    console.error("[3d/generate] product asset lookup failed", {
      productId,
      dbProductId,
      message: assetLookupError.message,
      details: assetLookupError.details,
      hint: assetLookupError.hint,
    });
    throw new Error(assetLookupError.message);
  }

  const existingAssetId = (existingAsset as { id?: string } | null)?.id;

  if (existingAssetId) {
    const { error } = await db
      .schema("public")
      .from("product_assets")
      .update({
        image_url: imageUrl,
        model_3d_url: model3dUrl,
      })
      .eq("id", existingAssetId);

    if (error) {
      console.error("[3d/generate] product asset update failed", {
        productId,
        dbProductId,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(error.message);
    }
  } else {
    const { error } = await db
      .schema("public")
      .from("product_assets")
      .insert({
        product_id: dbProductId,
        image_url: imageUrl,
        model_3d_url: model3dUrl,
      });

    if (error) {
      console.error("[3d/generate] product asset insert failed", {
        productId,
        dbProductId,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(error.message);
    }
  }

  return true;
}

export async function POST(req: NextRequest) {
  if (!(await hasAdminSession(req))) return unauthorized();

  try {
    const body = (await req.json()) as Generate3DRequest;
    const productId = body.productId?.trim();
    const rawImageUrl = body.imageUrl?.trim();
    const attachedModelUrl = body.model3dUrl?.trim();

    if (!productId || !rawImageUrl) {
      return NextResponse.json({ error: "productId and imageUrl are required." }, { status: 400 });
    }

    const product = products.find((item) => item.id === productId || item.slug === productId);
    if (!product && !isUuid(productId)) {
      return NextResponse.json({ error: `Unknown productId: ${productId}` }, { status: 404 });
    }

    let imageUrl: string;
    try {
      imageUrl = resolveRequestUrl(rawImageUrl, req.nextUrl.origin);
    } catch {
      return NextResponse.json({ error: "imageUrl must be a valid http(s) URL." }, { status: 400 });
    }

    let remoteModelUrl = attachedModelUrl ?? null;
    if (remoteModelUrl && !isValidGlbUrl(remoteModelUrl)) {
      return NextResponse.json({ error: "model3dUrl must be a valid .glb URL." }, { status: 400 });
    }

    if (!remoteModelUrl) {
      const providerResult = await generateMeshyGlbUrl(imageUrl);
      if ("error" in providerResult) {
        return NextResponse.json({ error: providerResult.error }, { status: providerResult.status });
      }
      remoteModelUrl = providerResult.model3dUrl;
    }

    if (!isValidGlbUrl(remoteModelUrl)) {
      console.error("[3d/generate] final Meshy URL is not a valid GLB", { productId, remoteModelUrl });
      return NextResponse.json({ error: "Meshy returned an invalid GLB URL." }, { status: 502 });
    }

    let model3dUrl: string;
    try {
      model3dUrl = remoteModelUrl.startsWith("/models/")
        ? remoteModelUrl
        : await downloadGlbToPublicModels(remoteModelUrl, product?.id ?? productId);
    } catch (err) {
      console.error("[3d/generate] failed to save GLB", err);
      return NextResponse.json({ error: "Generated GLB could not be saved." }, { status: 500 });
    }

    let productsFileStored = false;
    try {
      const updateResult = await updateProductsTsModelUrl(product?.id ?? productId, model3dUrl);
      productsFileStored = updateResult.updated;
    } catch (err) {
      console.error("[3d/generate] failed to update products.ts", err);
      return NextResponse.json({ error: "Generated model URL could not be written to products.ts." }, { status: 500 });
    }

    let supabaseStored = false;
    try {
      supabaseStored = await storeSupabaseModelUrl(product?.id ?? productId, imageUrl, model3dUrl);
    } catch (err) {
      console.error("[3d/generate] Supabase model URL sync failed", err);
    }

    return NextResponse.json({
      ok: true,
      stored: productsFileStored || supabaseStored,
      storedProductsFile: productsFileStored,
      storedSupabase: supabaseStored,
      productId,
      imageUrl,
      model3dUrl,
      remoteModelUrl,
      product: {
        id: product?.id ?? productId,
        model3dUrl,
      },
    });
  } catch (err) {
    console.error("[3d/generate] unexpected error", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
