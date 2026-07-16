"use client";

import { useCallback, useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  demo?: boolean;
  message?: string;
  range?: string;
  since?: string;
  summary?: {
    totalEvents: number;
    uniqueVisitors: number;
    uniqueSessions: number;
    productViews: number;
    toolUses: number;
    addToCart: number;
    checkoutStart: number;
    purchases: number;
  };
  topPages?: { url: string; count: number }[];
  topProducts?: { productId: string; count: number }[];
  trafficSources?: { source: string; count: number }[];
  browsers?: { browser: string; count: number }[];
  devices?: { device: string; count: number }[];
  countries?: { country: string; count: number }[];
  regions?: { region: string; count: number }[];
  toolUsage?: {
    viewer3dOpen: number;
    viewer3dInteract: number;
    tryonStart: number;
    tryonComplete: number;
    advisorSubmit: number;
    advisorResultView: number;
  };
  funnel?: {
    pageView: number;
    productView: number;
    addToCart: number;
    cartView: number;
    checkoutStart: number;
    checkoutSubmit: number;
    purchase: number;
  };
  journey?: {
    event_name: string;
    page_url: string | null;
    product_id: string | null;
    tool_name: string | null;
    timestamp: string;
    anonymous_user_id: string | null;
    session_id: string | null;
    device_type: string | null;
    browser: string | null;
    traffic_source: string | null;
    referrer: string | null;
    country: string | null;
    region: string | null;
  }[];
}

type Range = "today" | "7d" | "30d" | "90d" | "6m" | "12m" | "all";

// ── Helpers ───────────────────────────────────────────────────────────────────

function shortUrl(url: string | null): string {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return u.pathname || "/";
  } catch {
    return url;
  }
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function pct(num: number, denom: number): string {
  if (!denom) return "—";
  return ((num / denom) * 100).toFixed(1) + "%";
}

function pctNum(num: number, denom: number): number {
  if (!denom) return 0;
  return Math.min((num / denom) * 100, 100);
}

function rangeLabel(r: Range): string {
  const map: Record<Range, string> = { today: "Today", "7d": "7D", "30d": "30D", "90d": "90D", "6m": "6M", "12m": "12M", all: "All Time" };
  return map[r];
}

function rangeDisplay(r: Range): string {
  const map: Record<Range, string> = { today: "today", "7d": "last 7 days", "30d": "last 30 days", "90d": "last 90 days", "6m": "last 6 months", "12m": "last 12 months", all: "all time" };
  return map[r];
}

type EventCategory = "page" | "tool" | "commerce" | "other";

function categorizeEvent(name: string): EventCategory {
  const n = name.toLowerCase();
  if (n.includes("3d") || n.includes("viewer") || n.includes("tryon") || n.includes("advisor") || n.includes("tool_click")) return "tool";
  if (n.includes("cart") || n.includes("checkout") || n.includes("purchase") || n.includes("add_to")) return "commerce";
  if (n.includes("page") || n.includes("view") || n.includes("collection") || n.includes("newsletter") || n.includes("vip")) return "page";
  return "other";
}

const EVENT_BADGE: Record<EventCategory, string> = {
  page:     "bg-blue-50 text-blue-700 border border-blue-200",
  tool:     "bg-amber-50 text-amber-700 border border-amber-200",
  commerce: "bg-green-50 text-green-700 border border-green-200",
  other:    "bg-gray-100 text-gray-600 border border-gray-200",
};

// ── Projection types ──────────────────────────────────────────────────────────

interface ProjectionValues {
  uniqueVisitors: number;
  uniqueSessions: number;
  totalEvents: number;
  productViews: number;
  toolUses: number;
  addToCart: number;
  checkoutStart: number;
  purchases: number;
}

