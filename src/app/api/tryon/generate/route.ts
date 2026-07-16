import { NextRequest, NextResponse } from "next/server";

const NECKLACE_MAP: Record<string, {
  id: string;
  name: string;
  wornReferenceImage: string;
  prompt: string;
}> = {
  "aurora-necklace": {
    id: "aurora-necklace",
    name: "Aurora Celestial Necklace",
    wornReferenceImage: "/tryon/aurora-necklace/worn-reference.png",
    prompt:
      "Add a delicate gold necklace with small celestial star charms and tiny crystal accents around the user's neck. " +
      "Preserve the user's face, pose, body, skin tone, outfit, background, and lighting exactly. " +
      "Place the necklace naturally with realistic scale, curve, shadow, and reflection. " +
      "Do not change the person's identity or alter the clothing except where the necklace naturally overlaps.",
  },
};
const generationBuckets = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const bucket = generationBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    generationBuckets.set(ip, { count: 1, resetAt: now + 10 * 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 3;
}

function isTimeoutError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("etimedout") ||
    msg.includes("econnreset") ||
    (err as NodeJS.ErrnoException).code === "ETIMEDOUT"
  );
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return NextResponse.json({ error: "Too many generations. Try again later." }, { status: 429 });
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const necklaceId = formData.get("necklaceId") as string | null;

    if (!file || !necklaceId) {
      return NextResponse.json({ error: "Missing image or necklaceId" }, { status: 400 });
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Upload a JPG, PNG or WEBP image under 10MB." }, { status: 415 });
    }

    const necklace = NECKLACE_MAP[necklaceId];
    if (!necklace) {
      return NextResponse.json({ error: `Unknown necklace id: ${necklaceId}` }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "AI try-on is temporarily unavailable." }, { status: 503 });
    }

    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const imageFile = new File([imageBuffer], file.name, { type: file.type });

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey, timeout: 180_000, maxRetries: 0 });

    let response;
    try {
      response = await openai.images.edit({
        model: "gpt-image-1",
        image: imageFile,
        prompt: necklace.prompt,
        n: 1,
        size: "1024x1024",
      });
    } catch (openaiErr: unknown) {
      const timedOut = isTimeoutError(openaiErr);
      console.error("[tryon/generate] provider request failed", { timedOut });
      return NextResponse.json({ error: timedOut ? "Generation timed out. Try a smaller photo." : "Generation failed. Try again later." }, { status: 502 });
    }

    const result = response.data?.[0];
    if (!result) {
      return NextResponse.json({ error: "No image was generated." }, { status: 502 });
    }

    const resultImage = result.url ?? (result.b64_json ? `data:image/png;base64,${result.b64_json}` : null);
    if (!resultImage) {
      return NextResponse.json({ error: "No image was generated." }, { status: 502 });
    }

    return NextResponse.json({ demo: false, resultImage, necklace });

  } catch (err: unknown) {
    console.error("[tryon/generate] unexpected error", err);
    return NextResponse.json({ error: "AI try-on is temporarily unavailable." }, { status: 500 });
  }
}
