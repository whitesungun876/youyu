// lib/analytics.ts
"use client";

export type AnalyticsEvent = {
  name: string;
  ts: number;
  payload?: Record<string, unknown>;
};

const KEY = "youyu:events_v1";

export function track(name: string, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    const arr: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    arr.push({ name, ts: Date.now(), payload });
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function loadEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

export function clearEvents() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
