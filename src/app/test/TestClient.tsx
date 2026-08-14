"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useI18n } from "@/lib/i18n/context";
import { jmtiBasisEn, jmtiQuestionsEn } from "@/lib/identity/questions.en";
import {
  evaluateJmti,
  jmtiBasis,
  jmtiQuestions,
  storeIdentityAnswers,
  zodiacLabels,
  zodiacSigns,
  type IdentityAnswers,
  type JmtiDimension,
  type ZodiacSign,
} from "@/lib/identity/engine";
import type { OccasionTag, StyleTag } from "@/lib/types/product";

type AnswerChoice = "A" | "B";

const TEST_PROGRESS_KEY = "stylix-jmti-test-progress";

type StoredTestProgress = {
  step: number;
  responses: Record<number, AnswerChoice>;
};

function loadStoredProgress(): StoredTestProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TEST_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTestProgress;
    if (typeof parsed.step !== "number" || typeof parsed.responses !== "object" || parsed.responses === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

const stepsZh: { dimension: JmtiDimension; label: string; title: string; note: string }[] = [
  { dimension: "LO", label: "理性 / 情绪", title: "你买珠宝时更看重价值，还是心动？", note: "第 1-8 题，判断 L 理性保值或 O 情绪审美。" },
  { dimension: "MT", label: "日常 / 仪式", title: "你的珠宝更像日常护身符，还是重要时刻的开场？", note: "第 9-15 题，判断 M 日常常戴或 T 仪式佩戴。" },
  { dimension: "AS", label: "小众 / 经典", title: "你更偏向设计师感，还是经得起时间的经典？", note: "第 16-22 题，判断 A 小众设计或 S 经典大众。" },
  { dimension: "DG", label: "低调 / 亮眼", title: "你希望光芒被慢慢发现，还是一眼被看见？", note: "第 23-30 题，判断 D 低调内敛或 G 亮眼吸睛。" },
];

const stepsEn: typeof stepsZh = [
  { dimension: "LO", label: "Logic / Emotion", title: "Do you value enduring worth or emotional attraction?", note: "Questions 1–8 reveal whether you lean toward rational value (L) or emotional aesthetics (O)." },
  { dimension: "MT", label: "Daily / Occasion", title: "Is jewellery your daily talisman or the opening of an important moment?", note: "Questions 9–15 reveal daily wear (M) or ceremonial dressing (T)." },
  { dimension: "AS", label: "Independent / Classic", title: "Do you prefer a designer point of view or a timeless classic?", note: "Questions 16–22 reveal independent design (A) or enduring classicism (S)." },
  { dimension: "DG", label: "Quiet / Radiant", title: "Should your radiance be discovered slowly or seen at first glance?", note: "Questions 23–30 reveal understated expression (D) or visible brilliance (G)." },
];

const occasionsZh: { value: OccasionTag; label: string }[] = [
  { value: "work", label: "工作通勤" },
  { value: "black-tie", label: "正式晚宴" },
  { value: "wedding guest", label: "婚礼宾客" },
  { value: "date night", label: "约会夜晚" },
  { value: "casual brunch", label: "周末聚会" },
  { value: "holiday gift", label: "节日送礼" },
];

const occasionsEn: typeof occasionsZh = [
  { value: "work", label: "Work" }, { value: "black-tie", label: "Black tie" },
  { value: "wedding guest", label: "Wedding guest" }, { value: "date night", label: "Date night" },
  { value: "casual brunch", label: "Weekend brunch" }, { value: "holiday gift", label: "Holiday gift" },
];

const stylesZh: { value: StyleTag; label: string }[] = [
  { value: "classic", label: "经典" },
  { value: "bold", label: "强存在感" },
  { value: "celestial", label: "星月灵感" },
  { value: "romantic", label: "浪漫柔和" },
  { value: "minimal", label: "极简" },
  { value: "elegant", label: "精致优雅" },
];

const stylesEn: typeof stylesZh = [
  { value: "classic", label: "Classic" }, { value: "bold", label: "Bold" },
  { value: "celestial", label: "Celestial" }, { value: "romantic", label: "Romantic" },
  { value: "minimal", label: "Minimal" }, { value: "elegant", label: "Elegant" },
];

function OptionButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={"relative min-h-[78px] rounded border px-5 py-4 text-left " + (active ? "border-[var(--ui-accent)] bg-[rgba(199,170,112,.1)] text-[var(--ui-text)]" : "border-[var(--ui-line)] bg-[rgba(255,255,255,.018)] text-[var(--ui-text-2)] hover:border-[var(--ui-line-strong)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]")}
    >
      {children}
    </button>
  );
}

