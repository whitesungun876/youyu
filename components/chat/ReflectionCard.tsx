"use client";

import { useState } from "react";

export type ReflectionResult = {
  motive: "真实需要" | "情绪补偿" | "社交面子" | "不确定";
  closerToGoal: "是" | "否";
  regretTomorrow: "会" | "不会";
};

export function ReflectionCard({
  onSubmit,
  onSkip,
}: {
  onSubmit: (r: ReflectionResult) => void;
  onSkip: () => void;
}) {
  const [motive, setMotive] = useState<ReflectionResult["motive"]>("不确定");
  const [closerToGoal, setCloserToGoal] =
    useState<ReflectionResult["closerToGoal"]>("是");
  const [regretTomorrow, setRegretTomorrow] =
    useState<ReflectionResult["regretTomorrow"]>("不会");

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs border transition ${
      active
        ? "bg-indigo-400/15 border-indigo-300/30 text-slate-50"
        : "bg-slate-950/30 border-slate-800/60 text-slate-300 hover:bg-slate-900/30"
    }`;

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-4">
      <div className="text-sm text-slate-100">三问小卡（可跳过）</div>

      <div className="space-y-2">
        <div className="text-xs text-slate-400">这次消费更像是：</div>
        <div className="flex flex-wrap gap-2">
          {(["真实需要", "情绪补偿", "社交面子", "不确定"] as const).map((x) => (
            <button
              key={x}
              className={chip(motive === x)}
              onClick={() => setMotive(x)}
              type="button"
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-400">它是否靠近你的目标？</div>
        <div className="flex gap-2">
          {(["是", "否"] as const).map((x) => (
            <button
              key={x}
              className={chip(closerToGoal === x)}
              onClick={() => setCloserToGoal(x)}
              type="button"
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-slate-400">明天可能会后悔吗？</div>
        <div className="flex gap-2">
          {(["会", "不会"] as const).map((x) => (
            <button
              key={x}
              className={chip(regretTomorrow === x)}
              onClick={() => setRegretTomorrow(x)}
              type="button"
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          className="text-xs text-slate-400 hover:text-slate-200"
          onClick={onSkip}
          type="button"
        >
          跳过
        </button>
        <button
          className="rounded-full bg-indigo-400/15 border border-indigo-300/30 px-4 py-2 text-xs text-slate-50 hover:bg-indigo-400/20 transition"
          onClick={() => onSubmit({ motive, closerToGoal, regretTomorrow })}
          type="button"
        >
          记录一下
        </button>
      </div>
    </div>
  );
}

