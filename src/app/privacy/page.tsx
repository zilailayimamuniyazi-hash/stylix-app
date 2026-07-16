import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私政策 · Stylix",
};

export default function PrivacyPage() {
  return (
    <div className="ui-page pt-24">
      <div className="border-b border-ivory/10 py-14">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-gold/40" />
            <p className="text-[10px] uppercase tracking-[0.55em] text-gold/70">Legal</p>
          </div>
          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">隐私政策</h1>
          <p className="mt-4 text-xs text-ivory/40">生效日期：2026 年 7 月 15 日</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
        <div className="space-y-10 text-sm leading-relaxed text-ivory-dim">
          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">我们收集的信息</h2>
            <p>当你注册、下单、加入心愿单、完成 JMTI 测试或提交定制需求时，我们可能收集账户信息、联系方式、收货地址、订单记录、风格偏好及你主动提供的内容。虚拟试戴照片默认只在当前浏览器中处理，不会上传至我们的服务器。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">信息用途</h2>
            <p>我们使用这些信息来提供账户服务、处理支付与配送、生成个性化推荐、响应售后请求、防止欺诈并改善产品体验。我们不会出售你的个人信息，也不会将其用于与你合理预期无关的用途。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">服务商与信息共享</h2>
            <p>为完成服务，我们可能向支付、云存储、身份认证、物流和分析服务商提供必要信息。这些服务商仅能按约定目的处理数据。支付卡信息由支付机构直接处理，Stylix 不保存完整卡号或安全码。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">保存与安全</h2>
            <p>我们仅在提供服务、履行合同、处理争议及遵守法定义务所需期间保存信息，并采取访问控制、传输加密与权限隔离等措施。互联网服务无法保证绝对安全，如发现风险我们会按适用法律采取处置措施。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">你的权利</h2>
            <p>你可以请求访问、更正或删除账户信息，撤回非必要授权，或对个性化推荐提出异议。部分订单信息可能因财税、反欺诈或争议处理义务而在法定期限内保留。请通过页脚客服邮箱提交请求，我们会在合理期限内核验并处理。</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-ivory mb-4">本地存储、未成年人及政策更新</h2>
            <p>网站会使用 Cookie 或浏览器本地存储保存登录状态、购物袋、心愿单与偏好。我们的服务不面向未达到所在地区法定数字同意年龄的儿童。政策发生重大变化时，我们会在本页更新日期并以合理方式提示。</p>
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