export function TestClient() {
  const router = useRouter();
  const { locale } = useI18n();
  const { user, register } = useAuth();
  const [step, setStep] = useState(() => loadStoredProgress()?.step ?? 0);
  const [responses, setResponses] = useState<Record<number, AnswerChoice>>(() => loadStoredProgress()?.responses ?? {});
  const [zodiac, setZodiac] = useState<ZodiacSign>("Pisces");
  const [occasion, setOccasion] = useState<OccasionTag>("date night");
  const [style, setStyle] = useState<StyleTag>("elegant");
  const [budgetMax, setBudgetMax] = useState(500);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [registrationSkipped, setRegistrationSkipped] = useState(false);

  const isZh = locale === "zh";
  const steps = isZh ? stepsZh : stepsEn;
  const questions = isZh ? jmtiQuestions : jmtiQuestionsEn;
  const basis = isZh ? jmtiBasis : jmtiBasisEn;
  const occasions = isZh ? occasionsZh : occasionsEn;
  const styles = isZh ? stylesZh : stylesEn;
  const copy = isZh ? {
    title: "用直觉选择，建立你的珠宝风格坐标。", intro: "30 个直觉选择，约 4 分钟。没有正确答案，只需选择更接近你的那一项。",
    progress: "测试进度", dimensions: "四种维度，构成你的身份坐标。", method: "了解测试方法",
    continue: "继续下一部分", extra: "补充推荐条件", zodiac: "星座", occasion: "今天的场景", style: "偏好风格", budget: "价格筛选", finish: "生成今日身份卡",
    save: "保存身份档案", saveTitle: "注册后可保存 JMTI 档案（可选）。", saveBody: "档案会保存测试结果、预算与推荐偏好，并在登录设备间同步。你也可以跳过注册，直接继续测试。",
    name: "昵称", email: "邮箱", password: "密码", creating: "创建中...", create: "创建档案", skip: "跳过，继续测试",
  } : {
    title: "Choose by instinct. Map your jewellery identity.", intro: "30 intuitive choices in about four minutes. There are no correct answers — choose what feels closer to you.",
    progress: "Reading progress", dimensions: "Four dimensions compose your identity coordinate.", method: "About the method",
    continue: "Continue to the next part", extra: "Refine your recommendation", zodiac: "Zodiac", occasion: "Today’s occasion", style: "Preferred style", budget: "Price range", finish: "Create today’s identity card",
    save: "Save your identity", saveTitle: "Create an optional profile to save your JMTI reading.", saveBody: "Your reading, budget and preferences can sync between signed-in devices. You may also skip registration and continue.",
    name: "Name", email: "Email", password: "Password", creating: "Creating...", create: "Create profile", skip: "Skip and continue",
  };
  const activeStep = steps[step];
  const activeQuestions = useMemo(
    () => questions.filter((question) => question.dimension === activeStep.dimension),
    [activeStep.dimension, questions],
  );
  const answeredInStep = activeQuestions.filter((question) => responses[question.id]).length;
  const stepComplete = answeredInStep === activeQuestions.length;
  const needsRegistration = step === 0 && stepComplete && !user && !registrationSkipped;
  const answeredTotal = Object.keys(responses).length;

  useEffect(() => {
    sessionStorage.setItem(TEST_PROGRESS_KEY, JSON.stringify({ step, responses }));
  }, [step, responses]);

  function choose(questionId: number, answer: AnswerChoice) {
    setResponses((current) => ({ ...current, [questionId]: answer }));
  }

  async function createProfile(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthNotice(null);
    const result = await register(email, password, name || "Stylix Member");
    setAuthLoading(false);
    if (!result.ok) {
      setAuthError(isZh ? "请输入有效邮箱，并设置至少 6 位密码。" : "Enter a valid email and a password of at least six characters.");
      return;
    }
    if (result.requiresConfirmation) setAuthNotice(isZh ? "验证邮件已发送。你可以继续测试，验证后档案会自动同步。" : "A verification email has been sent. You may continue; your profile will sync after verification.");
    setStep(1);
  }

  function skipRegistration() {
    setRegistrationSkipped(true);
    setStep(1);
  }

  function nextStep() {
    if (!stepComplete) return;
    if (step < steps.length - 1) setStep((value) => value + 1);
  }

  function finish() {
    if (answeredTotal !== questions.length) return;
    const result = evaluateJmti(responses);
    const answers: IdentityAnswers = {
      jmtiCode: result.code,
      jmtiScores: result.scores,
      matchPercent: result.matchPercent,
      zodiac,
      occasion,
      style,
      budgetMax,
      email: user?.email ?? email,
      name: user?.name ?? name,
    };
    sessionStorage.removeItem(TEST_PROGRESS_KEY);
    storeIdentityAnswers(answers);
    router.push("/result");
  }

  return (
    <div className="ui-page">
      <header className="border-b border-[var(--ui-line)]">
        <div className="ui-container py-10"><div className="flex min-w-0 flex-col justify-between gap-6 md:flex-row md:items-end"><div className="min-w-0 max-w-full"><p className="ui-eyebrow">JMTI · Jewelry identity index</p><h1 className="ui-title mt-4">{copy.title}</h1></div><p className="ui-copy max-w-sm">{copy.intro}</p></div><div className="mt-8 h-px bg-[var(--ui-line)]"><div className="h-px bg-[var(--ui-accent)] transition-all duration-500" style={{ width: `${(answeredTotal / questions.length) * 100}%` }} /></div></div>
      </header>
      <div className="ui-container py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] xl:gap-12">
          <aside className="min-w-0 border-b border-[var(--ui-line)] pb-7 lg:sticky lg:top-24 lg:h-fit lg:border-b-0 lg:pb-0 lg:pr-6">
            <p className="ui-eyebrow">{copy.progress} · {answeredTotal}/30</p>
            <h2 className="ui-heading mt-4">{copy.dimensions}</h2>
            <div className="mt-7 grid min-w-0 grid-cols-2 gap-2 overflow-hidden sm:grid-cols-4 lg:block lg:space-y-4 lg:overflow-visible">
              {steps.map((item, index) => {
                const isFutureStep = index > step;
                return (
                  <button
                    key={item.dimension}
                    type="button"
                    disabled={isFutureStep}
                    onClick={() => setStep(index)}
                    className={"flex min-w-0 flex-col items-center gap-2 border-b border-white/8 py-2 text-center lg:w-full lg:flex-row lg:gap-3 lg:text-left " + (isFutureStep ? "cursor-not-allowed opacity-35" : "cursor-pointer")}
                  >
                    <span className={"flex h-7 w-7 items-center justify-center border text-[10px] " + (step >= index ? "border-gold text-gold" : "border-ivory/15 text-ivory/30")}>{index + 1}</span>
                    <span className={(step >= index ? "text-ivory" : "text-ivory/35") + " text-[10px] lg:text-sm"}>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 border-t border-ivory/10 pt-5 lg:mt-8 lg:pt-6">
              <details className="group"><summary className="cursor-pointer list-none text-[10px] uppercase tracking-[0.28em] text-white/42 hover:text-[#c8a96b]">{copy.method} <span className="ml-2 group-open:hidden">+</span><span className="ml-2 hidden group-open:inline">−</span></summary><div className="mt-4 space-y-3 text-xs leading-6 text-white/42">{basis.map((item) => <p key={item}>{item}</p>)}</div></details>
            </div>
          </aside>

          <main className="ui-surface min-h-[620px] p-6 sm:p-8 lg:p-10 xl:p-12">
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="ui-eyebrow">Part {step + 1}</p>
                  <h2 className="ui-heading mt-3 max-w-3xl">{activeStep.title}</h2>
                  <p className="ui-copy mt-3 max-w-2xl">{activeStep.note}</p>
                </div>
                <p className="text-sm text-ivory/45">{answeredInStep} / {activeQuestions.length}</p>
              </div>

              <div className="mt-8 grid gap-4">
                {activeQuestions.map((question) => (
                  <article key={question.id} className="border-b border-[var(--ui-line)] py-6 first:pt-0">
                    <p className="font-serif text-lg leading-6 text-white"><span className="mr-3 text-sm text-[#c8a96b]">{String(question.id).padStart(2, "0")}</span>{question.prompt}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <OptionButton active={responses[question.id] === "A"} onClick={() => choose(question.id, "A")}>
                        <p className="text-xs text-current/45">A</p>
                        <p className="mt-1 text-sm leading-6">{question.optionA.text}</p>
                      </OptionButton>
                      <OptionButton active={responses[question.id] === "B"} onClick={() => choose(question.id, "B")}>
                        <p className="text-xs text-current/45">B</p>
                        <p className="mt-1 text-sm leading-6">{question.optionB.text}</p>
                      </OptionButton>
                    </div>
                  </article>
                ))}
              </div>

              {needsRegistration && (
                <form onSubmit={createProfile} className="mt-10 max-w-xl border border-gold/20 bg-gold/5 p-6">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">{copy.save}</p>
                  <h3 className="mt-2 font-serif text-2xl text-ivory">{copy.saveTitle}</h3>
                  <p className="mt-3 text-sm leading-6 text-ivory/55">{copy.saveBody}</p>
                  <div className="mt-5 grid gap-3">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.name} className="ui-field" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder={copy.email} className="ui-field" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required placeholder={copy.password} className="ui-field" />
                  </div>
                  {authError && <p className="mt-3 text-xs text-red-400">{authError}</p>}
                  {authNotice && <p className="mt-3 text-xs text-gold">{authNotice}</p>}
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <button disabled={authLoading} className="ui-button ui-button--primary">
                      {authLoading ? copy.creating : copy.create}
                    </button>
                    <button
                      type="button"
                      onClick={skipRegistration}
                      disabled={authLoading}
                      className="text-[11px] uppercase tracking-[0.23em] text-ivory/55 underline-offset-4 hover:text-gold hover:underline disabled:opacity-50"
                    >
                      {copy.skip}
                    </button>
                  </div>
                </form>
              )}

              {!needsRegistration && step < steps.length - 1 && (
                <button type="button" disabled={!stepComplete} onClick={nextStep} className="ui-button ui-button--primary mt-8">
                  {copy.continue}
                </button>
              )}

              {step === steps.length - 1 && (
                <div className="mt-10 border-t border-ivory/10 pt-8">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-gold/70">{copy.extra}</p>
                  <div className="mt-6 grid gap-8 xl:grid-cols-2">
                    <div>
                      <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-ivory/40">{copy.zodiac}</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {zodiacSigns.map((sign) => (
                          <OptionButton key={sign} active={zodiac === sign} onClick={() => setZodiac(sign)}>{isZh ? zodiacLabels[sign] : sign}</OptionButton>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-ivory/40">{copy.occasion}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {occasions.map((item) => (
                          <OptionButton key={item.value} active={occasion === item.value} onClick={() => setOccasion(item.value)}>{item.label}</OptionButton>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-ivory/40">{copy.style}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {styles.map((item) => (
                          <OptionButton key={item.value} active={style === item.value} onClick={() => setStyle(item.value)}>{item.label}</OptionButton>
                        ))}
                      </div>
                    </div>
                    <div className="border border-ivory/10 p-5">
                      <div className="flex justify-between gap-4">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/40">{copy.budget}</p>
                        <p className="font-serif text-xl text-gold">{"$" + budgetMax}</p>
                      </div>
                      <input type="range" min={150} max={2500} step={25} value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value))} className="mt-5 w-full accent-[#C9A962]" />
                    </div>
                  </div>
                  <button type="button" disabled={!stepComplete} onClick={finish} className="ui-button ui-button--primary mt-8">
                    {copy.finish}
                  </button>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
