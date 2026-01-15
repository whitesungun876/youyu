// lib/calculations.ts
import type { Tightness, UserDefined } from "@/types/compass";

export type Range = { min: number; max: number };

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function pickByTightness(r: Range, t: Tightness): number {
  if (t === "tight") return r.min;
  if (t === "loose") return r.max;
  return (r.min + r.max) / 2;
}

/**
 * 安全垫月数区间：
 * [safetyNetMin / monthlySpendMax, safetyNetMax / monthlySpendMin]
 */
export function calcSafetyNetMonths(u: UserDefined): Range {
  const spendMin = Math.max(1, u.monthlySpendMin);
  const spendMax = Math.max(spendMin, u.monthlySpendMax);

  const minMonths = u.safetyNetMin / spendMax;
  const maxMonths = u.safetyNetMax / spendMin;

  return {
    min: clamp(minMonths, 0, 120),
    max: clamp(maxMonths, 0, 120),
  };
}

/**
 * Phase 1 自由额度（简化版）
 * 没有收入/刚性支出/预设储蓄时：用「月支出」推一个"日均可松动空间"
 * 逻辑：把月支出当作生活圈预算 → / 当月剩余天数
 * （等你 Onboarding 加收入/刚性支出后再换真实公式）
 */
export function calcDailyFreedom(u: UserDefined): Range {
  const daysLeft = getDaysLeftInThisMonth();

  // 把 monthlySpend 看作"日常预算"，range 直接除以 daysLeft
  const min = u.monthlySpendMin / daysLeft;
  const max = u.monthlySpendMax / daysLeft;

  return {
    min: clamp(min, 0, 20000),
    max: clamp(max, 0, 20000),
  };
}

export function calcMilestone(u: UserDefined) {
  const name = u.milestoneName ?? "第一步";
  const amount = u.milestoneAmount ?? 500;
  const saved = u.milestoneSaved ?? 0;
  const pct = amount <= 0 ? 0 : clamp(saved / amount, 0, 1);
  return { name, amount, saved, pct };
}

/**
 * Rerouting（Phase 1 轻量版）
 * 用户发生一笔"非计划支出" deltaX 后：
 * A：维持目标（从 dailyFreedom 中扣回去，体现"更紧一点"）
 * B：维持现状（梦想里程碑延后）
 *
 * 这里先用 milestoneAmount 作为"目标池"，用 monthlySpend 的中值作为节奏参照。
 */
export function rerouteAfterExpense(u: UserDefined, deltaX: number) {
  const spendMid = (u.monthlySpendMin + u.monthlySpendMax) / 2;
  const monthlySaveAssume = Math.max(1, Math.round(spendMid * 0.1)); // Phase 1：假设每月能挪出 10% 给梦想
  const daysDelay = Math.round((deltaX / monthlySaveAssume) * 30);

  return {
    deltaX,
    optionA: {
      title: "维持目标",
      desc: "接下来几天轻轻收一点，把节奏拉回去。",
      dailyAdjustment: Math.round(deltaX / 30), // 平摊一个月（示意）
    },
    optionB: {
      title: "维持现状",
      desc: "不勉强自己，但梦想会稍微慢一点。",
      daysDelay,
    },
  };
}

export function formatMoney(n: number) {
  return `¥${Math.round(n)}`;
}

export function formatMonthsRange(r: Range) {
  const min = Math.max(0, Math.floor(r.min));
  const max = Math.max(min, Math.ceil(r.max));
  return `${min}–${max} 个月`;
}

export function getDaysLeftInThisMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const today = now.getDate();
  return Math.max(1, lastDay - today + 1);
}
