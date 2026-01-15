"use client";
import { useEffect, useState } from "react";

export function NumberTicker({
  value,
  format = (n) => String(n),
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState<"up" | "down">("up");

  useEffect(() => {
    setDir(value >= prev ? "up" : "down");
    const t = setTimeout(() => setPrev(value), 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className="relative inline-block h-[1.2em] overflow-hidden align-middle">
      <span
        className={`block transition-transform duration-200 ${
          dir === "up" ? "-translate-y-[1.2em]" : "translate-y-[1.2em]"
        }`}
      >
        <span className="block">{format(prev)}</span>
        <span className="block">{format(value)}</span>
      </span>
    </span>
  );
}
