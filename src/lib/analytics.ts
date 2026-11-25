import type { Budget, Transaction } from "./types";

export interface MonthPoint {
  key: string; // "2026-11"
  label: string; // "Nov"
  fullLabel: string; // "November 2026"
  income: number;
  expense: number;
  net: number;
}

export interface DashboardData {
  stats: {
    balance: number;
    balanceChangePct: number | null;
    balanceSpark: number[];
    income: number;
    incomeChangePct: number | null;
    incomeProgress: number; // this month's income vs last month, 0..1
    expense: number;
    expenseChangePct: number | null;
    expenseBars: number[];
    savings: number;
    savingsRate: number | null;
    savingsBars: number[];
  };
  months: MonthPoint[];
  breakdown: { category: string; amount: number; pct: number }[];
  breakdownLabel: string;
  budgets: (Budget & { spent: number; pct: number })[];
}

const monthKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const pctChange = (curr: number, prev: number) =>
  prev === 0 ? null : ((curr - prev) / Math.abs(prev)) * 100;

const signed = (t: Transaction) => (t.type === "income" ? t.amount : -t.amount);

export function buildDashboard(
  all: Transaction[],
  budgets: Budget[],
  now: Date,
): DashboardData {
  // Failed transactions never moved money.
  const txs = all.filter((t) => t.status !== "failed");

  // Last 12 months, oldest first.
  const months: MonthPoint[] = [];
  const byKey = new Map<string, MonthPoint>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const p: MonthPoint = {
      key: monthKey(d),
      label: d.toLocaleString("en-US", { month: "short" }),
      fullLabel: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
      income: 0,
      expense: 0,
      net: 0,
    };
    months.push(p);
    byKey.set(p.key, p);
  }
  for (const t of txs) {
    const p = byKey.get(monthKey(new Date(t.occurred_at)));
    if (!p) continue;
    if (t.type === "income") p.income += t.amount;
    else p.expense += t.amount;
  }
  for (const p of months) {
    p.income = round(p.income);
    p.expense = round(p.expense);
    p.net = round(p.income - p.expense);
  }

  const curr = months[11];
  const prev = months[10];

  // Balance now vs. at the end of last month.
  const balance = round(txs.reduce((s, t) => s + signed(t), 0));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const balancePrev = txs
    .filter((t) => new Date(t.occurred_at) < startOfMonth)
    .reduce((s, t) => s + signed(t), 0);

  // Daily series over the last 30 days.
  const DAYS = 30;
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (DAYS - 1));
  const dailyNet = new Array<number>(DAYS).fill(0);
  let balanceBefore = 0;
  for (const t of txs) {
    const d = new Date(t.occurred_at);
    if (d < dayStart) {
      balanceBefore += signed(t);
      continue;
    }
    const idx = Math.floor((d.getTime() - dayStart.getTime()) / 86_400_000);
    if (idx >= 0 && idx < DAYS) dailyNet[idx] += signed(t);
  }
  const balanceSpark: number[] = [];
  let running = balanceBefore;
  for (const n of dailyNet) balanceSpark.push((running += n));

  // Spending breakdown for the current month.
  const catTotals = new Map<string, number>();
  for (const t of txs) {
    if (t.type !== "expense") continue;
    if (monthKey(new Date(t.occurred_at)) !== curr.key) continue;
    catTotals.set(t.category, (catTotals.get(t.category) ?? 0) + t.amount);
  }
  const breakdownTotal = [...catTotals.values()].reduce((a, b) => a + b, 0);
  const breakdown = [...catTotals.entries()]
    .map(([category, amount]) => ({
      category,
      amount: round(amount),
      pct: breakdownTotal ? (amount / breakdownTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    stats: {
      balance,
      balanceChangePct: pctChange(balance, balancePrev),
      balanceSpark,
      income: curr.income,
      incomeChangePct: pctChange(curr.income, prev.income),
      incomeProgress: prev.income ? Math.min(curr.income / prev.income, 1) : curr.income ? 1 : 0,
      expense: curr.expense,
      expenseChangePct: pctChange(curr.expense, prev.expense),
      expenseBars: months.slice(-7).map((m) => m.expense),
      savings: curr.net,
      savingsRate: curr.income ? (curr.net / curr.income) * 100 : null,
      savingsBars: dailyNet.map((n) => Math.max(n, 0)),
    },
    months,
    breakdown,
    breakdownLabel: curr.fullLabel,
    budgets: budgets
      .map((b) => {
        const spent = round(catTotals.get(b.category) ?? 0);
        return { ...b, spent, pct: (spent / b.monthly_limit) * 100 };
      })
      .sort((a, b) => b.pct - a.pct),
  };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
