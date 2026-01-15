"use client";

export function MilestoneJar({ progress }: { progress: number }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-2xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-[6px]" />
        <div
          className="absolute bottom-0 left-0 right-0 bg-white/12 transition-[height] duration-500"
          style={{ height: `${Math.round(p * 100)}%` }}
        />
        <div className="absolute inset-0 ring-1 ring-white/5 rounded-2xl" />
      </div>
      <div className="text-xs text-slate-300">
        小罐子亮起了{" "}
        <span className="text-slate-100">{Math.round(p * 100)}%</span>
      </div>
    </div>
  );
}
