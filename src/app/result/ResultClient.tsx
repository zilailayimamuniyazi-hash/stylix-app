"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { WishlistHeartButton } from "@/components/product/WishlistHeartButton";
import {
  buildDailyIdentityCard,
  getStoredIdentityAnswers,
  jmtiBasis,
  storeIdentityAnswers,
  type IdentityAnswers,
} from "@/lib/identity/engine";
import type { Product } from "@/lib/types/product";
import { ShareModal } from "@/components/share/ShareModal";
import { useI18n } from "@/lib/i18n/context";
import { productDisplay } from "@/lib/i18n/productCopy";
import type { Locale } from "@/lib/i18n/types";

const resultCopy: Record<Locale, Record<string, string>> = {
  en: { profile:"Identity Profile", missing:"You have not completed the JMTI jewelry identity reading yet. Complete the four-minute reading to reveal your personal recommendations.", start:"Begin Reading", today:"Today's Identity Card", match:"Match", noZodiac:"Zodiac not provided", color:"Lucky Color", gem:"Lucky Jewel", career:"Career Direction", wealth:"Wealth Direction", reason:"Why It Fits", budget:"Price Filter", share:"Share My Jewelry Identity", retake:"Retake Reading", save:"Save to Daily", outfit:"Today's Styling Card", entry:"Entry Recommendation", signature:"Signature Recommendation", atelier:"Atelier Direction", add:"Add to Bag", tryOn:"Try On", view:"View", basis:"Reading Method", inspiration:"Daily Inspiration", inspirationBody:"Your JMTI profile, zodiac tendency and occasion preferences shape a daily jewelry direction you can revisit for try-on and saved pieces.", bespoke:"Private Atelier" },
  zh: { profile:"身份档案", missing:"你还没有完成 JMTI 珠宝人格测试。用约四分钟生成身份档案后，这里会出现专属推荐。", start:"开始测试", today:"今日身份卡", match:"匹配度", noZodiac:"未填写星座", color:"幸运色", gem:"幸运珠宝", career:"事业运提示", wealth:"财富运提示", reason:"推荐理由", budget:"价格筛选", share:"分享我的珠宝人格", retake:"重新测试", save:"保存到每日身份", outfit:"今日穿搭卡片", entry:"入门推荐", signature:"标志推荐", atelier:"高定方向", add:"加入购物袋", tryOn:"虚拟试戴", view:"查看详情", basis:"测试依据", inspiration:"每日灵感", inspirationBody:"你的 JMTI、星座倾向与场景偏好会共同生成每日珠宝建议，随时可以回到推荐卡继续试戴与收藏。", bespoke:"去私人定制" },
  fr: { profile:"Profil d’identité", missing:"Vous n’avez pas encore terminé la lecture JMTI. Quatre minutes suffisent pour révéler vos recommandations personnelles.", start:"Commencer", today:"Carte d’identité du jour", match:"Compatibilité", noZodiac:"Signe non renseigné", color:"Couleur porte-bonheur", gem:"Pierre porte-bonheur", career:"Orientation professionnelle", wealth:"Orientation patrimoniale", reason:"Pourquoi ce choix", budget:"Filtre de prix", share:"Partager mon identité", retake:"Refaire la lecture", save:"Enregistrer dans Daily", outfit:"Carte de style du jour", entry:"Sélection découverte", signature:"Sélection signature", atelier:"Direction atelier", add:"Ajouter au sac", tryOn:"Essayer", view:"Voir", basis:"Méthode de lecture", inspiration:"Inspiration quotidienne", inspirationBody:"Votre profil JMTI, votre signe et vos préférences façonnent une sélection quotidienne à retrouver à tout moment.", bespoke:"Atelier privé" },
  es: { profile:"Perfil de identidad", missing:"Aún no has completado la lectura JMTI. En unos cuatro minutos descubrirás tus recomendaciones personales.", start:"Comenzar", today:"Tarjeta de identidad de hoy", match:"Afinidad", noZodiac:"Signo no indicado", color:"Color de la suerte", gem:"Joya de la suerte", career:"Orientación profesional", wealth:"Orientación patrimonial", reason:"Por qué encaja", budget:"Filtro de precio", share:"Compartir mi identidad", retake:"Repetir lectura", save:"Guardar en Daily", outfit:"Tarjeta de estilo de hoy", entry:"Recomendación inicial", signature:"Recomendación distintiva", atelier:"Dirección de atelier", add:"Añadir a la bolsa", tryOn:"Probar", view:"Ver", basis:"Método de lectura", inspiration:"Inspiración diaria", inspirationBody:"Tu perfil JMTI, signo y preferencias crean una orientación diaria que puedes volver a consultar.", bespoke:"Atelier privado" },
  de: { profile:"Identitätsprofil", missing:"Sie haben die JMTI-Lesung noch nicht abgeschlossen. In etwa vier Minuten entstehen Ihre persönlichen Empfehlungen.", start:"Lesung beginnen", today:"Heutige Identitätskarte", match:"Übereinstimmung", noZodiac:"Sternzeichen nicht angegeben", color:"Glücksfarbe", gem:"Glücksschmuck", career:"Berufliche Richtung", wealth:"Wertorientierung", reason:"Warum es passt", budget:"Preisfilter", share:"Meine Identität teilen", retake:"Lesung wiederholen", save:"In Daily speichern", outfit:"Heutige Styling-Karte", entry:"Einstiegsempfehlung", signature:"Signature-Empfehlung", atelier:"Atelier-Richtung", add:"In die Tasche", tryOn:"Anprobieren", view:"Ansehen", basis:"Lesemethode", inspiration:"Tägliche Inspiration", inspirationBody:"JMTI-Profil, Sternzeichen und Anlasspräferenzen formen Ihre tägliche Schmuckauswahl.", bespoke:"Privates Atelier" },
  ja: { profile:"アイデンティティプロフィール", missing:"JMTIジュエリー診断がまだ完了していません。約4分の診断で、あなただけの提案が表示されます。", start:"診断を始める", today:"今日のアイデンティティカード", match:"適合度", noZodiac:"星座未入力", color:"ラッキーカラー", gem:"ラッキージュエリー", career:"仕事運の方向", wealth:"財運の方向", reason:"おすすめの理由", budget:"価格フィルター", share:"診断結果を共有", retake:"もう一度診断", save:"Dailyに保存", outfit:"今日のスタイリングカード", entry:"入門セレクション", signature:"シグネチャーセレクション", atelier:"アトリエ提案", add:"バッグに追加", tryOn:"試着する", view:"詳細を見る", basis:"診断方法", inspiration:"毎日のインスピレーション", inspirationBody:"JMTI、星座、シーンの好みから、毎日のジュエリー提案が生まれます。", bespoke:"プライベートアトリエ" },
  ko: { profile:"아이덴티티 프로필", missing:"아직 JMTI 주얼리 진단을 완료하지 않았습니다. 약 4분의 진단 후 맞춤 추천을 확인할 수 있습니다.", start:"진단 시작", today:"오늘의 아이덴티티 카드", match:"일치도", noZodiac:"별자리 미입력", color:"행운의 색", gem:"행운의 주얼리", career:"커리어 방향", wealth:"자산 방향", reason:"추천 이유", budget:"가격 필터", share:"내 주얼리 아이덴티티 공유", retake:"다시 진단", save:"Daily에 저장", outfit:"오늘의 스타일링 카드", entry:"입문 추천", signature:"시그니처 추천", atelier:"아틀리에 방향", add:"백에 담기", tryOn:"가상 착용", view:"자세히 보기", basis:"진단 방식", inspiration:"데일리 영감", inspirationBody:"JMTI와 별자리, 상황 선호를 바탕으로 매일 새로운 주얼리 방향을 제안합니다.", bespoke:"프라이빗 아틀리에" },
  ar: { profile:"ملف الهوية", missing:"لم تكملي قراءة هوية المجوهرات JMTI بعد. تستغرق القراءة نحو أربع دقائق لتظهر توصياتك الخاصة.", start:"ابدئي القراءة", today:"بطاقة هوية اليوم", match:"نسبة التوافق", noZodiac:"لم يُحدد البرج", color:"لون الحظ", gem:"جوهرة الحظ", career:"التوجه المهني", wealth:"التوجه المالي", reason:"لماذا تناسبك", budget:"تصفية السعر", share:"مشاركة هويتي", retake:"إعادة القراءة", save:"الحفظ في Daily", outfit:"بطاقة تنسيق اليوم", entry:"اختيار تمهيدي", signature:"اختيار مميز", atelier:"اتجاه الأتيليه", add:"أضيفي إلى الحقيبة", tryOn:"تجربة افتراضية", view:"عرض", basis:"منهج القراءة", inspiration:"إلهام يومي", inspirationBody:"يشكل ملف JMTI والبرج وتفضيلات المناسبة اقتراحك اليومي للمجوهرات.", bespoke:"الأتيليه الخاص" },
};

