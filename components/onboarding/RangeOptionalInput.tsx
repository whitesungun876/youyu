// components/onboarding/RangeOptionalInput.tsx

import { useMemo, useState } from "react";

function parseRange(raw: string): { min: number; max: number } | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;

  // 支持 15k-25k / 15000-25000 / 15,000-25,000 / 15k–25k
  const cleaned = s.replace(/,/g, "").replace(/[—–~]/g, "-");
  const parts = cleaned.split("-").map((x) => x.trim());
  if (parts.length === 1) {
    const n = toNumber(parts[0]);
    return n != null ? { min: n, max: n } : null;
  }
  if (parts.length >= 2) {
    const a = toNumber(parts[0]);
    const b = toNumber(parts[1]);
    if (a == null || b == null) return null;
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    return { min, max };
  }
  return null;
}

function toNumber(x: string): number | null {
  const m = x.match(/^(\d+(\.\d+)?)(k)?$/);
  if (!m) return null;
  const v = Number(m[1]);
  if (Number.isNaN(v)) return null;
  return m[3] ? Math.round(v * 1000) : Math.round(v);
}

export function RangeOptionalInput({
  label,
  placeholder,
  onValidRange,
  helper,
}: {
  label: string;
  placeholder: string;
  helper?: string;
  onValidRange: (r: { min: number; max: number } | null) => void;
}) {
  const [raw, setRaw] = useState('');

  const parsed = useMemo(() => parseRange(raw), [raw]);

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-yy-text">{label}</div>
      {helper ? <div className="mt-1 text-xs text-yy-muted">{helper}</div> : null}

      <input
        value={raw}
        onChange={(e) => {
          const v = e.target.value;
          setRaw(v);
          onValidRange(parseRange(v));
        }}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-yy-line bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--yy-yellow))]"
      />

      {raw && !parsed ? (
        <p className="mt-2 text-xs text-yy-muted">
          {'你可以写：15k-25k 或 15000-25000（也可以留空）'}
        </p>
      ) : null}
    </div>
  );
}
