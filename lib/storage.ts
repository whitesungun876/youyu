import type { AppState } from "@/types/profile";
import type { UserDefined } from "@/types/compass";
import type { Transaction } from "@/types/finance";

const KEY = "youyu_state_v1";
const KEY_USER_DEFINED = "youyu:userDefined";

export function loadState(): AppState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

/** 保存用户在 Onboarding/生活盘点中填写的关键参数 */
export function saveUserDefined(data: UserDefined) {
  if (typeof window === "undefined") return; // SSR safety
  localStorage.setItem(KEY_USER_DEFINED, JSON.stringify(data));
}

/** 读取用户已填写的关键参数（用于 Dashboard/Chat） */
export function loadUserDefined(): UserDefined | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY_USER_DEFINED);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserDefined;
  } catch {
    return null;
  }
}

/** 一键重置（抹掉记忆） */
export function clearUserDefined() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_USER_DEFINED);
}

const KEY_TRANSACTIONS = "youyu:transactions";

/** 保存交易流水（消费反思 & 避坑） */
export function saveTransactions(txs: Transaction[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_TRANSACTIONS, JSON.stringify(txs));
}

/** 读取交易流水 */
export function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY_TRANSACTIONS);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Transaction[]) : [];
  } catch {
    return [];
  }
}

/** 清空交易流水 */
export function clearTransactions() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_TRANSACTIONS);
}

/** 新增一笔交易（用于 Chat 消费反思/避坑） */
export function appendTransaction(tx: Transaction) {
  const txs = loadTransactions();
  txs.unshift(tx); // 最新的放前面
  saveTransactions(txs);
  window.dispatchEvent(new Event("youyu:tx_updated"));
}
