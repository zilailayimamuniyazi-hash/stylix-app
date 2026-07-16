"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-[#0b0b0e] bg-[linear-gradient(145deg,#0b0b0e,#1a1a2e)] px-6 text-center font-sans text-[#f1eee8]">
        <div className="w-full max-w-lg border border-white/10 bg-white/[.05] p-10 shadow-2xl backdrop-blur-[20px]">
          <p className="text-[10px] uppercase tracking-[.3em] text-[#d4af37]">Critical error</p>
          <h2 className="mt-4 font-serif text-3xl">页面暂时无法加载</h2>
          <p className="mt-3 text-sm leading-6 text-white/50">发生了意外错误。你的购物袋和本地偏好不会因此丢失，请重新加载页面。</p>
          <button onClick={reset} className="mt-7 min-h-11 bg-[#d4af37] px-7 text-[10px] font-medium uppercase tracking-[.2em] text-[#0b0b0e]">重新加载</button>
        </div>
      </body>
    </html>
  );
}
