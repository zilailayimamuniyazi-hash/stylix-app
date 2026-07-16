import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "服务条款 · Stylix",
};

export default function TermsPage() {
  return (
    <div className="ui-page pt-24">
      <div className="border-b border-ivory/10 py-14">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] uppercase tracking-[0.55em] text-gold/70">Legal</p>
          </div>
          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">服务条款</h1>
          <p className="mt-4 text-xs text-ivory/40">生效日期：2026 年 7 月 15 日</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
        <div className="space-y-10 text-sm leading-relaxed text-ivory-dim">
          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">适用范围</h2>
            <p>本条款适用于你对 Stylix 网站、JMTI 推荐、虚拟试戴、珠宝 DIY、商品购买及高级定制服务的使用。提交订单或继续使用服务，即表示你同意本条款及订单页面披露的具体条件。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">账户与使用规范</h2>
            <p>你应提供真实、准确的信息并妥善保管账户凭证。不得干扰网站运行、绕过安全措施、批量抓取内容，或使用服务侵犯他人权利。我们可对存在安全或欺诈风险的账户采取限制措施。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">商品、订单与支付</h2>
            <p>商品颜色和比例可能因屏幕、摄影和天然材质差异略有不同。订单需经库存与支付确认后成立；税费、运费、优惠及最终应付金额以安全支付页显示为准。出现明显定价错误、库存异常或疑似欺诈时，我们可取消订单并原路退款。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">配送、退换与定制商品</h2>
            <p>配送时效和可退换条件以商品页、订单确认页及销售地区适用规则为准。已佩戴、刻字、改圈、按个人尺寸制作或其他明确标记为定制的商品，除质量问题或法律另有要求外，通常不适用无理由退换。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">数字体验与知识产权</h2>
            <p>JMTI、虚拟试戴和 3D 预览用于辅助选择，不构成宝石鉴定、医疗、投资或适配保证。网站内容、模型、视觉、文本和软件受知识产权保护；你保留对主动上传内容的权利，并授予我们为提供对应服务所必需的有限处理权限。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">责任与联系</h2>
            <p>在适用法律允许范围内，我们对不可控的网络、支付、物流中断不承担超出合理范围的责任。任何强制性消费者权利不受本条款限制。条款问题、售后或争议可通过页脚客服邮箱联系我们，我们会优先通过协商解决。</p>
          </section>
        </div>

        <Link
          href="/checkout"
          className="mt-12 inline-flex text-[10px] uppercase tracking-[0.3em] text-gold/70 hover:text-gold transition-colors"
        >
          ← 返回结账
        </Link>
      </div>
    </div>
  );
}
