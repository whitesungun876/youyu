export type MoneyRange = { min?: number; max?: number; exact?: number };

export type UserProfile = {
  // 核心输入（允许模糊）
  savings?: MoneyRange;          // 当前存款（安全垫）
  monthlySpend?: MoneyRange;     // 月支出（生活圈）
  goalText?: string;             // 财务目标文本（梦想库）
  goalAmount?: MoneyRange;       // 可选：目标金额（不强制）
  city?: string;                 // 可选：用于沙盘兜底
  industry?: string;             // 可选：用于沙盘兜底
};

export type AppState = {
  profile: UserProfile;
  createdAt: number;
  updatedAt: number;
};

