import { products } from "@/lib/data/products";
import type { MoodTag, OccasionTag, Product, StyleTag } from "@/lib/types/product";

export type JmtiCode =
  | "LMSD" | "LMSG" | "LTSD" | "LTSG"
  | "LMAD" | "LMAG" | "LTAD" | "LTAG"
  | "OMSD" | "OMSG" | "OTSD" | "OTSG"
  | "OMAD" | "OMAG" | "OTAD" | "OTAG";

export type JmtiLetter = "L" | "O" | "M" | "T" | "A" | "S" | "D" | "G";
export type JmtiDimension = "LO" | "MT" | "AS" | "DG";
export type JmtiScores = Record<JmtiLetter, number>;

export type ZodiacSign =
  | "Aries" | "Taurus" | "Gemini" | "Cancer" | "Leo" | "Virgo"
  | "Libra" | "Scorpio" | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";

export interface JmtiQuestion {
  id: number;
  dimension: JmtiDimension;
  prompt: string;
  optionA: { letter: JmtiLetter; text: string };
  optionB: { letter: JmtiLetter; text: string };
}

export interface JmtiProfile {
  code: JmtiCode;
  alias: string;
  nameCn: string;
  nickname: string;
  description: string;
  keywords: string[];
  style: StyleTag;
  mood: MoodTag;
  gemstone: string;
  luckyColor: string;
  materialTerms: string[];
  colorTerms: string[];
  recommendationAngle: string;
}

export interface IdentityAnswers {
  jmtiCode: JmtiCode;
  jmtiScores: JmtiScores;
  matchPercent: number;
  zodiac?: ZodiacSign;
  occasion?: OccasionTag;
  style?: StyleTag;
  budgetMax: number;
  email?: string;
  name?: string;
}

export interface DailyIdentityCard {
  id: string;
  title: string;
  archetype: string;
  luckyColor: string;
  luckyGemstone: string;
  careerSignal: string;
  wealthSignal: string;
  mantra: string;
  stylingNote: string;
  recommendationReason: string;
  matchPercent: number;
  jmtiType: JmtiProfile;
  products: {
    entry: Product;
    signature: Product;
    atelier: Product;
  };
}

