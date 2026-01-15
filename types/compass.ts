export type Tightness = "tight" | "ok" | "loose";

export type UserDefined = {
  safetyNetMin: number;
  safetyNetMax: number;

  monthlySpendMin: number;
  monthlySpendMax: number;

  dreamText: string;

  milestoneName?: string;
  milestoneAmount?: number;
  milestoneSaved?: number;

  // 可选：用于"真实自由额度公式"
  monthlyIncomeMin?: number;
  monthlyIncomeMax?: number;
  fixedCostMin?: number;
  fixedCostMax?: number;
  presetSaveMin?: number;
  presetSaveMax?: number;

  tightness?: Tightness;
  createdAt?: number;
  lastUpdatedAt?: number;
};
