"use client";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function LiquidMeter({
  fillPct,
  variant = "calm",
}: {
  fillPct: number; // 0~1
  variant?: "calm" | "low" | "high";
}) {
  const p = clamp01(fillPct);
  const level = `${Math.round(p * 100)}%`;

  // 水位越高越平缓；越低越急
  const amp = variant === "high" ? 6 : variant === "low" ? 14 : 10;

  return (
    <div className="relative h-24 rounded-2xl border border-slate-800/50 bg-slate-900/40 overflow-hidden">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[6px]" />

      <div
        className="absolute bottom-0 left-0 right-0 transition-[height] duration-500 ease-out"
        style={{ height: level }}
      >
        <svg
          className="absolute left-0 bottom-0 w-[200%] h-full wave"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
        >
          <path
            d={`M0,80 C150,${80 - amp} 350,${80 + amp} 600,80 C850,${
              80 - amp
            } 1050,${80 + amp} 1200,80 L1200,200 L0,200 Z`}
            className="fill-white/10"
          />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-white/0 to-white/0" />
      </div>
    </div>
  );
}
