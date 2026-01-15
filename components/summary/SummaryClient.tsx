"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadUserDefined } from "@/lib/storage";
import { track } from "@/lib/analytics";
import type { UserDefined } from "@/types/compass";
import { calcMilestone, calcSafetyNetMonths, formatMonthsRange, formatMoney } from "@/lib/calculations";

export function SummaryClient() {
  const [user, setUser] = useState<UserDefined | null>(null);
  const [clickedPaywall, setClickedPaywall] = useState(false);

  useEffect(() => {
    const u = loadUserDefined();
    setUser(u);
    track("summary_view");
  }, []);

  const computed = useMemo(() => {
    if (!user) return null;
    const safety = calcSafetyNetMonths(user);
    const milestone = calcMilestone(user);
    return { safety, milestone };
  }, [user]);

  if (!user || !computed) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
        <div className="mx-auto max-w-3xl px-5 py-12 space-y-6">
          <h1 className="text-2xl font-semibold text-slate-50">{'月度总结'}</h1>
          <p className="text-sm text-slate-300">
            {'你还没完成生活盘点。先写个大概，我们才能生成总结。'}
          </p>
          <Link className="underline text-slate-200" href="/onboarding">
            {'去完成生活盘点 →'}
          </Link>
        </div>
      </main>
    );
  }

  const { safety, milestone } = computed;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">{'🌙 友余 · Phase 1'}</p>
            <h1 className="text-2xl font-semibold text-slate-50">{'月度总结'}</h1>
            <p className="text-sm text-slate-300 mt-1">
              {'这不是评判，是把你这个月的节奏轻轻照亮。'}
            </p>
          </div>
          <Link className="text-sm text-slate-300 underline" href="/dashboard">
            {'返回看板'}
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-3">
          <div className="text-sm font-medium text-slate-100">{'这段时间，你的"底气"大概是'}</div>
          <div className="text-slate-200">
            {'还能安心生活：'}
            <span className="font-semibold">{formatMonthsRange(safety)}</span>
          </div>
          <div className="text-xs text-slate-400">
            {'只做节奏感知，不追求精确；你可以随时回到盘点页调整区间。'}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-3">
          <div className="text-sm font-medium text-slate-100">{'你的"微目标"'}</div>
          <div className="text-slate-200">
            {milestone.name}：{'已存入 '}
            <span className="font-semibold">{formatMoney(milestone.saved)}</span> /{' '}
            {formatMoney(milestone.amount)}
          </div>
          <div className="text-xs text-slate-400">
            {'不用急，慢慢把第一步点亮就好。'}
          </div>
        </section>

        {/* 🔒付费意愿验证入口 */}
        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium text-slate-100">{'🔒 定制行为偏误与压力深度报告'}</div>
              <div className="text-xs text-slate-400 mt-1">
                {'内测功能：更细的"消费动机 / 压力触发点 / 节奏建议"。'}
              </div>
            </div>
            <button
              onClick={() => {
                setClickedPaywall(true);
                track("paywall_click_report", { from: "summary" });
              }}
              className="rounded-xl px-3 py-2 text-sm bg-white/10 text-slate-50 border border-white/15 hover:bg-white/15"
            >
              {'我想用'}
            </button>
          </div>

          {clickedPaywall && (
            <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-900/40 p-4 text-sm text-slate-200">
              {'收到～这个功能正在内测。'}
              <div className="text-xs text-slate-400 mt-1">
                {'你刚才的点击会被记录为"意愿信号"。上线后我会给你优先体验（Phase 1 先用本地记录，不上传任何隐私数据）。'}
              </div>
            </div>
          )}
        </section>

        <footer className="pt-2 text-[11px] text-slate-500">
          {'🛡️ 所有计算均在本地运行，你的隐私正在被温柔守护。'}
        </footer>
      </div>
    </main>
  );
}
