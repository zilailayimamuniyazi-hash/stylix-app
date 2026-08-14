"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

const exact: Record<string, string> = {
  "从材质开始，创造一件只属于你的作品。": "Begin with material. Create a piece that belongs only to you.",
  "每一步选择都会同步为可生产规格。先定义作品，再生成一份可供设计师确认的定制方案。": "Every choice updates a production-ready specification. Define the piece, then create a brief for designer review.",
  "5 类珠宝": "5 jewelry categories", "戒指、手镯、项链、耳饰与手链": "Rings, bangles, necklaces, earrings and bracelets",
  "规格实时联动": "Live specification updates", "尺寸、材质与 3D 预览同步更新": "Size, material and 3D preview update together",
  "投产前复核": "Pre-production review", "CAD、克重与天然材质批次最终确认": "Final confirmation of CAD, weight and natural-material batch",
  "戒指": "Rings", "手镯": "Bangles", "项链": "Necklaces", "耳饰": "Earrings", "手链": "Bracelets",
  "换个灵感": "New inspiration", "你的作品": "Your piece", "定制珠宝": "Custom jewelry", "配置": "Configure",
  "戒型": "Ring style", "镯型": "Bangle style", "项链款": "Necklace style", "耳饰款": "Earring style", "链型": "Bracelet style",
  "戒号": "Ring size", "圈口": "Inner diameter", "尺寸": "Size", "长度": "Length", "主件": "Centerpiece",
  "镯身材质": "Bangle material", "项链材质": "Necklace material", "主体材质": "Main material", "主件材质": "Centerpiece material",
  "主石": "Center stone", "金属色": "Metal", "配色方案": "Color palette", "逐珠搭配": "Bead editor", "表面工艺": "Finish", "刻字": "Engraving",
  "上一步": "Previous", "下一步": "Next", "保存规格草稿": "Save specification draft", "保存作品": "Save design", "保存图片": "Save image", "分享作品": "Share design",
  "提交给设计师确认": "Submit for designer review", "完成配置后提交": "Complete configuration to submit",
  "品类": "Category", "金属": "Metal", "工艺": "Finish", "生产规格单": "Production specification",
  "成品尺寸": "Finished size", "主材": "Primary material", "结构": "Structure", "石数 / 珠数": "Stone / bead count",
  "预估克重": "Estimated weight", "标准交期": "Standard lead time", "投产复核": "Production review", "见结构规格": "See structural specification",
  "当前为设计预估，最终克重、石级、损耗、工费与报价以 CAD、实物选料和工厂确认单为准。": "Current values are design estimates. Final weight, stone grade, loss, labor and quotation are subject to CAD, material selection and factory confirmation.",
  "素圈戒": "Plain band", "单钻戒": "Solitaire ring", "光环戒": "Halo ring", "三石戒": "Three-stone ring", "宽版戒": "Wide band", "满钻戒": "Eternity ring", "开口戒": "Open ring",
  "经典窄版": "Classic narrow profile", "四爪主石": "Four-prong center stone", "围镶光环": "Halo setting", "三石并置": "Three-stone composition", "利落宽面": "Clean wide profile", "整圈排镶": "Full pavé setting", "轻盈开口": "Light open form",
  "18K 古法金": "18K heritage gold", "柔和缎面": "Soft satin", "高光镜面": "High polish", "细腻磨砂": "Fine matte",
  "加载 3D 引擎...": "Loading 3D engine…", "加载模型...": "Loading model…", "预览暂不可用": "Preview unavailable",
  "当前设备未能加载 3D 预览。配置仍可保存，稍后可在支持 WebGL 的设备继续查看。": "This device could not load the 3D preview. You can still save the configuration and view it later on a WebGL-capable device.",
  "3D · 拖拽旋转 · 滚轮缩放": "3D · Drag to rotate · Scroll to zoom", "刻字内容": "Engraving text", "输入最多 12 个字符": "Enter up to 12 characters", "支持中文、英文与数字": "Supports letters and numbers",
  "重置": "Reset", "选择珠位，再指定晶石": "Select a bead position, then choose a crystal", "配色均按对称、重复或渐层规则生成，选择后仍可逐颗调整。": "Palettes follow symmetry, repetition or gradient rules and can still be adjusted bead by bead.",
  "关闭分享": "Close sharing", "复制链接": "Copy link", "3D 作品预览": "3D design preview",
  "分享链接会保留这件作品的全部选择，好友打开后可以继续查看和搭配。": "The share link preserves every choice so others can view and continue styling the design.",
  "可生产规格单": "Production specification sheet",
  "金属主体 · 工厂按确认版 CAD 制作": "Metal body · manufactured from the approved CAD",
  "戒号需使用标准戒圈复核；镶石款确认主石实测尺寸后开镶口": "Verify ring size with a standard ring gauge; for stone-set styles, confirm the measured center-stone dimensions before cutting the setting.",
  "下单后由 CAD 核算": "Calculated from CAD after order confirmation",
  "尺寸、表面与刻字内容需在投产前复核": "Size, finish and engraving must be reviewed before production",
};

const originalText = new WeakMap<Text, string>();

function translateText(value: string) {
  const trimmed = value.trim();
  if (exact[trimmed]) return value.replace(trimmed, exact[trimmed]);
  return value
    .replace(/(\d+)号/g, "Size $1")
    .replace(/内径/g, "inner diameter")
    .replace(/戒臂约/g, "band width approx. ")
    .replace(/(\d+)颗/g, "$1 stones")
    .replace(/个工作日/g, " business days")
    .replace(/约 /g, "Approx. ")
    .replace(/待确认/g, "To be confirmed");
}

export function BeadLabLanguageBridge() {
  const { locale } = useI18n();
  useEffect(() => {
    const root = document.querySelector("[data-bead-lab]");
    if (!root) return;
    const apply = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node as Text;
        const original = originalText.get(text) ?? text.data;
        originalText.set(text, original);
        const next = locale === "zh" ? original : translateText(original);
        if (text.data !== next) text.data = next;
      }
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);
  return null;
}