export const jmtiTypes: Record<JmtiCode, JmtiProfile> = {
  LMSD: {
    code: "LMSD",
    alias: "JADE",
    nameCn: "守玉人",
    nickname: "理性、日常、经典、低调",
    description: "重视长期价值与稳定佩戴感，偏好耐看、克制、有传承感的珠宝。",
    keywords: ["保值", "耐戴", "温润", "长期主义"],
    style: "classic",
    mood: "polished",
    gemstone: "翡翠 / 玉石",
    luckyColor: "温润玉白",
    materialTerms: ["jade", "emerald", "gold", "heritage"],
    colorTerms: ["white", "green", "gold"],
    recommendationAngle: "优先推荐材质稳定、线条干净、可长期佩戴的经典款。",
  },
  LMSG: {
    code: "LMSG",
    alias: "DIAM",
    nameCn: "钻石手",
    nickname: "理性、日常、经典、亮眼",
    description: "喜欢日常也能显贵的珠宝，重视成色、切工、闪度和社交辨识度。",
    keywords: ["闪度", "通勤显贵", "钻石感", "精致"],
    style: "elegant",
    mood: "confident",
    gemstone: "钻石 / 莫桑石",
    luckyColor: "清透银白",
    materialTerms: ["diamond", "moissanite", "white gold", "zirconia"],
    colorTerms: ["white", "silver"],
    recommendationAngle: "优先推荐高亮度石材、日常可戴但存在感明确的款式。",
  },
  LTSD: {
    code: "LTSD",
    alias: "WARM",
    nameCn: "暖金客",
    nickname: "理性、仪式、经典、低调",
    description: "在日常里保留一点仪式感，偏好金色、暖调、细节克制的作品。",
    keywords: ["暖调", "稳定", "仪式感", "质感"],
    style: "classic",
    mood: "sensual",
    gemstone: "暖金 / 黄水晶",
    luckyColor: "蜂蜜金",
    materialTerms: ["gold", "citrine", "champagne", "yellow"],
    colorTerms: ["gold", "yellow", "warm"],
    recommendationAngle: "优先推荐暖金属、低饱和光泽和可重复搭配的款式。",
  },
  LTSG: {
    code: "LTSG",
    alias: "GOLD",
    nameCn: "素圈控",
    nickname: "理性、仪式、经典、亮眼",
    description: "喜欢一眼看出质感的简洁珠宝，线条越纯粹，越能体现判断力。",
    keywords: ["素圈", "金属重量", "清晰轮廓", "高级日常"],
    style: "minimal",
    mood: "powerful",
    gemstone: "足金 / K金",
    luckyColor: "高光金",
    materialTerms: ["gold", "satin", "polished", "signet"],
    colorTerms: ["gold"],
    recommendationAngle: "优先推荐金属体量明确、造型简洁、适合单戴的珠宝。",
  },
  LMAD: {
    code: "LMAD",
    alias: "STONE",
    nameCn: "矿石藏家",
    nickname: "理性、日常、小众、低调",
    description: "会被天然纹理、矿物故事和独特材质吸引，喜欢越看越有细节的作品。",
    keywords: ["矿物", "纹理", "收藏", "小众"],
    style: "minimalist",
    mood: "dreamy",
    gemstone: "月光石 / 天然矿石",
    luckyColor: "烟灰矿色",
    materialTerms: ["moonstone", "onyx", "stone", "aquamarine", "amethyst"],
    colorTerms: ["grey", "blue", "mist"],
    recommendationAngle: "优先推荐天然感强、材质叙事清晰、不过度闪耀的款式。",
  },
  LMAG: {
    code: "LMAG",
    alias: "RARE",
    nameCn: "彩宝投资人",
    nickname: "理性、日常、小众、亮眼",
    description: "懂得用稀缺感建立个人标签，偏好彩宝、特殊切割和有记忆点的颜色。",
    keywords: ["彩宝", "稀缺", "投资感", "辨识度"],
    style: "bold",
    mood: "confident",
    gemstone: "蓝宝石 / 彩色宝石",
    luckyColor: "宝石蓝",
    materialTerms: ["sapphire", "ruby", "opal", "garnet", "gem"],
    colorTerms: ["blue", "red", "color", "spectrum"],
    recommendationAngle: "优先推荐彩色宝石、强识别色和适合建立个人标签的款式。",
  },
  LTAD: {
    code: "LTAD",
    alias: "BLACK",
    nameCn: "冷石匠",
    nickname: "理性、仪式、小众、低调",
    description: "喜欢冷感、结构、暗色和有边界感的珠宝，表达锋利但不张扬。",
    keywords: ["冷感", "结构", "暗色", "克制"],
    style: "minimal",
    mood: "powerful",
    gemstone: "黑玛瑙 / 黑钻",
    luckyColor: "曜石黑",
    materialTerms: ["onyx", "black", "rhodium", "silver", "white gold"],
    colorTerms: ["black", "charcoal", "silver"],
    recommendationAngle: "优先推荐冷色金属、暗色石材和结构感强的设计。",
  },
  LTAG: {
    code: "LTAG",
    alias: "CUT",
    nameCn: "切割玩家",
    nickname: "理性、仪式、小众、亮眼",
    description: "对切割、比例、反光和造型实验敏感，适合有技术感的高存在珠宝。",
    keywords: ["切割", "实验", "反光", "造型"],
    style: "bold",
    mood: "powerful",
    gemstone: "异形切割宝石",
    luckyColor: "锐光银",
    materialTerms: ["cut", "diamond", "moissanite", "white gold", "zirconia"],
    colorTerms: ["silver", "white", "electric"],
    recommendationAngle: "优先推荐异形结构、强反光材质和适合仪式场景的作品。",
  },
  OMSD: {
    code: "OMSD",
    alias: "PEARL",
    nameCn: "柔光少女",
    nickname: "情绪、日常、经典、低调",
    description: "偏好柔和、亲近、细腻的珠宝，适合把日常穿搭变得有温度。",
    keywords: ["珍珠", "柔光", "亲和", "细腻"],
    style: "romantic",
    mood: "sensual",
    gemstone: "珍珠",
    luckyColor: "珍珠白",
    materialTerms: ["pearl", "moonstone", "rose gold", "soft"],
    colorTerms: ["pearl", "white", "rose"],
    recommendationAngle: "优先推荐柔光感、圆润线条和适合贴身佩戴的款式。",
  },
  OMSG: {
    code: "OMSG",
    alias: "MILK",
    nameCn: "蜜蜡暖客",
    nickname: "情绪、日常、经典、亮眼",
    description: "喜欢温暖、显气色、有亲和力但能被看见的珠宝。",
    keywords: ["暖白", "蜜蜡", "显气色", "柔亮"],
    style: "elegant",
    mood: "playful",
    gemstone: "蜜蜡 / 黄玉",
    luckyColor: "奶油蜜金",
    materialTerms: ["amber", "citrine", "gold", "rose gold"],
    colorTerms: ["honey", "yellow", "gold", "cream"],
    recommendationAngle: "优先推荐暖色、亲和、适合日常社交的亮面作品。",
  },
  OTSD: {
    code: "OTSD",
    alias: "LUNA",
    nameCn: "宴会月光",
    nickname: "情绪、仪式、经典、低调",
    description: "适合在重要场合保持温柔存在感，偏好月光感、流线和轻仪式。",
    keywords: ["月光", "宴会", "温柔", "流线"],
    style: "celestial",
    mood: "dreamy",
    gemstone: "月光石 / 珍珠",
    luckyColor: "月雾银",
    materialTerms: ["moon", "moonstone", "pearl", "white gold"],
    colorTerms: ["silver", "white", "mist"],
    recommendationAngle: "优先推荐月相、珍珠光和适合晚间场合的柔亮珠宝。",
  },
  OTSG: {
    code: "OTSG",
    alias: "BANQUET",
    nameCn: "宴会主",
    nickname: "情绪、仪式、经典、亮眼",
    description: "天生适合完整造型和高光场合，珠宝需要承担主角级视觉任务。",
    keywords: ["宴会", "套装", "主角", "高光"],
    style: "elegant",
    mood: "powerful",
    gemstone: "钻石 / 彩宝套装",
    luckyColor: "香槟星光",
    materialTerms: ["diamond", "zirconia", "gold", "set", "spectrum"],
    colorTerms: ["gold", "white", "spectrum"],
    recommendationAngle: "优先推荐套装、强光泽和适合完整出场的珠宝组合。",
  },
  OMAD: {
    code: "OMAD",
    alias: "MOON",
    nameCn: "月光仙",
    nickname: "情绪、日常、小众、低调",
    description: "喜欢有诗意和灵性的珠宝，偏爱轻盈、留白、梦境感和不撞款。",
    keywords: ["月光", "留白", "灵性", "梦境"],
    style: "celestial",
    mood: "dreamy",
    gemstone: "月光石 / 紫水晶",
    luckyColor: "淡紫月光",
    materialTerms: ["moonstone", "amethyst", "aquamarine", "open form"],
    colorTerms: ["violet", "mist", "blue"],
    recommendationAngle: "优先推荐轻盈线条、星月意象和带有情绪叙事的款式。",
  },
  OMAG: {
    code: "OMAG",
    alias: "ART",
    nameCn: "艺术匠",
    nickname: "情绪、日常、小众、亮眼",
    description: "把珠宝当作自我表达的一部分，适合艺术感、混搭、强记忆点作品。",
    keywords: ["艺术", "混搭", "表达", "记忆点"],
    style: "romantic",
    mood: "playful",
    gemstone: "欧泊 / 彩色宝石",
    luckyColor: "虹彩",
    materialTerms: ["opal", "spectrum", "mixed", "gemini", "turquoise"],
    colorTerms: ["spectrum", "color", "rose"],
    recommendationAngle: "优先推荐混合材质、彩色元素和带个人表达的设计师款。",
  },
  OTAD: {
    code: "OTAD",
    alias: "SILV",
    nameCn: "银潮人",
    nickname: "情绪、仪式、小众、低调",
    description: "偏好冷银、未来感、轻反叛和时装语境，适合克制但有态度的珠宝。",
    keywords: ["银色", "潮流", "未来感", "态度"],
    style: "minimalist",
    mood: "confident",
    gemstone: "银饰 / 海蓝宝",
    luckyColor: "冷银蓝",
    materialTerms: ["silver", "white gold", "aquamarine", "rhodium"],
    colorTerms: ["silver", "blue", "electric"],
    recommendationAngle: "优先推荐冷色金属、开放结构和可接入时装造型的款式。",
  },
  OTAG: {
    code: "OTAG",
    alias: "VINT",
    nameCn: "复古造梦师",
    nickname: "情绪、仪式、小众、亮眼",
    description: "偏好复古故事、戏剧感和被记住的细节，珠宝越像一段梦越好。",
    keywords: ["复古", "戏剧", "故事", "高辨识"],
    style: "bold",
    mood: "sensual",
    gemstone: "石榴石 / 复古彩宝",
    luckyColor: "酒红金",
    materialTerms: ["garnet", "ruby", "vintage", "gold", "opal"],
    colorTerms: ["wine", "red", "gold"],
    recommendationAngle: "优先推荐复古色、戏剧轮廓和适合拍照记忆的款式。",
  },
};

