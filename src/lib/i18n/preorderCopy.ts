import type { Locale } from "./types";

type PreorderCopy = {
  badge: string;
  button: string;
  title: string;
  description: string;
  bagNote: string;
};

const copy: Record<Locale, PreorderCopy> = {
  en: {
    badge: "Pre-order",
    button: "Pre-order",
    title: "Made for your order",
    description: "This piece is available by pre-order. Please allow 7–14 business days for quality checks, assembly and dispatch before international transit begins.",
    bagNote: "Pre-order · Dispatches after 7–14 business days",
  },
  zh: {
    badge: "预售",
    button: "预订",
    title: "按订单制作",
    description: "本商品以预售形式销售。国际运输开始前，请预留 7–14 个工作日用于质检、组装和发货准备。",
    bagNote: "预售 · 7–14 个工作日后发货",
  },
  fr: {
    badge: "Précommande",
    button: "Précommander",
    title: "Préparé pour votre commande",
    description: "Cette pièce est disponible en précommande. Prévoyez 7 à 14 jours ouvrés pour le contrôle qualité, l’assemblage et l’expédition avant le transport international.",
    bagNote: "Précommande · Expédition sous 7 à 14 jours ouvrés",
  },
  es: {
    badge: "Preventa",
    button: "Reservar",
    title: "Preparado para tu pedido",
    description: "Esta pieza está disponible en preventa. El control de calidad, montaje y despacho requiere de 7 a 14 días laborables antes del transporte internacional.",
    bagNote: "Preventa · Envío en 7–14 días laborables",
  },
  de: {
    badge: "Vorbestellung",
    button: "Vorbestellen",
    title: "Für Ihre Bestellung vorbereitet",
    description: "Dieses Schmuckstück ist vorbestellbar. Bitte planen Sie vor dem internationalen Versand 7–14 Werktage für Qualitätskontrolle, Montage und Versandvorbereitung ein.",
    bagNote: "Vorbestellung · Versand nach 7–14 Werktagen",
  },
  ja: {
    badge: "予約販売",
    button: "予約注文",
    title: "ご注文後に仕上げます",
    description: "本商品は予約販売です。海外配送開始まで、検品・組み立て・発送準備に7〜14営業日ほどかかります。",
    bagNote: "予約販売 · 7〜14営業日後に発送",
  },
  ko: {
    badge: "예약 판매",
    button: "예약 주문",
    title: "주문 후 준비되는 제품",
    description: "이 제품은 예약 판매 상품입니다. 해외 배송 시작 전 검수, 조립 및 발송 준비에 영업일 기준 7~14일이 소요됩니다.",
    bagNote: "예약 판매 · 영업일 기준 7~14일 후 발송",
  },
  ar: {
    badge: "طلب مسبق",
    button: "اطلب مسبقاً",
    title: "يُجهّز خصيصاً لطلبك",
    description: "هذه القطعة متاحة بالطلب المسبق. يُرجى احتساب 7–14 يوم عمل لفحص الجودة والتجميع والتجهيز قبل بدء الشحن الدولي.",
    bagNote: "طلب مسبق · الشحن بعد 7–14 يوم عمل",
  },
};

export function getPreorderCopy(locale: Locale): PreorderCopy {
  return copy[locale];
}
