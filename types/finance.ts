export type TierKey = "safety" | "lifestyle" | "dream";

export type TierState = {
  key: TierKey;
  title: string;
  subtitle: string;
  hint: string;

  // display
  current: number; // 当前金额
  target?: number; // 目标金额（梦想库/安全垫可用）
  unitLabel: string; // 元/月等

  // 0~1
  fill: number;

  // optional secondary metrics
  metaLine1?: string;
  metaLine2?: string;

  // dream milestones
  milestone?: {
    label: string; // 第一张机票
    current: number;
    target: number;
  };
};

export type Motive = "needs" | "emotion" | "social" | "unknown";

export interface Transaction {
  id: string;
  amount: number; 
  motive: Motive;
  timestamp: number;
  isIntercepted: boolean;
  note?: string;
}
