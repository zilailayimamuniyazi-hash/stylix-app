import { NextRequest, NextResponse } from "next/server";
import { getIdentityById, MOODS } from "@/lib/data/jewelry-identities";
import { JEWELRY_ITEMS } from "@/lib/data/jewelry-items";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
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

function buildPrompt(identityId: string, mood: string, intensity: string, jewelryId?: string): string {
  const identity = getIdentityById(identityId);
  if (!identity) return "";

  const moodObj = MOODS.find((m) => m.id === mood);
  const moodLabel = moodObj?.label || mood;

  const intensityMap: Record<string, string> = {
    soft: "subtle and understated",
    balanced: "harmonious and clearly visible",
    bold: "dramatic and striking",
  };
  const intensityDesc = intensityMap[intensity] || intensityMap.balanced;

  const jewelry = jewelryId ? JEWELRY_ITEMS.find((j) => j.id === jewelryId) : null;
  const jewelryLine = jewelry
    ? `Specifically feature: ${jewelry.name}. `
    : "";

  return [
    `Transform this portrait into a "${identity.nameEn}" Jewelry Identity Portrait.`,
    ``,
    `Identity: ${identity.labelEn} — ${identity.oneLiner}`,
    `Core aura: ${identity.keywords.join(", ")}.`,
    `Soul gem: ${identity.soulGemEn}.`,
    ``,
    `JEWELRY: ${jewelryLine}Adorn the person with ${identity.jewelryFit}. The jewelry should be ${intensityDesc}.`,
    ``,
    `FASHION & STYLING: Adapt the person's outfit and styling to match: ${identity.fashionStyle}.`,
    `Keep the adaptation natural — it should feel like the person chose this look themselves.`,
    ``,
    `MOOD & ATMOSPHERE: The overall mood is "${moodLabel}".`,
    `Adjust lighting, color grading, and background atmosphere to reflect this mood.`,
    `The entire image should feel like a high-end editorial portrait with ${moodLabel.toLowerCase()} energy.`,
    ``,
    `IMPORTANT RULES:`,
    `- Preserve the person's face, identity, and natural features exactly.`,
    `- Change lighting, makeup, outfit, jewelry, background, and overall atmosphere.`,
    `- The result should look like a professional fashion editorial or luxury brand campaign.`,
    `- Make the jewelry the visual anchor of the portrait.`,
    `- The overall feeling should be: ${identity.keywords.join(", ")}.`,
    `- Do NOT make the person unrecognizable. Their identity is preserved, their aura is transformed.`,
  ].join("\n");
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
  if (isRateLimited(ip)) return NextResponse.json({ error: "生成次数过多，请稍后再试。" }, { status: 429 });
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const identityId = formData.get("identityId") as string | null;
    const mood = formData.get("mood") as string | null;
    const intensity = (formData.get("intensity") as string) || "balanced";
    const jewelryId = (formData.get("jewelryId") as string) || undefined;

    if (!file || !identityId || !mood) {
      return NextResponse.json(
        { error: "Missing required fields: image, identityId, mood" },
        { status: 400 }
      );
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "请上传不超过 10MB 的 JPG、PNG 或 WEBP 图片。" }, { status: 415 });
    }

    const identity = getIdentityById(identityId);
    if (!identity) {
      return NextResponse.json(
        { error: `Unknown identity: ${identityId}` },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(identityId, mood, intensity, jewelryId);

    if (!apiKey) {
      return NextResponse.json({ error: "身份肖像服务暂时不可用。" }, { status: 503 });
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
        prompt,
        n: 1,
        size: "1024x1024",
      });
    } catch (openaiErr: unknown) {
      const timedOut = isTimeoutError(openaiErr);
      console.error("[identity-portrait] generation failed", { timedOut });
      return NextResponse.json({ error: timedOut ? "生成超时，请压缩图片后重试。" : "生成失败，请稍后重试。" }, { status: 502 });
    }

    const result = response.data?.[0];
    if (!result) {
      return NextResponse.json({ error: "未生成有效图片，请重新尝试。" }, { status: 502 });
    }

    const resultImage =
      result.url ??
      (result.b64_json ? `data:image/png;base64,${result.b64_json}` : null);

    return NextResponse.json({
      demo: false,
      resultImage,
      identity,
      prompt,
    });
  } catch (err: unknown) {
    console.error("[identity-portrait] unexpected error", err);
    return NextResponse.json({ error: "服务暂时不可用，请稍后重试。" }, { status: 500 });
  }
}
