"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { UserDefined } from "@/types/compass";
import type { Transaction, Motive, TierState } from "@/types/finance";

import { loadUserDefined, loadTransactions } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/calculations";

import { TierCard } from "./TierCard";
import AchievementBadge from "./AchievementBadge";
import MonthlyReportCard from "./MonthlyReportCard";

type Range = { min: number; max: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function toNum(x: unknown, fallback: number) {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function monthKey(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthsRange(r: Range) {
  const a = Math.max(0, Math.floor(r.min));
  const b = Math.max(a, Math.ceil(r.max));
  return `${a}–${b}`;
}

/** 安全垫可撑月数范围：[Smin/Emax, Smax/Emin] */
function calcSafetyMonthsFromRanges(u: UserDefined): Range {
  const sMin = Math.max(0, toNum((u as any).safetyNetMin, 0));
  const sMax = Math.max(sMin, toNum((u as any).safetyNetMax, sMin));

  const spendMin = Math.max(1, toNum((u as any).monthlySpendMin, 1));
  const spendMax = Math.max(spendMin, toNum((u as any).monthlySpendMax, spendMin));

  return {
    min: clamp(sMin / spendMax, 0, 120),
    max: clamp(sMax / spendMin, 0, 120),
  };
}

function motiveLabel(m: Motive) {
  switch (m) {
    case "needs":
      return "真实需要";
    case "emotion":
      return "情绪补偿";
    case "social":
      return "社交面子";
    default:
      return "不确定";
  }
}

export default function DashboardClient() {
  const [user, setUser] = useState<UserDefined | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [spendMode, setSpendMode] = useState<"tight" | "normal" | "wide">("normal");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(loadUserDefined());
    setTxs(loadTransactions());
    setHydrated(true);
    track("dashboard_view");
  }, []);

  // Chat 写入交易后触发：window.dispatchEvent(new Event("youyu:tx_updated"))
  useEffect(() => {
    const onUpdate = () => setTxs(loadTransactions());
    window.addEventListener("youyu:tx_updated", onUpdate);
    return () => window.removeEventListener("youyu:tx_updated", onUpdate);
  }, []);

  // ✅ Hooks 一定要在 return 之前
  const currentMonth = useMemo(() => monthKey(Date.now()), []);

  const hasCore = useMemo(() => {
    if (!user) return false;
    return (
      Number.isFinite(toNum((user as any).safetyNetMin, NaN)) &&
      Number.isFinite(toNum((user as any).safetyNetMax, NaN)) &&
      Number.isFinite(toNum((user as any).monthlySpendMin, NaN)) &&
      Number.isFinite(toNum((user as any).monthlySpendMax, NaN))
    );
  }, [user]);

  const derived = useMemo(() => {
    // ✅ user 为空时也要返回默认值，避免早退
    if (!user) {
      return {
        spendMid: 8000,
        safetyRange: { min: 0, max: 0 },
        safetyMidMonths: 0,
        safetyFill: 0,
        budgetPerDay: 0,
        spentToday: 0,
        freeToday: 0,
        freeFill: 0,
        monthSpend: 0,
        topMotive: "unknown" as Motive,
      };
    }

    const spendMin = Math.max(1, toNum((user as any).monthlySpendMin, 8000));
    const spendMax = Math.max(spendMin, toNum((user as any).monthlySpendMax, spendMin));
    const spendMid = Math.round((spendMin + spendMax) / 2);

    // 安全垫范围 + 中位可撑月数（用于水位）
    const safetyRange = hasCore ? calcSafetyMonthsFromRanges(user) : { min: 0, max: 0 };

    const sMin = Math.max(0, toNum((user as any).safetyNetMin, 0));
    const sMax = Math.max(sMin, toNum((user as any).safetyNetMax, sMin));
    const safetyMid = (sMin + sMax) / 2;

    const safetyMidMonths = hasCore
      ? clamp(safetyMid / Math.max(1, spendMid), 0, 120)
      : 0;

    // 水位：12 个月为满（Phase 1）
    const FULL_MONTHS = 12;
    const safetyFill = hasCore ? clamp(safetyMidMonths / FULL_MONTHS, 0, 1) : 0;

    // 今日自由额度（简化）：(月中位/30)*视角 - 今日已花（不含避坑）
    const basePerDay = spendMid / 30;
    const factor = spendMode === "tight" ? 0.8 : spendMode === "wide" ? 1.2 : 1.0;
    const budgetPerDay = basePerDay * factor;

    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endToday = startToday + 24 * 60 * 60 * 1000 - 1;

    const spentToday = txs
      .filter((t) => t && !t.isIntercepted && t.timestamp >= startToday && t.timestamp <= endToday)
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const freeToday = Math.max(0, budgetPerDay - spentToday);
    const freeFill = clamp(freeToday / Math.max(1, budgetPerDay), 0, 1);

    // 本月轻量洞察
    const monthSpendTxs = txs.filter(
      (t) => t && !t.isIntercepted && monthKey(t.timestamp) === currentMonth
    );

    const monthSpend = monthSpendTxs.reduce((s, t) => s + Number(t.amount || 0), 0);

    const counts: Record<Motive, number> = { needs: 0, emotion: 0, social: 0, unknown: 0 };
    for (const t of monthSpendTxs) {
      const mv = (t.motive || "unknown") as Motive;
      counts[mv] = (counts[mv] ?? 0) + 1;
    }
    const topMotive = (Object.keys(counts) as Motive[]).sort(
      (a, b) => counts[b] - counts[a]
    )[0];

    return {
      spendMid,
      safetyRange,
      safetyMidMonths,
      safetyFill,
      budgetPerDay,
      spentToday,
      freeToday,
      freeFill,
      monthSpend,
      topMotive,
    };
  }, [user, txs, spendMode, hasCore, currentMonth]);

  const tiers = useMemo(() => {
    // ✅ user 为空也返回占位 tiers
    const safetyTier: TierState = {
      key: "safety" as const,
      title: "底气水位",
      subtitle: user ? "用水位呈现，不用精确数字吓你" : "加载中…",
      hint: user ? "如果你想要更确定的安全感，可以点开沙盘做一次「安全感检测」。"
        : " ",
      current: user ? Math.round(derived.safetyMidMonths * 10) / 10 : 0,
      target: 12,
      unitLabel: "个月",
      metaLine1: user && hasCore
        ? `可撑区间：${formatMonthsRange(derived.safetyRange)} 个月`
        : undefined,
      metaLine2: user && hasCore ? "水位=中位估算 ÷ 12个月（封顶）" : undefined,
      fill: user ? derived.safetyFill : 0,
    };

    const lifestyleTier: TierState = {
      key: "lifestyle" as const,
      title: "今日自由额度",
      subtitle: user ? `按月支出中位估算：${formatMoney(derived.spendMid)} / 月` : "加载中…",
      hint: "今天紧一点/宽裕点只是视角选择，不是纪律考核。",
      current: user ? Math.round(derived.freeToday) : 0,
      target: user ? Math.round(derived.budgetPerDay) : 0,
      unitLabel: "元",
      metaLine1: user
        ? `今日已记支出：${formatMoney(derived.spentToday)} 元（不含避坑）`
        : undefined,
      metaLine2: user
        ? spendMode === "tight"
          ? "视角：紧一点（×0.8）"
          : spendMode === "wide"
            ? "视角：宽裕点（×1.2）"
            : "视角：刚刚好（×1.0）"
        : undefined,
      fill: user ? derived.freeFill : 0,
    };

    const dreamTier: TierState = {
      key: "dream" as const,
      title: "梦想进度",
      subtitle: "把数字翻译成生活目标，让你知道自己在靠近什么",
      hint: "Phase 1 先做入口；后续接入梦想库与里程碑。",
      current: 0,
      unitLabel: "—",
      fill: 0.15,
      metaLine1: "（占位）点进聊天，把你的梦想说给我听",
    };

    return { safetyTier, lifestyleTier, dreamTier };
  }, [user, hasCore, derived, spendMode]);

  // ✅ 现在才根据状态渲染不同 UI（不会影响 hooks）
  if (!hydrated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-5 py-12 text-slate-300">加载中…</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-5 py-12 space-y-6">
          <h1 className="text-2xl font-semibold text-slate-50">节奏看板</h1>
          <p className="text-sm text-slate-300">你还没完成生活盘点，我们先从「底气、日常、梦想」开始。</p>
          <Link className="underline text-slate-200" href="/onboarding">
            去完成生活盘点 →
          </Link>
        </div>
      </main>
    );
  }

  // ✅ 正常看板渲染（你原来的 JSX）

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">🌙 友余 · Phase 1</p>
            <h1 className="text-2xl font-semibold text-slate-50">节奏看板</h1>
            <p className="text-sm text-slate-300 mt-1">
              这里不审判，只呈现。你只需要每天来看看水位。
            </p>
          </div>
          <Link className="text-sm text-slate-300 underline" href="/chat">
            和我聊聊 →
          </Link>
        </header>

        {/* 三张 Tier 卡：底气 / 今日 / 梦想 */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <TierCard tier={tiers.safetyTier} />
            <Link
              href="/sandbox"
              className="inline-block text-xs text-slate-300 underline"
              onClick={() => track("click_sandbox_from_dashboard")}
            >
              看看我的抗风险能力 →
            </Link>
          </div>

          <div className="space-y-2">
            <TierCard tier={tiers.lifestyleTier} />
            <div className="flex flex-wrap gap-2">
              {[
                ["tight", "紧一点"],
                ["normal", "刚刚好"],
                ["wide", "宽裕点"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => {
                    setSpendMode(k as any);
                    track("dashboard_change_spend_mode", { mode: k });
                  }}
                  className={[
                    "rounded-xl px-3 py-2 text-xs border",
                    spendMode === k
                      ? "bg-white/10 text-slate-50 border-white/15"
                      : "bg-slate-900/40 text-slate-300 border-slate-800/70 hover:bg-white/5",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section>
          <TierCard tier={tiers.dreamTier} />
          <div className="mt-2">
            <Link className="text-xs text-slate-300 underline" href="/chat">
              同步一下梦想 →
            </Link>
          </div>
        </section>

        {/* 新卡片：避坑成就 + 月度总结 */}
        <div className="space-y-4">
          <AchievementBadge />
          <MonthlyReportCard />
        </div>

        {/* 本月轻量洞察 */}
        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
          <div className="text-sm font-medium text-slate-100">本月轻量洞察</div>
          <div className="mt-2 text-xs text-slate-300">
            你最常见的动机是：{" "}
            <span className="text-slate-50 font-semibold">{motiveLabel(derived.topMotive)}</span>
            。这不是对错，只是当下的生活信号。
          </div>
          <div className="mt-2 text-xs text-slate-400">
            本月支出累计：{formatMoney(derived.monthSpend)} 元（不含避坑）
          </div>
        </section>

        <footer className="pt-2 text-[11px] text-slate-500">
          🛡️ 所有计算均在本地运行，你的隐私正在被温柔守护。
        </footer>
      </div>
    </main>
  );
}
