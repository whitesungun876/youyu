// components/onboarding/StepShell.tsx

export function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-yy-line bg-white/60 backdrop-blur-md p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-yy-text">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-sm leading-relaxed text-yy-muted">{subtitle}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
