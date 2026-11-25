"use client";

import {
  ArrowLeftRight,
  ChartColumn,
  LayoutGrid,
  LogOut,
  PieChart,
  Plus,
  Search,
  Settings,
  Target,
} from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { seedSampleData, signOut } from "@/app/actions";
import type { DashboardData } from "@/lib/analytics";
import type { AppUser, Budget } from "@/lib/types";
import { cn, Logo } from "../ui";
import { BudgetPlanner } from "./budget-planner";
import { CashFlowChart } from "./cash-flow-chart";
import { AddTransactionDialog, BudgetDialog } from "./dialogs";
import { IncomeExpenseChart } from "./income-expense-chart";
import { SpendingBreakdown } from "./spending-breakdown";
import { StatCards } from "./stat-cards";
import { TransactionsTable, type TxRow } from "./transactions-table";

const NAV = [
  { id: "top", label: "Dashboard", icon: LayoutGrid },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "breakdown", label: "Spending breakdown", icon: PieChart },
  { id: "cashflow", label: "Cash flow", icon: ChartColumn },
  { id: "budgets", label: "Budgets", icon: Target },
];

export function DashboardView({
  mode,
  user,
  data,
  rows,
  budgets,
}: {
  mode: "demo" | "live";
  user: AppUser;
  data: DashboardData;
  rows: TxRow[];
  budgets: Budget[];
}) {
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeBudget = useCallback(() => setBudgetOpen(false), []);
  const readOnly = mode === "demo";

  return (
    <div id="top" className="min-h-screen p-3 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-[1440px] rounded-[32px] bg-canvas p-4 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.25)] sm:p-6">
        {readOnly && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
            <strong>Demo mode:</strong> showing generated sample data. Add your Supabase keys to{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> to sign in and save real
            transactions.
          </div>
        )}

        <Header user={user} query={query} onQueryChange={setQuery} onAdd={() => setAddOpen(true)} />

        <div className="mt-6 flex gap-6">
          <Sidebar onSettings={() => setBudgetOpen(true)} />

          <main className="min-w-0 flex-1 space-y-4">
            <StatCards stats={data.stats} />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:col-span-8">
                <IncomeExpenseChart months={data.months} />
                <CashFlowChart months={data.months} />
                <div className="lg:col-span-2">
                  <TransactionsTable
                    rows={rows}
                    query={query}
                    onQueryChange={setQuery}
                    readOnly={readOnly}
                    onEmptySeed={!readOnly && <SeedButton />}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 content-start gap-4 lg:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
                <SpendingBreakdown breakdown={data.breakdown} label={data.breakdownLabel} />
                <BudgetPlanner budgets={data.budgets} onEdit={() => setBudgetOpen(true)} />
              </div>
            </div>
          </main>
        </div>
      </div>

      <AddTransactionDialog open={addOpen} onClose={closeAdd} />
      <BudgetDialog open={budgetOpen} onClose={closeBudget} budgets={budgets} />
    </div>
  );
}

function Header({
  user,
  query,
  onQueryChange,
  onAdd,
}: {
  user: AppUser;
  query: string;
  onQueryChange: (q: string) => void;
  onAdd: () => void;
}) {
  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-3 lg:w-[calc(25%+3.5rem)]">
        <Logo />
        <div>
          <p className="font-semibold tracking-tight">Pocketwise</p>
          <p className="text-xs text-muted">Manage your finance</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add transaction"
          title="Add transaction"
          className="grid size-11 place-items-center rounded-2xl bg-white text-ink shadow-sm transition hover:bg-ink hover:text-white"
        >
          <Plus className="size-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-coral-200 to-coral-500 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold capitalize">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
        </div>
      </div>

      <label className="relative ml-auto flex w-full items-center sm:w-72">
        <span className="sr-only">Search transactions</span>
        <span className="absolute left-1 grid size-9 place-items-center rounded-full bg-white">
          <Search className="size-4" />
        </span>
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              document.getElementById("transactions")?.scrollIntoView({ behavior: "smooth" });
          }}
          placeholder="Start searching here…"
          className="h-11 w-full rounded-full bg-transparent pr-4 pl-12 text-sm outline-none placeholder:text-muted focus:bg-white"
        />
      </label>
    </header>
  );
}

function Sidebar({ onSettings }: { onSettings: () => void }) {
  const [active, setActive] = useState("top");
  return (
    <nav
      aria-label="Sections"
      className="sticky top-6 hidden h-[calc(100vh-10rem)] max-h-[720px] w-14 shrink-0 flex-col items-center justify-between rounded-3xl bg-white py-4 md:flex"
    >
      <ul className="flex flex-col gap-3">
        {NAV.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => setActive(id)}
              aria-label={label}
              title={label}
              aria-current={active === id ? "true" : undefined}
              className={cn(
                "grid size-10 place-items-center rounded-xl transition",
                active === id ? "bg-ink text-white" : "text-ink hover:bg-canvas",
              )}
            >
              <Icon className="size-5" strokeWidth={1.8} />
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onSettings}
          aria-label="Budget settings"
          title="Budget settings"
          className="grid size-10 place-items-center rounded-xl text-ink transition hover:bg-canvas"
        >
          <Settings className="size-5" strokeWidth={1.8} />
        </button>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="grid size-10 place-items-center rounded-xl text-ink transition hover:bg-coral-50 hover:text-coral-600"
          >
            <LogOut className="size-5" strokeWidth={1.8} />
          </button>
        </form>
      </div>
    </nav>
  );
}

function SeedButton() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await seedSampleData();
            if (res.error) setError(res.error);
          })
        }
        className="rounded-xl bg-ink px-4 py-2 text-xs font-medium text-white hover:bg-ink/85 disabled:opacity-50"
      >
        {pending ? "Adding sample data…" : "Or load 6 months of sample data"}
      </button>
      {error && <p className="text-xs text-coral-600">{error}</p>}
    </div>
  );
}
