"use client";

export function TipBubble({ text }: { text: string }) {
  return (
    <div className="absolute z-20 mt-2 w-64 rounded-2xl border border-slate-800/60 bg-slate-950/70 p-3 text-xs text-slate-200 shadow-lg">
      <div className="leading-relaxed">{text}</div>
      <div className="mt-2 text-[11px] text-slate-400">{'（只是温柔的推演，不是建议）'}</div>
    </div>
  );
}
