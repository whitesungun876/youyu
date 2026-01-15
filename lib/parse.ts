// lib/parse.ts
import type { RangeNumber } from "@/types/compass";

function normalizeDashes(s: string) {
  return s.replace(/[–—~]/g, "-");
}

function stripSpacesAndCommas(s: string) {
  return s.replace(/,/g, "").trim();
}

function parseToken(token: string): number | null {
  const t = stripSpacesAndCommas(token).toLowerCase();
  if (!t) return null;

  const kMatch = t.match(/^(\d+(\.\d+)?)k$/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);

  const numMatch = t.match(/^(\d+(\.\d+)?)$/);
  if (numMatch) return Math.round(parseFloat(numMatch[1]));

  return null;
}

export function parseRangeInput(input: string): RangeNumber | undefined {
  const raw = stripSpacesAndCommas(normalizeDashes(input));
  if (!raw) return undefined;

  const parts = raw.split("-").map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    const v = parseToken(parts[0]);
    return v === null ? undefined : v;
  }

  if (parts.length === 2) {
    const a = parseToken(parts[0]);
    const b = parseToken(parts[1]);
    if (a === null || b === null) return undefined;

    return { min: Math.min(a, b), max: Math.max(a, b) };
  }

  return undefined;
}

