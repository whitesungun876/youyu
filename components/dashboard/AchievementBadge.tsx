"use client";

import { useEffect, useMemo, useState } from "react";
import { loadTransactions } from "@/lib/storage";
import { formatMoney } from "@/lib/calculations";
import type { Transaction } from "@/types/finance";

export default function AchievementBadge() {
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    const load = () => setTxs(loadTransactions());
    load();

    // 任何地方写完交易后：window.dispatchEvent(new Event("youyu:tx_updated"))
    const onUpdate = () => load();
    window.addEventListener("youyu:tx_updated", onUpdate);
    return () => window.removeEventListener("youyu:tx_updated", onUpdate);
  }, []);

  const interceptedAmount = useMemo(() => {
    return txs
      .filter((t) => t && t.isIntercepted)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [txs]);

  if (interceptedAmount <= 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 text-amber-200">
            {/* Trophy icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="opacity-90"
              aria-hidden="true"
            >
              <path
                d="M8 4h8v3a4 4 0 0 1-8 0V4Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M6 7H4a2 2 0 0 0 2 2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M18 7h2a2 2 0 0 1-2 2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M12 11v4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M9 20h6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M10 15h4v5h-4v-5Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-100">避坑成就</div>
            <div className="text-xs text-slate-300">
              你把选择权留给了更重要的事。
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-300">已避坑金额</div>
          <div className="text-lg font-semibold text-slate-50">
            {formatMoney(interceptedAmount)}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-300">
        这不是"没花钱"，而是一次对自己更友好的决定。
      </div>
    </div>
  );
}
