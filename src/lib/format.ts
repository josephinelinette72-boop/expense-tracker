const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const usdCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const money = (n: number) => usd.format(n);
export const moneyCents = (n: number) => usdCents.format(n);

export function compactMoney(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return `${sign}$${Math.round(abs)}`;
}

export function formatPct(n: number | null) {
  if (n === null || !Number.isFinite(n)) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(Math.abs(n) < 10 ? 1 : 0)}%`;
}

export function formatTxDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleString("en-US", { month: "short", day: "2-digit" });
  const time = d.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date}, ${time}`;
}
