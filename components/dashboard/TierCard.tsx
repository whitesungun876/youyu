"use client";

import { TierState } from "@/types/finance";
import { WaterLevel } from "./WaterLevel";

function formatCNY(n: number) {
  return n.toLocaleString("zh-CN");
}

export function TierCard({ tier }: { tier: TierState }) {
  const { title, subtitle, hint, current, target, unitLabel, metaLine1, metaLine2, milestone } = tier;

  const mainLine =
    typeof target === "number"
      ? `${formatCNY(current)} / ${formatCNY(target)} ${unitLabel}`
      : `${formatCNY(current)} ${unitLabel}`;

  const milestoneLine =
    milestone
      ? `${milestone.label}：${formatCNY(milestone.current)} / ${formatCNY(milestone.target)} 元`
      : undefined;

  return (
    <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-slate-100">{title}</div>
          <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
        </div>
        <div className="text-xs text-slate-400">—</div>
      </div>

      <WaterLevel fill={tier.fill} />

      <div className="mt-3 space-y-1">
        <div className="text-xs text-slate-200/90">{mainLine}</div>
        {milestoneLine ? (
          <div className="text-xs text-slate-300/80">{milestoneLine}</div>
        ) : null}
        {metaLine1 ? <div className="text-xs text-slate-300/80">{metaLine1}</div> : null}
        {metaLine2 ? <div className="text-xs text-slate-300/80">{metaLine2}</div> : null}
      </div>

      <div className="mt-3 text-xs text-slate-300 leading-relaxed">{hint}</div>
    </section>
  );
}

