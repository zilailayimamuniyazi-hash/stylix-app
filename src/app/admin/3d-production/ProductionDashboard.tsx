"use client";

import { useEffect, useMemo, useState } from "react";

interface Artifact { at: string; kind: string; path: string; result: string }
interface Product { slug: string; name: string; category: string; status: string; updatedAt: string | null; lastResult: string; artifacts: Artifact[] }
export interface QueueData {
  settings: { staleMinutes: number };
  monitor: { heartbeatAt: string | null; startedAt: string | null };
  active: { productSlug: string | null; step: string; startedAt: string | null; lastProgressAt: string | null };
  products: Product[];
  events: Array<{ at: string; type: string; slug: string | null; message: string; file?: string }>;
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
}

export function ProductionDashboard({ initialQueue = null, initialNow = 0 }: { initialQueue?: QueueData | null; initialNow?: number }) {
  const [queue, setQueue] = useState<QueueData | null>(initialQueue);
  const [error, setError] = useState("");
  const [clock, setClock] = useState(initialNow);

  useEffect(() => {
    let mounted = true;
    async function refresh() {
      try {
        const response = await fetch("/api/3d-production", { cache: "no-store" });
        if (!response.ok) throw new Error("无法读取本地制作队列");
        const data = await response.json();
        if (mounted) { setQueue(data); setError(""); setClock(Date.now()); }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "无法读取本地制作队列");
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 10000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  const stats = useMemo(() => {
    if (!queue) return { passed: 0, rework: 0 };
    return {
      passed: queue.products.filter((product) => product.status === "已通过").length,
      rework: queue.products.filter((product) => product.status === "需要返工").length,
    };
  }, [queue]);

  if (error) return <main className="min-h-screen bg-[#f7f6f3] p-10 text-[#a3423f]">{error}</main>;
  if (!queue) return <main className="min-h-screen bg-[#f7f6f3] p-10 text-[#77757d]">正在读取制作队列…</main>;

  const staleMs = (queue.settings.staleMinutes || 45) * 60_000;
  const monitorOnline = Boolean(queue.monitor.heartbeatAt && clock - new Date(queue.monitor.heartbeatAt).getTime() < 90_000);
  const hasRecentArtifact = Boolean(queue.active.productSlug && queue.active.lastProgressAt && clock - new Date(queue.active.lastProgressAt).getTime() < staleMs);
  const workerRunning = Boolean(monitorOnline && queue.active.productSlug);
  const activeProduct = queue.products.find((product) => product.slug === queue.active.productSlug);

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#111]">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[#d9d7d2] px-[5vw] py-7">
        <div><h1 className="font-serif text-4xl tracking-[0.12em]">STYLIX</h1><p className="mt-2 text-[11px] tracking-[0.22em] text-[#77757d]">3D PRODUCTION QUEUE · LOCAL ONLY</p></div>
        <p className="text-xs text-[#77757d]">{new Date(clock).toLocaleString("zh-CN", { hour12: false })}</p>
      </header>

      <main className="px-[5vw] py-7">
        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[["总产品", queue.products.length], ["已通过", stats.passed], ["需要返工", stats.rework], ["监控程序", monitorOnline ? "在线" : "离线"]].map(([label, value]) => (
            <div key={label} className="border border-[#d9d7d2] bg-white p-5"><strong className="block font-serif text-3xl font-normal">{value}</strong><span className="text-xs text-[#77757d]">{label}</span></div>
          ))}
        </section>

        <section className="mb-6 flex flex-wrap justify-between gap-5 border border-[#d9d7d2] bg-white p-6">
          <div><p className="text-[11px] tracking-[0.22em] text-[#b79555]">CURRENT PRODUCT</p><h2 className="mt-2 font-serif text-3xl">{activeProduct?.name || "当前没有活动产品"}</h2><p className="mt-2 text-sm">{queue.active.step || "—"}</p></div>
          <div><p className={`font-semibold ${workerRunning ? "text-[#316f55]" : "text-[#a3423f]"}`}>{workerRunning ? (hasRecentArtifact ? "正在工作" : "队列运行中／等待下一产物") : "已停止"}</p><p className="mt-2 text-xs text-[#77757d]">最后产物：{formatDate(queue.active.lastProgressAt)}</p><p className="mt-1 text-xs text-[#77757d]">监控心跳：{formatDate(queue.monitor.heartbeatAt)}</p></div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          {queue.products.map((product) => (
            <article key={product.slug} className="border border-[#d9d7d2] bg-white p-5">
              <div className="flex items-start justify-between gap-4"><div><h3 className="font-serif text-2xl">{product.name}</h3><p className="mt-1 text-xs text-[#77757d]">{product.slug} · {product.category === "rings" ? "戒指" : "项链"}</p></div><span className="whitespace-nowrap border border-current px-2 py-1 text-[11px]">{product.status}</span></div>
              <p className="mt-4 min-h-10 text-xs leading-5 text-[#77757d]">{product.lastResult || "尚无检查记录"}</p>
              <p className="text-xs text-[#77757d]">最后更新：{formatDate(product.updatedAt)}</p>
              <div className="mt-4 border-t border-[#d9d7d2] pt-3">{product.artifacts?.slice(0, 3).map((artifact) => <div key={`${artifact.at}-${artifact.path}`} className="mb-2 break-all text-[11px] leading-4 text-[#77757d]">{artifact.kind} · {formatDate(artifact.at)}<br />{artifact.path}<br />{artifact.result}</div>)}{!product.artifacts?.length && <p className="text-[11px] text-[#77757d]">暂无模型、截图或 GLB</p>}</div>
            </article>
          ))}
        </section>

        <section className="mt-6 border border-[#d9d7d2] bg-white p-5"><p className="text-[11px] tracking-[0.22em] text-[#b79555]">ACTIVITY LOG</p><h2 className="my-3 font-serif text-3xl">最近记录</h2>{queue.events.slice(0, 30).map((event) => <div key={`${event.at}-${event.slug}-${event.type}`} className="grid gap-2 border-t border-[#d9d7d2] py-3 text-xs md:grid-cols-[160px_190px_1fr]"><span className="text-[#77757d]">{formatDate(event.at)}</span><span>{event.slug || event.type}</span><span>{event.message}{event.file && <><br /><span className="break-all text-[#77757d]">{event.file}</span></>}</span></div>)}</section>
      </main>
    </div>
  );
}
