"use client";

import type { QuickActionKey } from "@/types/chat";

export function QuickActions({
  onPick,
}: {
  onPick: (key: QuickActionKey) => void;
}) {
  const items: Array<{ key: QuickActionKey; title: string; desc: string }> = [
    {
      key: "progress",
      title: "💭 想看一眼我的梦想进度",
      desc: "给我一句温柔的总结就好",
    },
    {
      key: "expense",
      title: "💸 刚花了一笔钱，想对齐下",
      desc: "不评判，只帮我想清楚",
    },
    {
      key: "noise",
      title: "📉 市场有点吵，帮我过滤下",
      desc: "只说和我有关的影响",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onPick(it.key)}
          className="rounded-2xl border border-slate-800/60 bg-slate-950/40 px-4 py-3 text-left hover:bg-slate-900/40 transition"
        >
          <div className="text-sm text-slate-100">{it.title}</div>
          <div className="mt-1 text-xs text-slate-400">{it.desc}</div>
        </button>
      ))}
    </div>
  );
}