const resultDynamic: Record<Locale, { description:string; color:string; gem:string; career:string; wealth:string; reason:string; mantra:string; styling:string; basis:string[] }> = {
  en: { description:"A personal balance of material, occasion, individuality and presence defines your jewelry language.", color:"Pearl white / warm gold", gem:"Pearl / gemstone / gold", career:"Choose stable materials and a clear silhouette to strengthen focus and considered decisions today.", wealth:"A clear budget and lasting wear create value.", reason:"Your recommendations combine JMTI, occasion, budget, material and style signals from the collection.", mantra:"Jewelry shaped by your identity.", styling:"Wear the signature selection as the focal point, keeping the surrounding materials quiet and proportionate.", basis:["JMTI reads four jewelry dimensions: reason or emotion, everyday or occasion, independent or classic, and discreet or expressive.","Thirty intuitive choices form the four-letter identity code and its match strength."] },
  zh: { description:"", color:"", gem:"", career:"", wealth:"", reason:"", mantra:"", styling:"", basis:jmtiBasis },
  fr: { description:"Un équilibre personnel entre matière, occasion, singularité et présence définit votre langage joaillier.", color:"Blanc perle / or chaud", gem:"Perle / pierre / or", career:"Privilégiez des matières durables et une ligne claire pour soutenir votre concentration aujourd’hui.", wealth:"Un budget précis et une pièce souvent portée créent une valeur durable.", reason:"La sélection associe JMTI, occasion, budget, matières et style.", mantra:"Une joaillerie façonnée par votre identité.", styling:"Portez la sélection signature comme point central, avec des matières sobres autour.", basis:["JMTI lit quatre dimensions de l’identité joaillière.","Trente choix intuitifs composent le code à quatre lettres et son niveau d’affinité."] },
  es: { description:"El equilibrio entre material, ocasión, individualidad y presencia define tu lenguaje joyero.", color:"Blanco perla / oro cálido", gem:"Perla / gema / oro", career:"Elige materiales duraderos y una silueta clara para reforzar tu enfoque hoy.", wealth:"Un presupuesto claro y el uso frecuente crean valor duradero.", reason:"La selección combina JMTI, ocasión, presupuesto, material y estilo.", mantra:"Joyería creada desde tu identidad.", styling:"Lleva la selección distintiva como pieza central y mantén el resto sereno y proporcionado.", basis:["JMTI interpreta cuatro dimensiones de identidad joyera.","Treinta elecciones intuitivas forman el código de cuatro letras y su afinidad."] },
  de: { description:"Das persönliche Gleichgewicht aus Material, Anlass, Individualität und Präsenz prägt Ihre Schmucksprache.", color:"Perlweiß / warmes Gold", gem:"Perle / Edelstein / Gold", career:"Beständige Materialien und eine klare Silhouette unterstützen heute Fokus und sichere Entscheidungen.", wealth:"Ein klares Budget und häufiges Tragen schaffen dauerhaften Wert.", reason:"Die Auswahl verbindet JMTI, Anlass, Budget, Material und Stil.", mantra:"Schmuck, geprägt von Ihrer Identität.", styling:"Tragen Sie die Signature-Auswahl als Mittelpunkt und halten Sie das Umfeld ruhig und ausgewogen.", basis:["JMTI liest vier Dimensionen der Schmuckidentität.","Dreißig intuitive Entscheidungen bilden den vierstelligen Code und seine Übereinstimmung."] },
  ja: { description:"素材、場面、個性、存在感のバランスが、あなた独自のジュエリー言語を形づくります。", color:"パールホワイト／ウォームゴールド", gem:"パール／宝石／ゴールド", career:"安定した素材と明確なシルエットが、今日の集中力と判断力を支えます。", wealth:"明確な予算と長く身につける価値が、確かな選択につながります。", reason:"JMTI、場面、予算、素材、スタイルを総合して選定しています。", mantra:"あなたの個性から生まれるジュエリー。", styling:"シグネチャー作品を主役にし、周囲の素材とバランスは静かに整えましょう。", basis:["JMTIはジュエリーの個性を4つの軸で読み解きます。","30の直感的な選択から4文字のコードと適合度を導きます。"] },
  ko: { description:"소재와 상황, 개성, 존재감의 균형이 당신만의 주얼리 언어를 완성합니다.", color:"펄 화이트 / 웜 골드", gem:"진주 / 보석 / 골드", career:"안정적인 소재와 명확한 실루엣이 오늘의 집중력과 판단을 돕습니다.", wealth:"분명한 예산과 오래 착용할 가치가 지속적인 만족을 만듭니다.", reason:"JMTI, 상황, 예산, 소재와 스타일 신호를 함께 반영한 추천입니다.", mantra:"당신의 정체성에서 시작된 주얼리.", styling:"시그니처 작품을 중심으로 두고 주변 소재와 비율은 차분하게 정리하세요.", basis:["JMTI는 주얼리 정체성을 네 가지 차원으로 해석합니다.","30개의 직관적 선택이 네 글자 코드와 일치도를 만듭니다."] },
  ar: { description:"يحدد التوازن بين الخامة والمناسبة والتفرد والحضور لغتك الخاصة في المجوهرات.", color:"أبيض لؤلؤي / ذهبي دافئ", gem:"لؤلؤ / حجر كريم / ذهب", career:"اختاري خامات ثابتة وخطاً واضحاً لتعزيز التركيز والقرار المتزن اليوم.", wealth:"الميزانية الواضحة وقيمة الاستخدام المتكرر تصنعان اختياراً مستداماً.", reason:"تجمع التوصيات بين JMTI والمناسبة والميزانية والخامة والأسلوب.", mantra:"مجوهرات صيغت من هويتك.", styling:"اجعلي الاختيار المميز محور الإطلالة مع الحفاظ على هدوء الخامات والتناسب حوله.", basis:["يقرأ JMTI هوية المجوهرات عبر أربعة أبعاد.","تكوّن ثلاثون إجابة حدسية الرمز الرباعي ونسبة التوافق."] },
};

function ResultLoadingSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="border border-gold/20 bg-gradient-to-b from-ink-soft/70 to-ink-deep p-7 shadow-luxury">
        <div className="h-3 w-24 animate-pulse rounded bg-ivory/10" />
        <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-ivory/10" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-ivory/10" />
        <div className="mt-5 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-ivory/10" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-ivory/10" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="h-20 animate-pulse border border-ivory/10 bg-ivory/5" />
          <div className="h-20 animate-pulse border border-ivory/10 bg-ivory/5" />
        </div>
        <div className="mt-8 space-y-5 border-t border-ivory/10 pt-7">
          <div className="h-16 animate-pulse rounded bg-ivory/10" />
          <div className="h-16 animate-pulse rounded bg-ivory/10" />
        </div>
      </section>
      <section className="space-y-6">
        <div className="h-32 animate-pulse border border-ivory/10 bg-ink-soft/25" />
        <div className="h-48 animate-pulse border border-ivory/10 bg-ink-soft/25" />
        <div className="h-48 animate-pulse border border-ivory/10 bg-ink-soft/25" />
      </section>
    </div>
  );
}

const scoreLabels = [
  ["L", "理性保值"],
  ["O", "情绪审美"],
  ["M", "日常常戴"],
  ["T", "仪式佩戴"],
  ["A", "小众设计"],
  ["S", "经典大众"],
  ["D", "低调内敛"],
  ["G", "亮眼吸睛"],
] as const;

