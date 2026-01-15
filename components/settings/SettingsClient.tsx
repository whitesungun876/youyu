"use client";

import Link from "next/link";
import { useState } from "react";
import { clearUserDefined, resetState } from "@/lib/storage";
import { clearEvents, track } from "@/lib/analytics";

export function SettingsClient() {
  const [done, setDone] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/40">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400">{'🌙 友余 · Phase 1'}</p>
            <h1 className="text-2xl font-semibold text-slate-50">{'设置'}</h1>
            <p className="text-sm text-slate-300 mt-1">{'友余只属于你。'}</p>
          </div>
          <Link className="text-sm text-slate-300 underline" href="/dashboard">
            {'返回看板'}
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-3">
          <div className="text-sm font-medium text-slate-100">{'隐私'}</div>
          <div className="text-xs text-slate-400 leading-relaxed">
            {'Phase 1 默认把你的盘点数据与使用记录保存在浏览器本地（localStorage）。你可以随时一键清空，重新开始。'}
          </div>

          <button
            onClick={() => {
              resetState();
              clearUserDefined();
              clearEvents();
              track("reset_all");
              setDone(true);
            }}
            className="mt-2 rounded-xl px-4 py-2 text-sm bg-white/10 text-slate-50 border border-white/15 hover:bg-white/15"
          >
            {'一键重置（抹掉记忆）'}
          </button>

          {done && (
            <div className="text-xs text-slate-300">
              {'已清空。本地没有留下你的盘点数据与记录了。'}
              <Link className="underline ml-2" href="/onboarding">
                {'重新开始 →'}
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-2">
          <div className="text-sm font-medium text-slate-100">{'导航'}</div>
          <div className="text-sm text-slate-300 flex flex-wrap gap-4">
            <Link className="underline" href="/onboarding">{'生活盘点'}</Link>
            <Link className="underline" href="/dashboard">{'节奏看板'}</Link>
            <Link className="underline" href="/chat">{'和我聊聊'}</Link>
            <Link className="underline" href="/sandbox">{'压力沙盘'}</Link>
            <Link className="underline" href="/summary">{'月度总结'}</Link>
          </div>
        </section>

        <footer className="pt-2 text-[11px] text-slate-500">
          {'🛡️ 所有计算均在本地运行，你的隐私正在被温柔守护。'}
        </footer>
      </div>
    </main>
  );
}
