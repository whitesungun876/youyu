"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { UserDefined } from "@/types/compass";
import { loadUserDefined } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/calculations";

type Scenario = "quit" | "illness";
type Range = { min: number; max: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function toNum(x: unknown, fallback: number) {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : fallback;
}

/** 来自区间的“安全垫可撑月数范围”： [safetyNetMin / spendMax, safetyNetMax / spendMin] */
function calcSafetyMonthsFromRanges(u: UserDefined): Range {
  const sMin = Math.max(0, toNum(u.safetyNetMin, 0));
  const sMax = Math.max(sMin, toNum(u.safetyNetMax, sMin));

  const spendMin = Math.max(1, toNum(u.monthlySpendMin, 1));
  const spendMax = Math.max(spendMin, toNum(u.monthlySpendMax, spendMin));

  const minMonths = sMin / spendMax;
  const maxMonths = sMax / spendMin;

  return {
    min: clamp(minMonths, 0, 120),
    max: clamp(maxMonths, 0, 120),
  };
}

function formatMonthsRange(r: Range) {
  const a = Math.max(0, Math.floor(r.min));
  const b = Math.max(a, Math.ceil(r.max));
  return `${a}–${b}`;
}

export function SandboxClient() {
  const [user, setUser] = useState<UserDefined | null>(null);
  const [scenario, setScenario] = useState<Scenario>("quit");
  const [monthlySpend, setMonthlySpend] = useState(8000);

  useEffect(() => {
    const u = loadUserDefined();
    setUser(u);
    track("sandbox_view");
  }, []);

  // 默认滑块：用用户月支出区间中值（若缺失就用 8000）
  useEffect(() => {
    if (!user) return;
    const min = Math.max(1, toNum(user.monthlySpendMin, 8000));
    const max = Math.max(min, toNum(user.monthlySpendMax, min));
    const mid = Math.round((min + max) / 2);
    setMonthlySpend(mid);
  }, [user]);

  const computed = useMemo(() => {
    if (!user) return null;

    const safetyMonthsRange = calcSafetyMonthsFromRanges(user);

    // 推演使用“安全垫中值”（更直观）
    const safetyMid =
      (Math.max(0, toNum(user.safetyNetMin, 0)) +
        Math.max(0, toNum(user.safetyNetMax, 0))) /
      2;

    const spend = Math.max(1, monthlySpend);

    // 场景影响：大病让“有效月支出”更高
    const spendFactor = scenario === "illness" ? 1.3 : 1.0;

    const months = safetyMid / (spend * spendFactor);

    const note =
      scenario === "illness"
        ? "大病推演会更保守：我们假设开支会比平时高一些（×1.3）。"
        : "离职推演更像「休息一阵子」：先看底气能撑多久。";

    return {
      safetyMonthsRange,
      months: clamp(Math.round(months * 10) / 10, 0, 120),
      note,
    };
  }, [user, monthlySpend, scenario]);

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-5 py-12 space-y-6">
          <h1 className="text-2xl font-semibold text-slate-50">压力沙盘</h1>
          <p className="text-sm text-slate-300">你还没完成生活盘点。</p>
          <Link className="underline text-slate-200" href="/onboarding">
            去完成生活盘点 →
          </Link>
        </div>
      </main>
    );
  }

  // 如果关键字段缺失，直接提示回去补
  const hasCore =
    Number.isFinite(toNum(user.safetyNetMin, NaN)) &&
    Number.isFinite(toNum(user.safetyNetMax, NaN)) &&
    Number.isFinite(toNum(user.monthlySpendMin, NaN)) &&
    Number.isFinite(toNum(user.monthlySpendMax, NaN));

  if (!hasCore) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-5 py-12 space-y-4">
          <h1 className="text-2xl font-semibold text-slate-50">压力沙盘</h1>
          <p className="text-sm text-slate-300">
            你的盘点数据还不完整（缺少安全垫/月支出区间），所以暂时无法推演。
          </p>
          <Link className="underline text-slate-200" href="/onboarding">
            回到生活盘点补充一下 →
          </Link>
        </div>
      </main>
    );
  }

  if (!computed) return null;

  const { safetyMonthsRange, months, note } = computed;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">🌙 友余 · Phase 1</p>
            <h1 className="text-2xl font-semibold text-slate-50">压力沙盘</h1>
            <p className="text-sm text-slate-300 mt-1">
              只是推演，不是预言。它的意义是给你一点可控感。
            </p>
          </div>
          <Link className="text-sm text-slate-300 underline" href="/dashboard">
            返回看板
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {([
              ["quit", "离职"],
              ["illness", "大病"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => {
                  setScenario(k);
                  track("sandbox_change_scenario", { scenario: k });
                }}
                className={[
                  "rounded-xl px-3 py-2 text-sm border",
                  scenario === k
                    ? "bg-white/10 text-slate-50 border-white/15"
                    : "bg-slate-900/40 text-slate-300 border-slate-800/70 hover:bg-white/5",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            你的底气大概能撑：{formatMonthsRange(safetyMonthsRange)} 个月（来自盘点区间）
          </div>

          <div className="space-y-2">
            <div className="text-sm text-slate-100 font-medium">把“月支出”轻轻拨一下</div>
            <input
              type="range"
              min={2000}
              max={30000}
              step={100}
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>2000</span>
              <span className="text-slate-50 font-semibold">
                {formatMoney(monthlySpend)} / 月
              </span>
              <span>30000</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
            <div className="text-slate-100 leading-relaxed">
              如果支出控制在 <span className="font-semibold">{formatMoney(monthlySpend)}</span>，
              <br />
              你的安全垫大概能撑 <span className="font-semibold">{months}</span> 个月。
            </div>
            <div className="text-xs text-slate-400 mt-2">{note}</div>
            <div className="text-xs text-slate-500 mt-2">
              本推演只用本地数据与简化假设，不上传任何内容。
            </div>
          </div>

          <div className="pt-2">
            <Link className="text-sm text-slate-300 underline" href="/chat">
              我想聊聊这个压力 →
            </Link>
          </div>
        </section>

        <footer className="pt-2 text-[11px] text-slate-500">
          🛡️ 所有计算均在本地运行，你的隐私正在被温柔守护。
        </footer>
      </div>
    </main>
  );
}
