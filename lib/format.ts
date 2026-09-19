const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹8,50,000 — Indian digit grouping. */
export function formatINR(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `₹${inr.format(Math.round(value))}`;
}

export function formatNumberIN(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return inr.format(Math.round(value));
}

/** "8 lakh", "1.25 crore", "45 thousand" — helps customers sanity-check what they typed. */
export function amountInWords(value: number | null | undefined) {
  if (!value || value <= 0) return "";
  const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, ""));
  if (value >= 1_00_00_000) return `${trim(value / 1_00_00_000)} crore`;
  if (value >= 1_00_000) return `${trim(value / 1_00_000)} lakh`;
  if (value >= 1_000) return `${trim(value / 1_000)} thousand`;
  return String(value);
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function relativeDay(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today, ${time}`;
  return formatDateTime(iso);
}

export function parseAmount(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits.slice(0, 12));
}