const zodiacGem: Record<ZodiacSign, { label: string; gemstone: string; color: string; signal: string }> = {
  Aries: { label: "白羊座", gemstone: "红宝石", color: "行动红", signal: "果断推进" },
  Taurus: { label: "金牛座", gemstone: "祖母绿", color: "稳金绿", signal: "稳定价值" },
  Gemini: { label: "双子座", gemstone: "黄水晶", color: "水星黄", signal: "表达与连接" },
  Cancer: { label: "巨蟹座", gemstone: "月光石", color: "珍珠白", signal: "情绪清晰" },
  Leo: { label: "狮子座", gemstone: "太阳石", color: "日冕金", signal: "可见自信" },
  Virgo: { label: "处女座", gemstone: "蓝宝石", color: "墨蓝", signal: "精准判断" },
  Libra: { label: "天秤座", gemstone: "欧泊", color: "玫瑰象牙", signal: "审美平衡" },
  Scorpio: { label: "天蝎座", gemstone: "石榴石", color: "深酒红", signal: "磁场专注" },
  Sagittarius: { label: "射手座", gemstone: "绿松石", color: "开阔天蓝", signal: "扩张好运" },
  Capricorn: { label: "摩羯座", gemstone: "黑玛瑙", color: "炭黑", signal: "长期纪律" },
  Aquarius: { label: "水瓶座", gemstone: "海蓝宝", color: "电光蓝", signal: "原创洞察" },
  Pisces: { label: "双鱼座", gemstone: "紫水晶", color: "紫雾", signal: "直觉时机" },
};

