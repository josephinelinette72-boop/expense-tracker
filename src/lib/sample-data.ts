import type { Budget, Transaction, TxStatus } from "./types";

/** Small seeded PRNG so sample data is stable between renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Template = { name: string; category: string; min: number; max: number };

const EXPENSES: Template[] = [
  { name: "Grocery Store", category: "Food", min: 40, max: 160 },
  { name: "Coffee", category: "Food", min: 4, max: 12 },
  { name: "Restaurant", category: "Food", min: 25, max: 90 },
  { name: "Uber", category: "Transport", min: 8, max: 35 },
  { name: "Fuel", category: "Transport", min: 30, max: 70 },
  { name: "Electricity Bill", category: "Utilities", min: 60, max: 120 },
  { name: "Internet", category: "Utilities", min: 45, max: 60 },
  { name: "Online Store", category: "Shopping", min: 20, max: 220 },
  { name: "Clothing", category: "Shopping", min: 35, max: 140 },
  { name: "Streaming", category: "Entertainment", min: 10, max: 18 },
  { name: "Cinema", category: "Entertainment", min: 12, max: 40 },
  { name: "Pharmacy", category: "Health", min: 10, max: 60 },
  { name: "Gift", category: "Others", min: 20, max: 120 },
];

/**
 * Generates ~6 months of realistic transactions ending at `now`.
 * Without an id (for inserting into Supabase) or with one (for demo mode).
 */
export function generateSampleTransactions(
  now: Date,
  seed = 42,
): Omit<Transaction, "id">[] {
  const rand = mulberry32(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const amount = (min: number, max: number) =>
    Math.round((min + rand() * (max - min)) * 100) / 100;
  const out: Omit<Transaction, "id">[] = [];

  for (let m = 5; m >= 0; m--) {
    const year = now.getFullYear();
    const month = now.getMonth() - m;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lastDay = m === 0 ? now.getDate() : daysInMonth;
    const at = (day: number) =>
      new Date(
        year,
        month,
        Math.min(day, lastDay),
        8 + Math.floor(rand() * 12),
        Math.floor(rand() * 60),
      ).toISOString();

    // Growth trend so the charts have shape.
    const growth = 1 + (5 - m) * 0.08;

    out.push({
      name: "Monthly Salary",
      category: "Salary",
      type: "income",
      amount: Math.round(5200 * growth),
      status: "complete",
      occurred_at: at(1),
    });
    if (rand() > 0.3 && lastDay >= 15) {
      out.push({
        name: "Freelance Project",
        category: "Freelance",
        type: "income",
        amount: amount(600, 2200),
        status: m === 0 ? "pending" : "complete",
        occurred_at: at(15),
      });
    }
    out.push({
      name: "Apartment Rent",
      category: "Rent",
      type: "expense",
      amount: 1450,
      status: "complete",
      occurred_at: at(2),
    });

    const count = Math.round(14 * growth * (lastDay / daysInMonth));
    for (let i = 0; i < count; i++) {
      const t = pick(EXPENSES);
      const r = rand();
      const status: TxStatus = r > 0.93 ? "failed" : r > 0.85 ? "pending" : "complete";
      out.push({
        name: t.name,
        category: t.category,
        type: "expense",
        amount: amount(t.min, t.max) * (t.category === "Shopping" ? growth : 1),
        status,
        occurred_at: at(1 + Math.floor(rand() * lastDay)),
      });
    }
  }

  return out
    .map((t) => ({ ...t, amount: Math.round(t.amount * 100) / 100 }))
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
}

export function sampleBudgets(): Omit<Budget, "id">[] {
  return [
    { category: "Food", monthly_limit: 600 },
    { category: "Entertainment", monthly_limit: 120 },
    { category: "Shopping", monthly_limit: 500 },
    { category: "Transport", monthly_limit: 250 },
  ];
}

export function demoData(now: Date) {
  return {
    transactions: generateSampleTransactions(now).map((t, i) => ({
      ...t,
      id: `demo-${i}`,
    })) as Transaction[],
    budgets: sampleBudgets().map((b, i) => ({ ...b, id: `demo-b-${i}` })),
  };
}
