// components/onboarding/ChoiceChips.tsx

export function ChoiceChips<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { key: T; label: string; hint?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={[
            "rounded-full px-4 py-2 text-sm border transition",
            value === o.key
              ? "border-yy-green bg-white"
              : "border-yy-line bg-white/50",
          ].join(" ")}
        >
          <span className="text-yy-text">{o.label}</span>
          {o.hint ? (
            <span className="ml-2 text-xs text-yy-muted">{o.hint}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
