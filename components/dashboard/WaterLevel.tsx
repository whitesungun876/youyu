"use client";

type Props = {
  fill: number; // 0~1
};

export function WaterLevel({ fill }: Props) {
  const clamped = Math.max(0, Math.min(1, fill));
  const percent = Math.round(clamped * 100);

  return (
    <div className="mt-4 h-28 rounded-2xl border border-slate-800/50 bg-slate-900/40 overflow-hidden relative">
      {/* glass */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[6px]" />

      {/* water */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-[height] duration-700 ease-out"
        style={{ height: `${percent}%` }}
      >
        <div className="absolute inset-0 bg-indigo-400/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-300/35 via-indigo-200/15 to-transparent" />
      </div>

      {/* percent */}
      <div className="absolute top-3 right-3 text-xs text-slate-200/90">
        {percent}%
      </div>
    </div>
  );
}

