import type { Tightness, UserDefined } from "@/types/compass";

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function mid(min: number, max: number) {
  return (min + max) / 2;
}

export function pickByTightness(range: [number, number], t: Tightness) {
  const [a, b] = range;
  if (t === "tight") return a;
  if (t === "loose") return b;
  return mid(a, b);
}

/** 安全垫：可支撑月数区间 */
export function calcSafetyMonthsRange(u: UserDefined): [number, number] {
  // 最保守：最小存款 / 最大月支出
  const minMonths = u.safetyNetMin / Math.max(1, u.monthlySpendMax);
  // 最乐观：最大存款 / 最小月支出
  const maxMonths = u.safetyNetMax / Math.max(1, u.monthlySpendMin);
  const a = clamp(minMonths, 0, 120);
  const b = clamp(maxMonths, 0, 120);
  return a <= b ? [a, b] : [b, a];
}

/** 生活圈：Phase 1 简化日自由额度（先用月支出区间 -> 日均支出区间，再给"可自由"一个固定比例） */
export function calcDailyFreedomRange(u: UserDefined): [number, number] {
  // 这里是"Phase 1 简化模型"：把月支出按 30 天摊平，然后假设其中 15% 可作为当日"自由微调额度"
  const minDailySpend = u.monthlySpendMin / 30;
  const maxDailySpend = u.monthlySpendMax / 30;

  const minFreedom = minDailySpend * 0.15;
  const maxFreedom = maxDailySpend * 0.15;

  const a = clamp(minFreedom, 0, 999999);
  const b = clamp(maxFreedom, 0, 999999);
  return a <= b ? [a, b] : [b, a];
}

/** 梦想库：微目标进度 0~1 */
export function calcMilestoneProgress(u: UserDefined): number {
  const amount = u.milestoneAmount ?? 500;
  const saved = u.milestoneSaved ?? 0;
  if (amount <= 0) return 0;
  return clamp(saved / amount, 0, 1);
}

export function formatRange(a: number, b: number, unit = "") {
  // 保留 1 位小数更温柔
  const fa = Math.round(a * 10) / 10;
  const fb = Math.round(b * 10) / 10;
  return `${fa}${unit}–${fb}${unit}`;
}

export function formatMoney(n: number) {
  // 简单千分位
  return `¥${Math.round(n).toLocaleString("zh-CN")}`;
}
