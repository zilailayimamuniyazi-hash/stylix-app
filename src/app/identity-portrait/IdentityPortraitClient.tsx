"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  IDENTITIES,
  MOODS,
  getIdentityById,
  getSimilarIdentities,
  type JewelryIdentity,
  type MoodId,
} from "@/lib/data/jewelry-identities";
import { getJewelryForIdentity, type JewelryItem } from "@/lib/data/jewelry-items";

type Step = "upload" | "identity" | "quiz" | "jewelry" | "mood" | "generating" | "result";

export function IdentityPortraitClient() {
  const { locale, t } = useI18n();
  const ip = t.identityPortrait;
  const isCn = locale === "zh";
  const [step, setStep] = useState<Step>("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedIdentity, setSelectedIdentity] = useState<JewelryIdentity | null>(null);
  const [selectedJewelry, setSelectedJewelry] = useState<JewelryItem | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [generationPhase, setGenerationPhase] = useState(0);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setGenerationError("请上传不超过 10MB 的 JPG、PNG 或 WEBP 图片。");
      return;
    }
    setGenerationError(null);
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setStep("identity");
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSurprise = () => {
    const random = IDENTITIES[Math.floor(Math.random() * IDENTITIES.length)];
    setSelectedIdentity(random);
    setStep("jewelry");
  };

  const handleIdentitySelect = (identity: JewelryIdentity) => {
    setSelectedIdentity(identity);
    setStep("jewelry");
  };

  const handleJewelrySelect = (jewelry: JewelryItem) => {
    setSelectedJewelry(jewelry);
    setStep("mood");
  };

  const handleSkipJewelry = () => {
    setSelectedJewelry(null);
    setStep("mood");
  };

  const handleGenerate = async (mood: MoodId) => {
    if (!photoFile || !selectedIdentity) return;
    setSelectedMood(mood);
    setGenerationError(null);
    setStep("generating");

    let currentPhase = 0;
    setGenerationPhase(0);
    const interval = setInterval(() => {
      currentPhase++;
      if (currentPhase < 4) setGenerationPhase(currentPhase);
    }, 3500);

    try {
      const formData = new FormData();
      formData.append("image", photoFile);
      formData.append("identityId", selectedIdentity.id);
      formData.append("mood", mood);
      formData.append("intensity", "balanced");
      if (selectedJewelry) {
        formData.append("jewelryId", selectedJewelry.id);
      }

      const res = await fetch("/api/identity-portrait/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok || !data.resultImage) {
        setGenerationError(data.error || ip.resultUnavailable);
        setResultImage(null);
        setStep("result");
        return;
      }
      setResultImage(data.resultImage || null);
      setStep("result");
    } catch {
      clearInterval(interval);
      setGenerationError("网络连接异常，请稍后重试。");
      setStep("result");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setPhotoFile(null);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSelectedIdentity(null);
    setSelectedJewelry(null);
    setSelectedMood(null);
    setResultImage(null);
    setGenerationError(null);
  };

  const handleRegenerateWith = (identity: JewelryIdentity) => {
    setSelectedIdentity(identity);
    setSelectedJewelry(null);
    setStep("jewelry");
  };

  const handleDownloadCard = () => {
    if (!resultImage || !selectedIdentity) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, 1080, 1920);

      const imgSize = 900;
      const imgX = (1080 - imgSize) / 2;
      const imgY = 120;
      ctx.drawImage(img, imgX, imgY, imgSize, imgSize);

      const textY = imgY + imgSize + 70;
      ctx.textAlign = "center";

      ctx.font = "bold 52px serif";
      ctx.fillStyle = "#faf8f5";
      ctx.fillText(
        `${selectedIdentity!.icon} ${selectedIdentity!.nameCn} · ${selectedIdentity!.nameEn}`,
        540,
        textY
      );

      ctx.font = "bold 28px monospace";
      ctx.fillStyle = "#c9a962";
      ctx.fillText(selectedIdentity!.code, 540, textY + 55);

      ctx.font = "24px sans-serif";
      ctx.fillStyle = "rgba(250, 248, 245, 0.5)";
      ctx.fillText(selectedIdentity!.nicknameCn, 540, textY + 100);

      ctx.font = "22px sans-serif";
      ctx.fillStyle = "rgba(250, 248, 245, 0.7)";
      ctx.fillText(
        `「${selectedIdentity!.signatureQuote}」`,
        540,
        textY + 160
      );

      ctx.font = "18px sans-serif";
      ctx.fillStyle = "rgba(250, 248, 245, 0.3)";
      ctx.fillText(selectedIdentity!.keywordsCn.join(" · "), 540, textY + 210);

      ctx.font = "14px sans-serif";
      ctx.fillStyle = "rgba(250, 248, 245, 0.2)";
      ctx.fillText("STYLIX · Jewelry Identity", 540, 1870);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `stylix-${selectedIdentity!.id}-identity.png`;
      a.click();
    };
    img.src = resultImage;
  };

  // ─── Step indicator ────────────────────────────────────────────────────────

  const STEPS: { key: Step; label: string }[] = [
    { key: "upload", label: ip.stepUpload },
    { key: "identity", label: ip.stepIdentity },
    { key: "jewelry", label: ip.stepJewelry },
    { key: "mood", label: ip.stepMood },
  ];

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  const GENERATION_PHASES = [
    ip.genPhase1,
    ip.genPhase2,
    ip.genPhase3,
    ip.genPhase4,
  ];

  // ─── Navigation helper ─────────────────────────────────────────────────────

  function goBack() {
    if (step === "identity") setStep("upload");
    else if (step === "jewelry") setStep("identity");
    else if (step === "mood") setStep("jewelry");
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="ui-page relative overflow-hidden">

      {/* Step indicator (visible on steps 1-4, not during generating/result) */}
      {currentStepIndex >= 0 && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-ink-deep/80 backdrop-blur-sm border-b border-ivory/5">
          <div className="max-w-lg mx-auto px-6 py-3 flex items-center justify-center gap-2">
            {STEPS.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    idx < currentStepIndex
                      ? "bg-gold"
                      : idx === currentStepIndex
                        ? "bg-gold/80 ring-2 ring-gold/30"
                        : "bg-ivory/15"
                  }`}
                />
                <span
                  className={`text-[9px] uppercase tracking-[0.2em] transition-colors duration-300 ${
                    idx <= currentStepIndex ? "text-ivory/60" : "text-ivory/40"
                  }`}
                >
                  {s.label}
                </span>
                {idx < STEPS.length - 1 && (
                  <span className="text-ivory/30 text-[8px] mx-1">&mdash;</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Step 1: Upload ─── */}
      {step === "upload" && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 animate-fade-up">
          <div className="max-w-lg w-full text-center space-y-8">
            <h1 className="font-serif text-4xl md:text-5xl text-ivory leading-tight">
              {ip.pageTitle}
            </h1>
            <p className="text-ivory/50 text-lg leading-relaxed whitespace-pre-line">
              {ip.pageSubtitle}
            </p>

            <div
              className="border border-dashed border-ivory/15 rounded-2xl p-12 cursor-pointer
                hover:border-gold/40 bg-ivory/[0.02] hover:bg-ivory/[0.04]
                backdrop-blur-sm transition-all duration-500 group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full border border-ivory/15 flex items-center justify-center
                  group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-500">
                  <svg className="w-6 h-6 text-ivory/30 group-hover:text-gold/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="4" strokeWidth={1.2} />
                    <path strokeLinecap="round" strokeWidth={1.2} d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
                  </svg>
                </div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-ivory/40 group-hover:text-gold/60 transition-colors">
                  {ip.uploadPhoto}
                </p>
                <p className="text-xs text-ivory/40">JPG, PNG, WEBP</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              aria-label="上传身份画像照片"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="sr-only"
            />
          </div>
        </div>
      )}

      {/* ─── Step 2: Choose Identity ─── */}
      {step === "identity" && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-20 animate-fade-up">
          <div className="max-w-4xl w-full space-y-8">
            <div className="text-center space-y-3">
              <h2 className="font-serif text-3xl md:text-4xl text-ivory">
                {ip.chooseIdentity}
              </h2>
              <p className="text-ivory/40 text-sm">
                {ip.chooseIdentitySubtitle}
              </p>
            </div>

            <div className="text-center flex flex-wrap justify-center gap-3">
              <button
                onClick={handleSurprise}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                  border border-gold/30 text-gold hover:bg-gold/10
                  transition-all duration-300 text-sm"
              >
                <span className="text-lg">&#10024;</span>
                {ip.surpriseMe}
              </button>
              <button
                onClick={() => setStep("quiz" as Step)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                  border border-ivory/20 text-ivory/60 hover:border-ivory/40 hover:text-ivory/80
                  transition-all duration-300 text-sm"
              >
                <span className="text-lg">&#128300;</span>
                {ip.quizButton}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[55vh] overflow-y-auto pr-2">
              {IDENTITIES.map((identity) => (
                <button
                  key={identity.id}
                  onClick={() => handleIdentitySelect(identity)}
                  className="p-5 rounded-xl border border-ivory/10
                    hover:border-gold/30 hover:-translate-y-0.5 bg-ink-soft/50 hover:bg-ink-soft
                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 text-left group"
                >
                  <div className="text-2xl mb-2">{identity.icon}</div>
                  <p className="font-serif text-sm text-ivory group-hover:text-gold transition-colors">
                    {isCn ? identity.nameCn : identity.nameEn}
                  </p>
                  <p className="text-[10px] text-ivory/40 mt-1">
                    {isCn ? identity.nicknameCn : identity.nickname}
                  </p>
                  <p className="text-[9px] text-ivory/45 mt-1">
                    {(isCn ? identity.keywordsCn : identity.keywords).join(" · ")}
                  </p>
                </button>
              ))}
            </div>

            {/* Back */}
            <div className="text-center pt-2">
              <button onClick={goBack} className="text-ivory/45 text-xs hover:text-ivory/50 transition-colors">
                &larr; {ip.back}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Quiz Step ─── */}
      {step === ("quiz" as Step) && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-20 animate-fade-up">
          <div className="max-w-2xl w-full space-y-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-ivory">
              {ip.quizTitle}
            </h2>
            <p className="text-ivory/40 text-sm leading-relaxed">
              {ip.quizSubtitle}
            </p>

            <div className="py-12 border border-ivory/10 rounded-2xl bg-ink-soft/30">
              <p className="text-ivory/30 text-sm">{ip.quizComingSoon}</p>
              <p className="text-ivory/40 text-xs mt-2">{ip.quizComingSoonSub}</p>
            </div>

            <button
              onClick={() => setStep("identity")}
              className="text-ivory/45 text-xs hover:text-ivory/50 transition-colors"
            >
              &larr; {ip.quizBack}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Choose Jewelry ─── */}
      {step === "jewelry" && selectedIdentity && (
        <div
          className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-20 animate-fade-up transition-colors duration-700"
          style={{ backgroundColor: selectedIdentity.bgColorDark }}
        >
          <div className="max-w-4xl w-full space-y-8">
            <div className="text-center space-y-2">
              <p className="text-ivory/30 text-xs uppercase tracking-[0.3em]">
                {selectedIdentity.icon} {selectedIdentity.nameEn}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-ivory">
                {ip.chooseJewelry}
              </h2>
              <p className="text-ivory/40 text-sm">
                {ip.chooseJewelrySubtitle}
              </p>
            </div>

            {/* Jewelry grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getJewelryForIdentity(selectedIdentity.id).map((jewelry) => (
                <button
                  key={jewelry.id}
                  onClick={() => handleJewelrySelect(jewelry)}
                  className="rounded-xl border border-ivory/10 overflow-hidden
                    hover:border-gold/30 bg-ink-soft/50 hover:bg-ink-soft
                    transition-all duration-300 text-left group"
                >
                  <div className="relative aspect-square bg-ink-muted">
                    <Image
                      src={jewelry.image}
                      alt={jewelry.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-ivory group-hover:text-gold transition-colors">
                      {isCn ? jewelry.nameCn : jewelry.name}
                    </p>
                    <p className="text-[10px] text-ivory/30 mt-1">
                      {isCn ? jewelry.name : jewelry.nameCn}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Skip + Back */}
            <div className="flex items-center justify-between pt-2">
              <button onClick={goBack} className="text-ivory/45 text-xs hover:text-ivory/50 transition-colors">
                &larr; {ip.back}
              </button>
              <button
                onClick={handleSkipJewelry}
                className="text-ivory/30 text-xs hover:text-ivory/50 transition-colors"
              >
                {ip.skip} &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 4: Choose Mood → Generate ─── */}
      {step === "mood" && selectedIdentity && (
        <div
          className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 py-20 animate-fade-up transition-colors duration-700"
          style={{ backgroundColor: selectedIdentity.bgColorDark }}
        >
          <div className="max-w-2xl w-full space-y-8">
            <div className="text-center space-y-2">
              <p className="text-ivory/30 text-xs uppercase tracking-[0.3em]">
                {selectedIdentity.icon} {selectedIdentity.nameEn}
                {selectedJewelry && ` \u00b7 ${selectedJewelry.name}`}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-ivory">
                {ip.chooseMood}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleGenerate(mood.id)}
                  className="p-6 rounded-xl border border-ivory/10
                    hover:border-gold/40 hover:bg-gold/5
                    transition-all duration-300 text-center group"
                >
                  <div className="text-2xl mb-2">{mood.icon}</div>
                  <p className="text-sm text-ivory group-hover:text-gold transition-colors">
                    {mood.label}
                  </p>
                </button>
              ))}
            </div>

            <div className="text-center pt-2">
              <button onClick={goBack} className="text-ivory/45 text-xs hover:text-ivory/50 transition-colors">
                &larr; {ip.back}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 5: Generating ─── */}
      {step === "generating" && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 animate-fade-up">
          <div className="max-w-md w-full text-center space-y-12">
            <div className="space-y-8">
              {GENERATION_PHASES.map((phase, idx) => (
                <div
                  key={phase}
                  className={`transition-all duration-700 ${
                    idx <= generationPhase
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <p
                    className={`font-serif text-lg ${
                      idx === generationPhase
                        ? "text-ivory"
                        : idx < generationPhase
                          ? "text-ivory/30"
                          : "text-ivory/30"
                    } transition-colors duration-500`}
                  >
                    {phase}
                  </p>
                  {idx < GENERATION_PHASES.length - 1 && idx <= generationPhase && (
                    <p className="text-gold/55 mt-2 text-xs">&#10022;</p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-gold/20 animate-spin" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-1 rounded-full border-t border-gold/50 animate-spin" style={{ animationDuration: "2s" }} />
                <div className="w-2 h-2 rounded-full bg-gold/60 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 6: Result ─── */}
      {step === "result" && selectedIdentity && (
        <div className="min-h-[calc(100vh-64px)] px-6 py-20 animate-fade-up">
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-10 lg:grid-cols-[1fr_400px]">

              {/* Portrait */}
              <div className="rounded-2xl overflow-hidden bg-ink-soft border border-ivory/5">
                {resultImage ? (
                  <Image
                    src={resultImage}
                    alt={`${selectedIdentity.nameEn} Portrait`}
                    width={1024}
                    height={1024}
                    unoptimized
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <div className="max-w-xs px-6 text-center"><p className="text-ivory/60 text-sm">{generationError || ip.resultUnavailable}</p><button type="button" onClick={() => setStep("mood")} className="mt-5 border border-gold/30 px-5 py-2 text-[10px] tracking-[0.2em] text-gold">重新生成</button></div>
                  </div>
                )}
              </div>

              {/* Info panel */}
              <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-1">
                {/* Header: name + code */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-ivory/30">
                    {ip.resultLabel}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedIdentity.icon}</span>
                    <div>
                      <h2 className="font-serif text-2xl text-ivory">
                        {isCn
                          ? `${selectedIdentity.nameCn} · ${selectedIdentity.nameEn}`
                          : selectedIdentity.nameEn}
                      </h2>
                      <p className="text-gold font-mono text-sm mt-0.5">
                        {selectedIdentity.code}
                      </p>
                    </div>
                  </div>
                  <p className="text-ivory/50 text-sm">
                    {isCn ? selectedIdentity.labelCn : selectedIdentity.labelEn}
                  </p>
                </div>

                {/* Nickname */}
                <div className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
                  <span className="text-gold text-xs">{isCn ? selectedIdentity.nicknameCn : selectedIdentity.nickname}</span>
                </div>

                {/* Keywords pill */}
                <div className="flex gap-2 flex-wrap">
                  {(isCn ? selectedIdentity.keywordsCn : selectedIdentity.keywords).map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1 rounded-full border border-ivory/10 text-ivory/60 text-xs"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* 别人眼里的你 */}
                <div className="border border-ivory/6 rounded-lg p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60">
                    {ip.othersViewLabel}
                  </p>
                  <p className="text-ivory/60 text-sm leading-relaxed">
                    {selectedIdentity.othersView}
                  </p>
                </div>

                {/* 你的另一面 */}
                <div className="border border-ivory/6 rounded-lg p-4 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-ivory/40">
                    {ip.shadowTraitLabel}
                  </p>
                  <p className="text-ivory/45 text-sm leading-relaxed">
                    {selectedIdentity.shadowTrait}
                  </p>
                </div>

                {/* 毒舌梗 */}
                <div className="pl-4 border-l-2 border-gold/20">
                  <p className="text-ivory/50 text-sm italic">
                    &ldquo;{selectedIdentity.roastLine}&rdquo;
                  </p>
                </div>

                {/* 专属金句 */}
                <div className="py-4 text-center">
                  <p className="font-serif text-lg text-ivory/90 tracking-wide">
                    「{selectedIdentity.signatureQuote}」
                  </p>
                </div>

                {/* Selected jewelry (if any) */}
                {selectedJewelry && (
                  <div className="border border-ivory/8 rounded-lg p-4 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-ink-muted">
                      <Image
                        src={selectedJewelry.image}
                        alt={selectedJewelry.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="text-ivory text-sm">{isCn ? selectedJewelry.nameCn : selectedJewelry.name}</p>
                      <p className="text-ivory/30 text-[10px]">{isCn ? selectedJewelry.name : selectedJewelry.nameCn}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleDownloadCard}
                    className="px-6 py-3 border border-gold/30 text-gold text-xs
                      uppercase tracking-[0.2em] rounded-full hover:bg-gold/10 transition-all"
                  >
                    {ip.downloadCard}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 border border-ivory/15 text-ivory/50 text-xs
                      uppercase tracking-[0.2em] rounded-full hover:border-ivory/30 transition-all"
                  >
                    {ip.regenerate}
                  </button>
                </div>
              </div>
            </div>

            {/* You may also like */}
            <div className="mt-16 space-y-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-ivory/30 text-center">
                {ip.youMayAlsoLike}
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                {getSimilarIdentities(selectedIdentity.id, 3).map((similar) => (
                  <button
                    key={similar.id}
                    onClick={() => handleRegenerateWith(similar)}
                    className="w-40 p-4 rounded-xl border border-ivory/8 bg-ink-soft/30
                      hover:border-gold/30 transition-all duration-300 text-center"
                  >
                    <div className="text-2xl mb-2">{similar.icon}</div>
                    <p className="font-serif text-ivory text-sm">{isCn ? similar.nameCn : similar.nameEn}</p>
                    <p className="text-ivory/30 text-[10px] mt-1">
                      {(isCn ? similar.keywordsCn : similar.keywords).join(" · ")}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