export const zodiacSigns = Object.keys(zodiacGem) as ZodiacSign[];
export const zodiacLabels = Object.fromEntries(zodiacSigns.map((sign) => [sign, zodiacGem[sign].label])) as Record<ZodiacSign, string>;
export const jmtiCodes = Object.keys(jmtiTypes) as JmtiCode[];

export const jmtiQuestions: JmtiQuestion[] = [
  { id: 1, dimension: "LO", prompt: "买珠宝时，你第一反应更关注什么？", optionA: { letter: "L", text: "材质、保值、耐戴程度" }, optionB: { letter: "O", text: "第一眼心动和情绪氛围" } },
  { id: 2, dimension: "LO", prompt: "如果预算有限，你更愿意把钱花在？", optionA: { letter: "L", text: "更可靠的材质和工艺" }, optionB: { letter: "O", text: "更打动我的造型故事" } },
  { id: 3, dimension: "LO", prompt: "别人夸你的珠宝时，你更开心听到？", optionA: { letter: "L", text: "这个很有质感、很值" }, optionB: { letter: "O", text: "这个很像你、很有感觉" } },
  { id: 4, dimension: "LO", prompt: "挑首饰前，你通常会？", optionA: { letter: "L", text: "比较参数、材质和价格" }, optionB: { letter: "O", text: "看它能不能激发想象" } },
  { id: 5, dimension: "LO", prompt: "一件珠宝最重要的是？", optionA: { letter: "L", text: "经得起时间检验" }, optionB: { letter: "O", text: "能承载当下的心情" } },
  { id: 6, dimension: "LO", prompt: "面对流行款，你会？", optionA: { letter: "L", text: "先判断是否耐看和值得买" }, optionB: { letter: "O", text: "如果情绪对了就愿意尝试" } },
  { id: 7, dimension: "LO", prompt: "你更相信哪种推荐？", optionA: { letter: "L", text: "基于材质、场景和价格的推荐" }, optionB: { letter: "O", text: "基于故事、星座和个人气质的推荐" } },
  { id: 8, dimension: "LO", prompt: "长期留下的珠宝，你希望它？", optionA: { letter: "L", text: "稳定、有价值、不过时" }, optionB: { letter: "O", text: "有记忆、有情绪、有个人痕迹" } },
  { id: 9, dimension: "MT", prompt: "你更常买哪类珠宝？", optionA: { letter: "M", text: "每天都能戴的款" }, optionB: { letter: "T", text: "为了某个重要时刻买的款" } },
  { id: 10, dimension: "MT", prompt: "出门前选首饰，你更希望它？", optionA: { letter: "M", text: "不费力，和衣橱都能搭" }, optionB: { letter: "T", text: "让今天有明确仪式感" } },
  { id: 11, dimension: "MT", prompt: "你对舒适度的要求是？", optionA: { letter: "M", text: "非常重要，要能久戴" }, optionB: { letter: "T", text: "重要场合可以为了效果让步" } },
  { id: 12, dimension: "MT", prompt: "你的首饰盒里更缺？", optionA: { letter: "M", text: "可反复使用的基础款" }, optionB: { letter: "T", text: "能撑住场面的主角款" } },
  { id: 13, dimension: "MT", prompt: "你更容易被哪句话打动？", optionA: { letter: "M", text: "这件可以每天戴" }, optionB: { letter: "T", text: "这件适合重要时刻" } },
  { id: 14, dimension: "MT", prompt: "如果只能带一件首饰旅行，你会选？", optionA: { letter: "M", text: "百搭、不挑衣服的" }, optionB: { letter: "T", text: "拍照和晚餐都出彩的" } },
  { id: 15, dimension: "MT", prompt: "你理想中的珠宝使用频率是？", optionA: { letter: "M", text: "一周多次" }, optionB: { letter: "T", text: "在对的时刻被认真佩戴" } },
  { id: 16, dimension: "AS", prompt: "你的审美更靠近？", optionA: { letter: "A", text: "小众、有设计感、不容易撞款" }, optionB: { letter: "S", text: "经典、大方、接受度高" } },
  { id: 17, dimension: "AS", prompt: "看到一件很特别的珠宝，你会？", optionA: { letter: "A", text: "想知道设计灵感和工艺" }, optionB: { letter: "S", text: "先判断是否适合大多数场合" } },
  { id: 18, dimension: "AS", prompt: "你更喜欢别人说你的珠宝？", optionA: { letter: "A", text: "好特别，哪里买的" }, optionB: { letter: "S", text: "好高级，很耐看" } },
  { id: 19, dimension: "AS", prompt: "你对品牌爆款的态度是？", optionA: { letter: "A", text: "太多人戴会降低兴趣" }, optionB: { letter: "S", text: "经得起流行说明值得考虑" } },
  { id: 20, dimension: "AS", prompt: "选礼物时你更倾向？", optionA: { letter: "A", text: "有故事、有个性的设计" }, optionB: { letter: "S", text: "不容易出错的经典款" } },
  { id: 21, dimension: "AS", prompt: "你更能接受哪种设计？", optionA: { letter: "A", text: "不对称、混搭、实验感" }, optionB: { letter: "S", text: "对称、完整、比例经典" } },
  { id: 22, dimension: "AS", prompt: "你理想的珠宝风格是？", optionA: { letter: "A", text: "像小型艺术品" }, optionB: { letter: "S", text: "像衣橱里的高级基础款" } },
  { id: 23, dimension: "DG", prompt: "你希望珠宝在造型里扮演？", optionA: { letter: "D", text: "靠近看才发现的细节" }, optionB: { letter: "G", text: "一眼能看到的亮点" } },
  { id: 24, dimension: "DG", prompt: "日常佩戴时你更舒服的是？", optionA: { letter: "D", text: "低调、轻量、不打扰" }, optionB: { letter: "G", text: "醒目、提气色、能被注意" } },
  { id: 25, dimension: "DG", prompt: "拍照时你会希望珠宝？", optionA: { letter: "D", text: "融入整体氛围" }, optionB: { letter: "G", text: "成为照片焦点" } },
  { id: 26, dimension: "DG", prompt: "你对闪耀度的偏好是？", optionA: { letter: "D", text: "微光、柔光、细闪" }, optionB: { letter: "G", text: "高光、强闪、存在感" } },
  { id: 27, dimension: "DG", prompt: "走进一个聚会，你更希望别人？", optionA: { letter: "D", text: "慢慢发现你的品味" }, optionB: { letter: "G", text: "马上看到你的状态" } },
  { id: 28, dimension: "DG", prompt: "你更常选择的戒指是？", optionA: { letter: "D", text: "细圈、小石、贴手" }, optionB: { letter: "G", text: "宽圈、大石、异形" } },
  { id: 29, dimension: "DG", prompt: "如果一件珠宝很美但很抢眼，你会？", optionA: { letter: "D", text: "犹豫，怕不好搭" }, optionB: { letter: "G", text: "兴奋，正好需要它" } },
  { id: 30, dimension: "DG", prompt: "你的理想光芒是？", optionA: { letter: "D", text: "像皮肤上有一层细光" }, optionB: { letter: "G", text: "像开场时的第一束追光" } },
];