function ProductTier({ label, product, onAdd, locale, copy }: { label: string; product: Product; onAdd: () => void; locale: Locale; copy: Record<string,string> }) {
  const display = productDisplay(product, locale);
  return (
    <article className="relative grid gap-5 border border-ivory/10 bg-ink-soft/25 p-4 sm:grid-cols-[150px_1fr]">
      <div className="absolute right-3 top-3 z-10">
        <WishlistHeartButton product={product} />
      </div>
      <Link href={"/product/" + product.slug} className="relative aspect-square overflow-hidden bg-ink-soft">
        <Image src={product.coverImage} alt={display.name} fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="150px" />
      </Link>
      <div className="flex min-w-0 flex-col justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.32em] text-gold/70">{label}</p>
          <h3 className="mt-2 font-serif text-2xl text-ivory">{display.name}</h3>
          <p className="mt-1 text-sm text-ivory/45">{display.subtitle}</p>
          <p className="mt-4 text-sm leading-6 text-ivory/62">{display.narrative}</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="font-serif text-xl text-gold">{"$" + product.price.toLocaleString()}</p>
          <button type="button" onClick={onAdd} className="border border-gold/35 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-ink-deep">
            {copy.add}
          </button>
          <Link href={"/try-on?piece=" + product.slug} className="text-[10px] uppercase tracking-[0.22em] text-ivory/45 hover:text-gold">
            {copy.tryOn}
          </Link>
          <Link href={"/product/" + product.slug} className="text-[10px] uppercase tracking-[0.22em] text-ivory/45 hover:text-gold">
            {copy.view}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ResultClient() {
  const { locale } = useI18n();
  const copy = resultCopy[locale];
  const dynamic = resultDynamic[locale];
  const [answers, setAnswers] = useState<IdentityAnswers | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const stored = getStoredIdentityAnswers();
    if (stored) setAnswers(stored);
    setLoaded(true);
  }, []);

  const card = useMemo(() => (answers ? buildDailyIdentityCard(answers) : null), [answers]);

  function updateBudget(value: number) {
    if (!answers) return;
    const next = { ...answers, budgetMax: value };
    setAnswers(next);
    storeIdentityAnswers(next);
  }

  if (!loaded) {
    return (
      <div className="ui-page">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <ResultLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!answers || !card) {
    return (
      <div className="ui-page">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="mx-auto max-w-lg border border-gold/20 bg-gradient-to-b from-ink-soft/70 to-ink-deep p-10 text-center shadow-luxury">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold/70">{copy.profile}</p>
          <p className="mt-6 text-sm leading-7 text-ivory/62">{copy.missing}</p>
            <Link href="/test" className="mt-8 inline-flex border border-gold/30 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-ink-deep">
              {copy.start}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tiers = [
    { label: copy.entry, product: card.products.entry },
    { label: copy.signature, product: card.products.signature },
    { label: copy.atelier, product: card.products.atelier },
  ];

  return (
    <div className="ui-page">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border border-gold/20 bg-gradient-to-b from-ink-soft/70 to-ink-deep p-7 shadow-luxury lg:sticky lg:top-24 lg:h-fit">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold/70">{copy.today}</p>
            <h1 className="mt-5 font-serif text-5xl leading-none text-ivory">{locale === "zh" ? card.title : card.jmtiType.alias}</h1>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-ivory/35">
              JMTI {answers.jmtiCode} / {copy.match} {card.matchPercent}% / {answers.zodiac ?? copy.noZodiac}
            </p>
            <p className="mt-5 text-sm leading-7 text-ivory/62">{locale === "zh" ? card.jmtiType.description : dynamic.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-ivory/10 p-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-ivory/35">{copy.color}</p>
                <p className="mt-2 font-serif text-2xl text-gold">{locale === "zh" ? card.luckyColor : dynamic.color}</p>
              </div>
              <div className="border border-ivory/10 p-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-ivory/35">{copy.gem}</p>
                <p className="mt-2 font-serif text-2xl text-gold">{locale === "zh" ? card.luckyGemstone : dynamic.gem}</p>
              </div>
            </div>

            <div className="mt-8 space-y-5 border-t border-ivory/10 pt-7">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">{copy.career}</p>
                <p className="mt-2 text-sm leading-6 text-ivory/65">{locale === "zh" ? card.careerSignal : dynamic.career}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">{copy.wealth}</p>
                <p className="mt-2 text-sm leading-6 text-ivory/65">{locale === "zh" ? card.wealthSignal : `${dynamic.wealth} $${answers.budgetMax.toLocaleString()}.`}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">{copy.reason}</p>
                <p className="mt-2 text-sm leading-6 text-ivory/65">{locale === "zh" ? card.recommendationReason : `${dynamic.reason} JMTI ${answers.jmtiCode} · ${answers.matchPercent}%.`}</p>
              </div>
            </div>

            <div className="mt-8 border border-ivory/10 p-5">
              <div className="flex justify-between gap-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/40">{copy.budget}</p>
                <p className="font-serif text-xl text-gold">{"$" + answers.budgetMax}</p>
              </div>
              <input aria-label={copy.budget} type="range" min={150} max={2500} step={25} value={answers.budgetMax} onChange={(e) => updateBudget(Number(e.target.value))} className="mt-5 w-full accent-[#C9A962]" />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-2 border border-gold/40 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold/10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                {copy.share}
              </button>
              <Link href="/test" className="border border-ivory/15 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-ivory/55 hover:border-gold/40 hover:text-gold">
                {copy.retake}
              </Link>
              <Link href="/daily" className="border border-gold/30 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-gold hover:bg-gold hover:text-ink-deep">
                {copy.save}
              </Link>
            </div>
          </section>

          <section>
            <div className="border border-ivory/10 bg-ink-soft/25 p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">{copy.outfit}</p>
              <p className="mt-4 font-serif text-2xl leading-snug text-ivory">{locale === "zh" ? card.mantra : `${card.jmtiType.alias} — ${dynamic.mantra}`}</p>
              <p className="mt-4 text-sm leading-7 text-ivory/62">{locale === "zh" ? card.stylingNote : dynamic.styling}</p>
            </div>

            <div className="mt-6 grid gap-5">
              {tiers.map((tier) => (
                <ProductTier key={tier.label + tier.product.id} label={tier.label} product={tier.product} locale={locale} copy={copy} onAdd={() => addItem(tier.product)} />
              ))}
            </div>

            <div className="mt-6 border border-dashed border-gold/20 p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">{copy.basis}</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-3 text-sm leading-6 text-ivory/55">
                  {dynamic.basis.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {scoreLabels.map(([letter, label]) => (
                    <div key={letter} className="border border-ivory/10 px-3 py-2">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-ivory/35">{letter}{locale === "zh" ? ` ${label}` : ""}</p>
                      <p className="mt-1 font-serif text-xl text-gold">{answers.jmtiScores[letter]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border border-dashed border-gold/20 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">{copy.inspiration}</p>
                <p className="mt-3 text-sm leading-6 text-ivory/55">{copy.inspirationBody}</p>
              </div>
              <Link href="/vip-atelier" className="inline-flex justify-center bg-gold px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-ink-deep">
                {copy.bespoke}
              </Link>
            </div>
          </section>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        jmtiCode={answers.jmtiCode}
        profile={card.jmtiType}
        scores={answers.jmtiScores}
        matchPercent={card.matchPercent}
      />
    </div>
  );
}
