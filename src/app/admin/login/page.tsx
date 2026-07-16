"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (!response?.ok) {
      const data = response ? await response.json().catch(() => null) : null;
      setError(data?.error || "Unable to sign in.");
      setLoading(false);
      return;
    }
    const next = new URLSearchParams(window.location.search).get("next");
    window.location.href = next?.startsWith("/admin/") ? next : "/admin/analytics";
  }

  return <div data-theme="light" className="flex min-h-screen items-center justify-center bg-[var(--ui-bg)] px-6 text-[var(--ui-text)]">
    <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-[var(--ui-line)] bg-[var(--ui-surface)] p-8 shadow-[var(--ui-shadow-low)]">
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Stylix Admin</p>
      <h1 className="mt-3 text-2xl font-semibold">后台登录</h1>
      <p className="mt-2 text-sm text-gray-500">登录状态会安全保存在 HttpOnly 会话中。</p>
      <label className="mt-7 block text-xs font-medium text-gray-600" htmlFor="admin-password">管理员密码</label>
      <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus required className="ui-field mt-2" />
      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="ui-button ui-button--primary mt-6 w-full">{loading ? "登录中..." : "登录"}</button>
    </form>
  </div>;
}
