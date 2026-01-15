// components/onboarding/Field.tsx
"use client";

export function Field({
  label,
  placeholder,
  helper,
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  helper?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm text-slate-200">{label}</label>
        {helper ? <span className="text-xs text-slate-400">{helper}</span> : null}
      </div>

      <input
        className={[
          "w-full rounded-xl border px-4 py-3 text-sm outline-none",
          "bg-slate-900/50 text-slate-100 placeholder:text-slate-500",
          error ? "border-rose-500/60" : "border-slate-700/60",
          "focus:border-slate-400/60",
        ].join(" ")}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="text"
      />

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