export const jmtiBasis = [
  "JMTI 珠宝人格采用四维度：L/O、M/T、A/S、D/G。",
  "测试为 30 道 A/B 单选题：1-8 题统计 L/O，9-15 题统计 M/T，16-22 题统计 A/S，23-30 题统计 D/G。",
  "每个维度取高分字母组成四字母编码；同分时默认 L、M、S、D。",
  "匹配度按四个维度的得分差折算：每个维度最高 25 分，四项相加后四舍五入。",
];

const dimensionPairs: Record<JmtiDimension, [JmtiLetter, JmtiLetter, JmtiLetter]> = {
  LO: ["L", "O", "L"],
  MT: ["M", "T", "M"],
  AS: ["A", "S", "S"],
  DG: ["D", "G", "D"],
};

export function emptyJmtiScores(): JmtiScores {
  return { L: 0, O: 0, M: 0, T: 0, A: 0, S: 0, D: 0, G: 0 };
}

/** Safe profile lookup — falls back to a valid profile if the code is missing/corrupt. */
function resolveJmtiProfile(code: JmtiCode): JmtiProfile {
  return jmtiTypes[code] ?? jmtiTypes.LMSD;
}

export function evaluateJmti(responses: Record<number, "A" | "B">) {
  const scores = emptyJmtiScores();

  for (const question of jmtiQuestions) {
    const answer = responses[question.id];
    if (!answer) continue;
    scores[answer === "A" ? question.optionA.letter : question.optionB.letter] += 1;
  }

  const letters = (Object.keys(dimensionPairs) as JmtiDimension[]).map((dimension) => {
    const [left, right, fallback] = dimensionPairs[dimension];
    if (scores[left] === scores[right]) return fallback;
    return scores[left] > scores[right] ? left : right;
  });

  const matchPercent = Math.round(
    (Object.keys(dimensionPairs) as JmtiDimension[]).reduce((sum, dimension) => {
      const [left, right] = dimensionPairs[dimension];
      const total = jmtiQuestions.filter((question) => question.dimension === dimension).length;
      return sum + (Math.abs(scores[left] - scores[right]) / total) * 25;
    }, 0),
  );

  return {
    code: letters.join("") as JmtiCode,
    scores,
    matchPercent,
  };
}

