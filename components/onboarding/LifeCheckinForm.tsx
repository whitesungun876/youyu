// components/onboarding/LifeCheckinForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Field } from "./Field";
import { parseRangeInput } from "@/lib/parse";
import { saveUserDefined } from "@/lib/storage";
import type { Tone, UserDefined } from "@/types/compass";

export function LifeCheckinForm() {
  const router = useRouter();
  const tone: Tone = "warm_friend";

  const [monthlyIncomeRaw, setMonthlyIncomeRaw] = useState("");
  const [fixedCostRaw, setFixedCostRaw] = useState("");
  const [savingsRaw, setSavingsRaw] = useState("");

  const [dreamName, setDreamName] = useState("");
  const [dreamTotalRaw, setDreamTotalRaw] = useState("");
  const [dreamSavedRaw, setDreamSavedRaw] = useState("");
  const [monthlySavingGoalRaw, setMonthlySavingGoalRaw] = useState("");

  const parsed = useMemo(() => {
    return {
      monthlyIncome: parseRangeInput(monthlyIncomeRaw),
      monthlyFixedCost: parseRangeInput(fixedCostRaw),
      currentSavings: parseRangeInput(savingsRaw),
      dreamTotal: parseRangeInput(dreamTotalRaw),
      dreamSaved: parseRangeInput(dreamSavedRaw),
      monthlySavingGoal: parseRangeInput(monthlySavingGoalRaw),
    };
  }, [
    monthlyIncomeRaw,
    fixedCostRaw,
    savingsRaw,
    dreamTotalRaw,
    dreamSavedRaw,
    monthlySavingGoalRaw,
  ]);

  const errors = useMemo(() => {
    const e: Record<string, string | undefined> = {};
    const soft = (s: string) => s;

    if (monthlyIncomeRaw.trim() && parsed.monthlyIncome === undefined) {
      e.monthlyIncome = soft("我没太读懂这个范围，可以试试 8k-10k 或 8000-10000 呢。");
    }
    if (fixedCostRaw.trim() && parsed.monthlyFixedCost === undefined) {
      e.fixedCost = soft("可以试试 4000 或 3k-5k 这种写法。");
    }
    if (savingsRaw.trim() && parsed.currentSavings === undefined) {
      e.savings = soft("可以试试 20000 或 15k-25k 这种写法。");
    }

    if (dreamTotalRaw.trim() && parsed.dreamTotal === undefined) {
      e.dreamTotal = soft("目标金额可以写成 30000 或 30k。");
    }
    if (dreamSavedRaw.trim() && parsed.dreamSaved === undefined) {
      e.dreamSaved = soft("已存金额可以写成 500 或 0.5k。");
    }
    if (monthlySavingGoalRaw.trim() && parsed.monthlySavingGoal === undefined) {
      e.monthlySavingGoal = soft("每月存入可以写成 2000 或 2k。");
    }

    // Phase 1：dream 相关先要求用确定数字（便于后续dashboard计算）
    if (typeof parsed.dreamTotal === "object") {
      e.dreamTotal = soft("目标金额这里先用一个具体数字会更好（比如 30000）。");
    }
    if (typeof parsed.dreamSaved === "object") {
      e.dreamSaved = soft("已存金额这里先用一个具体数字会更好（比如 500）。");
    }
    if (typeof parsed.monthlySavingGoal === "object") {
      e.monthlySavingGoal = soft("每月存入这里先用一个具体数字会更好（比如 2000）。");
    }

    return e;
  }, [
    monthlyIncomeRaw,
    fixedCostRaw,
    savingsRaw,
    dreamTotalRaw,
    dreamSavedRaw,
    monthlySavingGoalRaw,
    parsed,
  ]);

  const hasBlockingError = Object.values(errors).some(Boolean);

  const onSubmit = () => {
    if (hasBlockingError) return;

    const now = Date.now();
    const payload: UserDefined = {
      monthlyIncome: parsed.monthlyIncome,
      monthlyFixedCost: parsed.monthlyFixedCost,
      currentSavings: parsed.currentSavings,
      dream: {
        name: dreamName || undefined,
        totalAmount: typeof parsed.dreamTotal === "number" ? parsed.dreamTotal : undefined,
        savedAmount: typeof parsed.dreamSaved === "number" ? parsed.dreamSaved : undefined,
        monthlySavingGoal:
          typeof parsed.monthlySavingGoal === "number" ? parsed.monthlySavingGoal : undefined,
        milestones: [
          { id: "m1", title: "第一张机票", amount: 6000 },
          { id: "m2", title: "第一晚住宿", amount: 1200 },
        ],
      },
      tone,
      createdAt: now,
      updatedAt: now,
    };

    saveUserDefined(payload);
    router.push("/dashboard");
  };

  const onSkip = () => {
    const now = Date.now();
    const payload: UserDefined = {
      tone: "warm_friend",
      createdAt: now,
      updatedAt: now,
    };
    saveUserDefined(payload);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-50">一次温柔的生活盘点</h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          你可以写得很粗略，甚至跳过。我们只是先帮你把"底气、日常、未来"轻轻放到同一张地图上。
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-slate-100">安全垫 · 给自己一点底气</h3>
          <p className="text-xs text-slate-400">
            即使明天想停下来喘口气，这笔钱也能让你体面地过一阵子。
          </p>
        </div>

        <Field
          label="当前可用存款"
          placeholder="例如：20000 或 15k-25k"
          helper="可跳过"
          value={savingsRaw}
          onChange={setSavingsRaw}
          error={errors.savings}
        />

        <Field
          label="每月刚性支出（房租/房贷/水电/保险等）"
          placeholder="例如：4000 或 3k-5k"
          helper="可跳过"
          value={fixedCostRaw}
          onChange={setFixedCostRaw}
          error={errors.fixedCost}
        />
      </section>

      <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-slate-100">生活圈 · 快乐日常</h3>
          <p className="text-xs text-slate-400">
            不用省得太辛苦，我们只是想让每一分钱更贴近你想要的生活。
          </p>
        </div>

        <Field
          label="月收入"
          placeholder="例如：8k-10k 或 9000"
          helper="可跳过"
          value={monthlyIncomeRaw}
          onChange={setMonthlyIncomeRaw}
          error={errors.monthlyIncome}
        />

        <Field
          label="每月想存入梦想库（预设储蓄）"
          placeholder="例如：2000 或 2k"
          helper="可跳过"
          value={monthlySavingGoalRaw}
          onChange={setMonthlySavingGoalRaw}
          error={errors.monthlySavingGoal}
        />
      </section>

      <section className="rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-medium text-slate-100">梦想库 · 给未来的自己留一点</h3>
          <p className="text-xs text-slate-400">
            旅行也好，小窝也好。我们会用"微目标"帮你先看到第一步。
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-200">梦想的名字</label>
          <input
            className="w-full rounded-xl border border-slate-700/60 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-400/60"
            placeholder="例如：去冰岛 / 买一台相机 / 攒一笔搬家基金"
            value={dreamName}
            onChange={(e) => setDreamName(e.target.value)}
          />
          <p className="text-xs text-slate-400">可跳过</p>
        </div>

        <Field
          label="目标总金额"
          placeholder="例如：30000 或 30k"
          helper="可跳过"
          value={dreamTotalRaw}
          onChange={setDreamTotalRaw}
          error={errors.dreamTotal}
        />

        <Field
          label="目前已存入"
          placeholder="例如：500"
          helper="可跳过"
          value={dreamSavedRaw}
          onChange={setDreamSavedRaw}
          error={errors.dreamSaved}
        />
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={hasBlockingError}
          className="rounded-2xl px-5 py-3 text-sm font-medium bg-slate-100 text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          开始我的盘点地图
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="rounded-2xl px-5 py-3 text-sm font-medium border border-slate-700/60 text-slate-100 bg-transparent hover:bg-slate-900/30"
        >
          我先随便看看
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        说明：Phase 1 默认将数据保存在你的浏览器本地（localStorage）。你可以随时在设置页"一键重置（抹掉记忆）"。
      </p>
    </div>
  );
}