const PROJECTION_DEFAULTS: ProjectionValues = {
  uniqueVisitors: 0,
  uniqueSessions: 0,
  totalEvents: 0,
  productViews: 0,
  toolUses: 0,
  addToCart: 0,
  checkoutStart: 0,
  purchases: 0,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <div className={`h-1.5 w-8 rounded-full mb-3 ${color}`} />
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function KpiCardEditable({
  label, value, sub, color, onChange,
}: {
  label: string; value: number; sub: string; color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="bg-white border-2 border-amber-300 rounded-lg shadow-sm p-5">
      <div className={`h-1.5 w-8 rounded-full mb-3 ${color}`} />
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-full text-3xl font-bold text-amber-700 mt-1 tabular-nums bg-transparent border-0 border-b-2 border-amber-200 focus:border-amber-400 focus:outline-none p-0 leading-tight"
      />
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{children}</h2>
  );
}

function BarRow({ label, count, max, rank, color = "bg-blue-400" }: { label: string; count: number; max: number; rank?: number; color?: string }) {
  const pctWidth = max > 0 ? (count / max) * 100 : 0;
  const share = max > 0 ? ((count / max) * 100).toFixed(1) + "%" : "—";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      {rank !== undefined && (
        <span className="shrink-0 w-5 text-xs text-gray-300 text-right font-mono">{rank}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">{label}</p>
        <div className="mt-1.5 h-1.5 w-full bg-gray-100 rounded-full">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pctWidth}%` }} />
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold text-gray-700 w-12 text-right tabular-nums">{count.toLocaleString()}</span>
      <span className="shrink-0 text-xs text-gray-400 w-10 text-right">{share}</span>
    </div>
  );
}

function FunnelRow({
  label,
  count,
  prevCount,
  topCount,
  color,
  isFirst,
}: {
  label: string;
  count: number;
  prevCount: number;
  topCount: number;
  color: string;
  isFirst?: boolean;
}) {
  const barWidth = topCount > 0 ? Math.max((count / topCount) * 100, 2) : 2;
  const stepPct = isFirst ? null : pct(count, prevCount);
  const stepNum = isFirst ? 100 : pctNum(count, prevCount);
  const dropOff = isFirst ? null : pct(prevCount - count, prevCount);
  const rateColor = isFirst ? "" : stepNum >= 50 ? "text-green-600" : stepNum >= 20 ? "text-amber-600" : "text-red-500";
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="w-36 shrink-0">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {!isFirst && (
          <p className="text-xs text-gray-400 mt-0.5">↓ {dropOff} drop-off</p>
        )}
      </div>
      <div className="flex-1">
        <div className="h-7 bg-gray-100 rounded overflow-hidden">
          <div className={`h-full rounded transition-all duration-500 ${color}`} style={{ width: `${barWidth}%` }} />
        </div>
      </div>
      <div className="w-24 shrink-0 text-right">
        <p className="text-sm font-bold text-gray-900 tabular-nums">{count.toLocaleString()}</p>
        {stepPct && <p className={`text-xs font-medium mt-0.5 ${rateColor}`}>{stepPct} from prev</p>}
      </div>
    </div>
  );
}

// ── Login screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw.trim()) return;
    onLogin(pw.trim());
    setError(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-4">Stylix Analytics</p>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Admin access</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your admin password to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              autoFocus
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-red-500">Incorrect password.</p>}
          <button
            type="submit"
            className="w-full py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export function AdminAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<Range>("90d");
  const [journeyPage, setJourneyPage] = useState(0);
  const [projectionMode, setProjectionMode] = useState(false);
  const [projectionValues, setProjectionValues] = useState<ProjectionValues>(PROJECTION_DEFAULTS);
  const JOURNEY_PAGE_SIZE = 20;

  const fetchData = useCallback(
    async (r: Range) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics/data?range=${r}`);
        if (res.status === 401) {
          window.location.href = "/admin/login?next=/admin/analytics";
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        // network error
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(range);
    setJourneyPage(0);
  }, [fetchData, range]);

  function enableProjectionMode() {
    // Seed projection values from current real data so the founder has a starting point
    if (data?.summary) {
      setProjectionValues({
        uniqueVisitors: data.summary.uniqueVisitors ?? 0,
        uniqueSessions: data.summary.uniqueSessions ?? 0,
        totalEvents:    data.summary.totalEvents    ?? 0,
        productViews:   data.summary.productViews   ?? 0,
        toolUses:       data.summary.toolUses        ?? 0,
        addToCart:      data.summary.addToCart       ?? 0,
        checkoutStart:  data.summary.checkoutStart   ?? 0,
        purchases:      data.summary.purchases       ?? 0,
      });
    }
    setProjectionMode(true);
  }

  function updateProjection(key: keyof ProjectionValues, value: number) {
    setProjectionValues((prev) => ({ ...prev, [key]: value }));
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-gray-200 border-t-gray-600 rounded-full" />
      </div>
    );
  }

  // Demo mode — Supabase not configured
  if (data.demo) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 max-w-lg w-full text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-4">Stylix Analytics</p>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Supabase Not Connected</h1>
          <p className="text-sm text-gray-500 mb-6">Analytics events are being tracked but not stored yet. Connect your Supabase project to start seeing real data.</p>
          <ol className="space-y-2">
            {[
              "Create a project at supabase.com",
              "Run supabase/schema.sql in the SQL editor",
              "Add NEXT_PUBLIC_SUPABASE_URL to .env.local",
              "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
              "Add SUPABASE_SERVICE_ROLE_KEY to .env.local",
              "Restart the dev server",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="shrink-0 h-5 w-5 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  const { summary, topPages, topProducts, trafficSources, browsers, devices, countries, regions, toolUsage, funnel, journey } = data;
  const journeySlice = (journey ?? []).slice(
    journeyPage * JOURNEY_PAGE_SIZE,
    (journeyPage + 1) * JOURNEY_PAGE_SIZE
  );
  const journeyTotalPages = Math.ceil((journey ?? []).length / JOURNEY_PAGE_SIZE);

  const funnelTop = funnel?.pageView ?? 0;

  const kpiCards = [
    { label: "Unique Visitors",   value: summary?.uniqueVisitors  ?? 0, sub: "Distinct anonymous user IDs",          color: "bg-blue-400" },
    { label: "Sessions",          value: summary?.uniqueSessions  ?? 0, sub: "Distinct browser sessions",            color: "bg-indigo-400" },
    { label: "Total Events",      value: summary?.totalEvents     ?? 0, sub: "All tracked interactions",             color: "bg-slate-400" },
    { label: "Product Views",     value: summary?.productViews    ?? 0, sub: "Product detail page views",            color: "bg-violet-400" },
    { label: "Tool Uses",         value: summary?.toolUses        ?? 0, sub: "3D viewer, try-on & advisor opens",    color: "bg-amber-400" },
    { label: "Add to Cart",       value: summary?.addToCart       ?? 0, sub: "Items added to shopping bag",          color: "bg-orange-400" },
    { label: "Checkout Started",  value: summary?.checkoutStart   ?? 0, sub: "Checkout flows initiated",             color: "bg-rose-400" },
    { label: "Purchases",         value: summary?.purchases       ?? 0, sub: "Completed transactions",               color: "bg-green-500" },
  ];

  const funnelSteps = [
    { label: "Page View",        count: funnel?.pageView       ?? 0, color: "bg-blue-400" },
    { label: "Product View",     count: funnel?.productView    ?? 0, color: "bg-indigo-400" },
    { label: "Add to Cart",      count: funnel?.addToCart      ?? 0, color: "bg-violet-400" },
    { label: "Cart View",        count: funnel?.cartView       ?? 0, color: "bg-amber-400" },
    { label: "Checkout Start",   count: funnel?.checkoutStart  ?? 0, color: "bg-orange-400" },
    { label: "Checkout Submit",  count: funnel?.checkoutSubmit ?? 0, color: "bg-rose-400" },
    { label: "Purchase",         count: funnel?.purchase       ?? 0, color: "bg-green-500" },
  ];

  return (
    <div data-theme="light" className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)]">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-amber-600">Stylix</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm font-semibold text-gray-900">Analytics</span>
            <span className="ml-1 px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">Admin · Read-only</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode toggle */}
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
              <button
                type="button"
                onClick={() => setProjectionMode(false)}
                className={`px-3 py-1.5 transition-colors ${!projectionMode ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                ✓ Real Data
              </button>
              <button
                type="button"
                onClick={enableProjectionMode}
                className={`px-3 py-1.5 transition-colors border-l border-gray-200 ${projectionMode ? "bg-amber-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                ⚡ Projection
              </button>
            </div>

            {/* Range filters — hidden in projection mode */}
            {!projectionMode && (
              <>
                {(["today", "7d", "30d", "90d", "6m", "12m", "all"] as Range[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                      range === r
                        ? "bg-amber-50 border-amber-400 text-amber-700 font-semibold"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {rangeLabel(r)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => fetchData(range)}
                  className="px-3 py-1.5 text-xs font-medium rounded border bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  ↻ Refresh
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Projection banner ────────────────────────────────────────────── */}
      {projectionMode && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-sm">⚠</span>
              <p className="text-sm font-medium text-amber-800">
                Projection mode: manually modeled scenario, not live user data.
              </p>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-200 text-amber-800 rounded uppercase tracking-wide">Demo / Projection</span>
            </div>
            <button
              type="button"
              onClick={() => setProjectionMode(false)}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 underline"
            >
              Switch to Real Data
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10 space-y-10">

        {/* ── KPI Grid ────────────────────────────────────────────────── */}
        <section>
          <SectionTitle>{projectionMode ? "Projection — editable scenario" : `Overview — ${rangeDisplay(range)}`}</SectionTitle>
          {projectionMode ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
              {([
                { key: "uniqueVisitors" as const, label: "Unique Visitors",  sub: "Distinct anonymous user IDs",       color: "bg-blue-400" },
                { key: "uniqueSessions" as const, label: "Sessions",         sub: "Distinct browser sessions",         color: "bg-indigo-400" },
                { key: "totalEvents" as const,    label: "Total Events",     sub: "All tracked interactions",          color: "bg-slate-400" },
                { key: "productViews" as const,   label: "Product Views",    sub: "Product detail page views",         color: "bg-violet-400" },
                { key: "toolUses" as const,       label: "Tool Uses",        sub: "3D viewer, try-on & advisor opens", color: "bg-amber-400" },
                { key: "addToCart" as const,      label: "Add to Cart",      sub: "Items added to shopping bag",       color: "bg-orange-400" },
                { key: "checkoutStart" as const,  label: "Checkout Started", sub: "Checkout flows initiated",          color: "bg-rose-400" },
                { key: "purchases" as const,      label: "Purchases",        sub: "Completed transactions",            color: "bg-green-500" },
              ]).map((card) => (
                <KpiCardEditable
                  key={card.key}
                  label={card.label}
                  value={projectionValues[card.key]}
                  sub={card.sub}
                  color={card.color}
                  onChange={(v) => updateProjection(card.key, v)}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
              {kpiCards.map((card) => (
                <KpiCard key={card.label} label={card.label} value={card.value.toLocaleString()} sub={card.sub} color={card.color} />
              ))}
            </div>
          )}
        </section>

        {/* ── Conversion Funnel ───────────────────────────────────────── */}
        {projectionMode ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-sm font-medium text-amber-700">Conversion funnel, tool usage, top pages, and journey log are only available in Real Data mode.</p>
            <p className="text-xs text-amber-600 mt-1">Projection mode shows KPI estimates only. Switch to Real Data to see live analytics.</p>
          </div>
        ) : (
          <>
          <section>
            <SectionTitle>Conversion Funnel</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-5">
              {funnelSteps.map((step, i) => (
                <FunnelRow
                  key={step.label}
                  label={step.label}
                  count={step.count}
                  prevCount={i === 0 ? step.count : funnelSteps[i - 1].count}
                  topCount={funnelTop}
                  color={step.color}
                  isFirst={i === 0}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Key Rates</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-5">
              {[
                { label: "Cart → Purchase",      num: funnel?.purchase ?? 0,       denom: funnel?.addToCart ?? 0 },
                { label: "Checkout → Purchase",  num: funnel?.purchase ?? 0,       denom: funnel?.checkoutStart ?? 0 },
                { label: "View → Cart",          num: funnel?.addToCart ?? 0,      denom: funnel?.productView ?? 0 },
                { label: "View → Purchase",      num: funnel?.purchase ?? 0,       denom: funnel?.pageView ?? 0 },
              ].map(({ label, num, denom }) => (
                <div key={label}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">{pct(num, denom)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full">
                    <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${pctNum(num, denom)}%` }} />
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{(funnel?.purchase ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </section>

        {/* ── Tool & Feature Usage ─────────────────────────────────────── */}
        <section>
          <SectionTitle>Tool & Feature Usage</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">3D Jewelry Viewer</p>
                <span className="h-2 w-2 rounded-full bg-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {pct(toolUsage?.viewer3dInteract ?? 0, toolUsage?.viewer3dOpen ?? 0)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">Engagement rate</p>
              <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                <div className="h-full bg-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${pctNum(toolUsage?.viewer3dInteract ?? 0, toolUsage?.viewer3dOpen ?? 0)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Opens</p>
                  <p className="text-sm font-semibold text-gray-700 tabular-nums">{(toolUsage?.viewer3dOpen ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Interactions</p>
                  <p className="text-sm font-semibold text-gray-700 tabular-nums">{(toolUsage?.viewer3dInteract ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Virtual Try-On</p>
                <span className="h-2 w-2 rounded-full bg-violet-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {pct(toolUsage?.tryonComplete ?? 0, toolUsage?.tryonStart ?? 0)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">Completion rate</p>
              <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                <div className="h-full bg-violet-400 rounded-full transition-all duration-700"
                  style={{ width: `${pctNum(toolUsage?.tryonComplete ?? 0, toolUsage?.tryonStart ?? 0)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Started</p>
                  <p className="text-sm font-semibold text-gray-700 tabular-nums">{(toolUsage?.tryonStart ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="text-sm font-semibold text-gray-700 tabular-nums">{(toolUsage?.tryonComplete ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">AI Advisor</p>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">
                {pct(toolUsage?.advisorResultView ?? 0, toolUsage?.advisorSubmit ?? 0)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">Result view rate</p>
              <div className="h-1.5 bg-gray-100 rounded-full mb-4">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${pctNum(toolUsage?.advisorResultView ?? 0, toolUsage?.advisorSubmit ?? 0)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Submissions</p>
                  <p className="text-sm font-semibold text-gray-700 tabular-nums">{(toolUsage?.advisorSubmit ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Results viewed</p>
                  <p className="text-sm font-semibold text-gray-700 tabular-nums">{(toolUsage?.advisorResultView ?? 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Top Pages + Products ─────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <SectionTitle>Top Pages</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4">
              {(topPages ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No page view data yet.</p>
              ) : (topPages ?? []).map((p, i) => (
                <BarRow key={i} rank={i + 1} label={shortUrl(p.url)} count={p.count} max={topPages?.[0]?.count ?? 1} color="bg-blue-400" />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Top Products</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4">
              {(topProducts ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No product view data yet.</p>
              ) : (topProducts ?? []).map((p, i) => (
                <BarRow key={i} rank={i + 1} label={p.productId} count={p.count} max={topProducts?.[0]?.count ?? 1} color="bg-violet-400" />
              ))}
            </div>
          </section>
        </div>

        {/* ── Traffic Sources + Browser + Device ───────────────────────── */}
        <div className="grid gap-6 md:grid-cols-3">
          <section>
            <SectionTitle>Traffic Sources</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4">
              {(trafficSources ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No traffic data yet.</p>
              ) : (trafficSources ?? []).map((s, i) => (
                <BarRow key={i} rank={i + 1} label={s.source} count={s.count} max={trafficSources?.[0]?.count ?? 1} color="bg-emerald-400" />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Browsers</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4">
              {(browsers ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No browser data yet.</p>
              ) : (browsers ?? []).map((b, i) => (
                <BarRow key={i} rank={i + 1} label={b.browser} count={b.count} max={browsers?.[0]?.count ?? 1} color="bg-sky-400" />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Devices</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4">
              {(devices ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No device data yet.</p>
              ) : (devices ?? []).map((d, i) => (
                <BarRow key={i} rank={i + 1} label={d.device} count={d.count} max={devices?.[0]?.count ?? 1} color="bg-orange-400" />
              ))}
            </div>
          </section>
        </div>

        {/* ── Countries + Regions ──────────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">
          <section>
            <SectionTitle>Top Countries</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4">
              {(countries ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Country data available after deployment to Vercel.</p>
              ) : (countries ?? []).map((c, i) => (
                <BarRow key={i} rank={i + 1} label={c.country} count={c.count} max={countries?.[0]?.count ?? 1} color="bg-teal-400" />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Top Regions</SectionTitle>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4">
              {(regions ?? []).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Region data available after deployment to Vercel.</p>
              ) : (regions ?? []).map((r, i) => (
                <BarRow key={i} rank={i + 1} label={r.region} count={r.count} max={regions?.[0]?.count ?? 1} color="bg-cyan-400" />
              ))}
            </div>
          </section>
        </div>

        {/* ── User Journey Log ─────────────────────────────────────────── */}
        <section>
          <SectionTitle>User Journey Log</SectionTitle>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Time", "Event", "Page", "Product", "Tool", "Session", "Device", "Browser", "Source", "Country", "Region"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {journeySlice.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-gray-400 text-sm">
                      No events in this time range.
                    </td>
                  </tr>
                ) : (
                  journeySlice.map((ev, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{fmtTime(ev.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${EVENT_BADGE[categorizeEvent(ev.event_name)]}`}>
                          {ev.event_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate text-xs">{shortUrl(ev.page_url)}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate text-xs">{ev.product_id ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{ev.tool_name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs max-w-[80px] truncate">
                        {ev.session_id ? ev.session_id.slice(0, 8) + "…" : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs capitalize">{ev.device_type ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs capitalize">{ev.browser ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{ev.traffic_source ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{ev.country ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{ev.region ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {journeyTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                <p className="text-xs text-gray-400">
                  Page {journeyPage + 1} of {journeyTotalPages} · {(journey ?? []).length} events
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={journeyPage === 0}
                    onClick={() => setJourneyPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded border bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    ← Prev
                  </button>
                  <button
                    type="button"
                    disabled={journeyPage >= journeyTotalPages - 1}
                    onClick={() => setJourneyPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded border bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
        </> )}

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-200 pt-6 pb-4 flex items-center justify-between flex-wrap gap-4">
          <p className="text-xs text-gray-400">
            Stylix Analytics · Admin ·{" "}
            {projectionMode
              ? <span className="text-amber-600 font-medium">Demo / Projection mode</span>
              : "Real Data · Read-only"}
          </p>
          <p className="text-xs text-gray-400">
            {projectionMode ? "Manually modeled scenario" : `Data since ${data.since ? new Date(data.since).toLocaleDateString() : "—"}`}
          </p>
        </footer>
      </div>
    </div>
  );
}
