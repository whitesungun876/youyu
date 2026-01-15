"use client";

import { useEffect, useMemo, useState } from "react";
import { loadTransactions } from "@/lib/storage";
import { track } from "@/lib/analytics";
import { formatMoney } from "@/lib/calculations";
import type { Motive, Transaction } from "@/types/finance";

function monthKey(ts: number) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
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

export default function MonthlyReportCard() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);

  const currentMonth = useMemo(() => monthKey(Date.now()), []);

  useEffect(() => {
    const load = () => setTxs(loadTransactions());
    load();

    const onUpdate = () => load();
    window.addEventListener("youyu:tx_updated", onUpdate);
    return () => window.removeEventListener("youyu:tx_updated", onUpdate);
  }, []);

  const monthTxs = useMemo(
    () => txs.filter((t) => t && monthKey(Number(t.timestamp)) === currentMonth),
    [txs, currentMonth]
  );

  const stats = useMemo(() => {
    const spendTxs = monthTxs.filter((t) => !t.isIntercepted);
    const interceptedTxs = monthTxs.filter((t) => t.isIntercepted);

    const spend = spendTxs.reduce((s, t) => s + Number(t.amount || 0), 0);
    const intercepted = interceptedTxs.reduce((s, t) => s + Number(t.amount || 0), 0);

    const counts: Record<Motive, number> = {
      needs: 0,
      emotion: 0,
      social: 0,
      unknown: 0,
    };

    for (const t of spendTxs) {
      const m = (t.motive || "unknown") as Motive;
      counts[m] = (counts[m] ?? 0) + 1;
    }

    const totalCount = spendTxs.length;
    const topMotive = (Object.keys(counts) as Motive[]).sort(
      (a, b) => counts[b] - counts[a]
    )[0];

    return {
      spend,
      intercepted,
      totalCount,
      counts,
      topMotive,
    };
  }, [monthTxs]);

  useEffect(() => {
    // 月报卡被渲染 = 看到了月报（Phase1 简化版）
    track("view_monthly_report", { month: currentMonth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlockClick = () => {
    track("click_wtp_report", {
      month: currentMonth,
      txCount: stats.totalCount,
      spend: stats.spend,
      intercepted: stats.intercepted,
    });
    setOpen(true);
  };

  const empty = monthTxs.length === 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-100">月度总结</div>
          <div className="text-xs text-slate-300">
            {currentMonth} · 你的消费动机画像（轻量版）
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-300">本月支出</div>
          <div className="text-lg font-semibold text-slate-50">
            {formatMoney(stats.spend)}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs text-slate-300">本月记录</div>
          <div className="mt-1 text-base font-semibold text-slate-50">
            {empty ? "0 笔" : `${stats.totalCount} 笔`}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs text-slate-300">本月避坑</div>
          <div className="mt-1 text-base font-semibold text-slate-50">
            {formatMoney(stats.intercepted)}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-300">
        {empty ? (
          <>你还没开始记录。下一次"刚花了一笔钱"，来这里留个痕迹就好。</>
        ) : (
          <>
            你最常见的动机是：{" "}
            <span className="text-slate-100 font-medium">
              {motiveLabel(stats.topMotive)}
            </span>
            。这不是对错，只是你当下的生活信号。
          </>
        )}
      </div>

      {/* 🔒 Blur 锁定区 */}
      <div className="relative mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="pointer-events-none select-none blur-[6px] opacity-80">
          <div className="text-sm font-semibold text-slate-100">深度画像（内测）</div>
          <div className="mt-2 space-y-2 text-xs text-slate-300">
            <div>· 你的"压力触发型消费"高峰时段</div>
            <div>· 最容易被哪些场景带走节奏</div>
            <div>· 如何把"避坑"自动回流到梦想进度</div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleUnlockClick}
            className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-white/15"
          >
            🔒 解锁深度报告
          </button>
        </div>
      </div>

      {/* Phase 1 弹窗：收集意向 */}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-xl">
            <div className="text-base font-semibold text-slate-50">深度报告正在内测</div>
            <div className="mt-2 text-sm text-slate-300">
              点击预约即可获得首月免费资格（Phase 1 仅收集意向，不扣费）。
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
              >
                先不用
              </button>
              <button
                onClick={() => {
                  track("unlock_modal_reserve", { month: currentMonth });
                  setOpen(false);
                }}
                className="rounded-xl border border-indigo-400/30 bg-indigo-500/20 px-4 py-2 text-sm text-indigo-100 hover:bg-indigo-500/25"
              >
                预约内测
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