function scoreProduct(product: Product, answers: IdentityAnswers) {
  const profile = resolveJmtiProfile(answers.jmtiCode);
  const searchable = [
    product.name,
    product.subtitle,
    product.material,
    product.symbolism,
    product.materialEnergy,
    product.tags.collectionName,
  ].join(" ").toLowerCase();
  let score = 0;

  for (const term of profile.materialTerms) {
    if (searchable.includes(term.toLowerCase())) score += 3;
  }
  for (const term of profile.colorTerms) {
    if (searchable.includes(term.toLowerCase())) score += 1;
  }
  if (product.tags.styleTags.includes(profile.style)) score += 3;
  if (product.tags.moodTags.includes(profile.mood)) score += 2;
  if (answers.style && product.tags.styleTags.includes(answers.style)) score += 2;
  if (answers.occasion && product.tags.occasionTags.includes(answers.occasion)) score += 4;
  if (answers.zodiac && product.zodiacAffinity?.includes(answers.zodiac)) score += 3;
  if (product.price <= answers.budgetMax) score += 2;
  if (product.tags.collectionCategory === "designer-capsule" && profile.code.includes("A")) score += 1;

  return score;
}

function pickByTier(sorted: Product[], budgetMax: number) {
  const withinBudget = sorted.filter((product) => product.price <= budgetMax);
  const pool = withinBudget.length ? withinBudget : sorted;
  const entry = pool.find((product) => product.budgetTier <= 1) ?? pool[0] ?? products[0];
  const signature = pool.find((product) => product.id !== entry.id && product.budgetTier <= 2) ?? pool[1] ?? entry;
  const atelier =
    sorted.find((product) => product.id !== entry.id && product.id !== signature.id && product.budgetTier >= 3) ??
    sorted[2] ??
    signature;

  return { entry, signature, atelier };
}

export function buildDailyIdentityCard(answers: IdentityAnswers): DailyIdentityCard {
  const profile = resolveJmtiProfile(answers.jmtiCode);
  const zodiac = answers.zodiac ? zodiacGem[answers.zodiac] : null;
  const sorted = [...products].sort((a, b) => scoreProduct(b, answers) - scoreProduct(a, answers));
  const selected = pickByTier(sorted, answers.budgetMax);
  const title = `${profile.alias} ${profile.nameCn}`;
  const occasionText = answers.occasion ? answers.occasion.replace("-", " ") : "今日场景";
  const zodiacText = answers.zodiac && zodiac ? zodiac.label : "未填写星座";

  return {
    id: `${answers.jmtiCode}-${answers.zodiac ?? "no-zodiac"}-${answers.occasion ?? "daily"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title,
    archetype: profile.nickname,
    luckyColor: zodiac ? `${profile.luckyColor} / ${zodiac.color}` : profile.luckyColor,
    luckyGemstone: zodiac ? `${profile.gemstone} / ${zodiac.gemstone}` : profile.gemstone,
    careerSignal: `事业运更适合用${profile.recommendationAngle.replace("优先推荐", "")}来强化判断力；${zodiac ? zodiac.signal : "保持稳定节奏"}是今天的关键词。`,
    wealthSignal: `财富运来自清晰预算和高频佩戴价值。当前筛选上限为 $${answers.budgetMax.toLocaleString()}，推荐从入门、标志款、高定三档里选择。`,
    mantra: `今天的你是 ${profile.alias} ${profile.nameCn}：${profile.description}`,
    stylingNote: `${selected.signature.name} 作为主件最合适。它会把 ${profile.keywords.slice(0, 2).join("、")} 的气质放大，同时保留 ${occasionText} 所需的穿搭完成度。`,
    recommendationReason:
      `依据 JMTI ${answers.jmtiCode}（${profile.nickname}）、${zodiacText}、${occasionText}、预算上限和珠宝库的材质/风格/语义标签进行匹配。当前人格匹配度 ${answers.matchPercent}%。`,
    matchPercent: answers.matchPercent,
    jmtiType: profile,
    products: selected,
  };
}

export function getStoredIdentityAnswers(): IdentityAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("stylix_identity_answers");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<IdentityAnswers> & { mbti?: string };
    if (!parsed.jmtiCode || parsed.mbti) return null;
    if (!(parsed.jmtiCode in jmtiTypes)) return null;
    return parsed as IdentityAnswers;
  } catch {
    return null;
  }
}

export function storeIdentityAnswers(answers: IdentityAnswers) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("stylix_identity_answers", JSON.stringify(answers));
}
