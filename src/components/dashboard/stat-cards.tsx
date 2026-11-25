import type { ReactNode } from "react";
import { DollarSign, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import type { DashboardData } from "@/lib/analytics";
import { formatPct, money } from "@/lib/format";
import { Card, cn } from "../ui";

export function StatCards({ stats }: { stats: DashboardData["stats"] }) {
  const savingsGood = stats.savings >= 0;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Balance"
        icon={<DollarSign className="size-5" />}
        value={money(stats.balance)}
        note={`${formatPct(stats.balanceChangePct)} from last month`}
        visual={<Sparkline values={stats.balanceSpark} />}
      />
      <StatCard
        title="Monthly Income"
        icon={<TrendingUp className="size-5" />}
        value={money(stats.income)}
        note={
          stats.incomeChangePct === null
            ? "First month of income"
            : `${formatPct(stats.incomeChangePct)} vs last month`
        }
        visual={<ProgressPill value={stats.incomeProgress} />}
      />
      <StatCard
        title="Monthly Expenses"
        icon={<TrendingDown className="size-5" />}
        value={money(stats.expense)}
        note={
          stats.expenseChangePct === null
            ? "No spending last month"
            : stats.expenseChangePct <= 0
              ? `${formatPct(stats.expenseChangePct)} reduced spending`
              : `${formatPct(stats.expenseChangePct)} more spending`
        }
        visual={<MiniBars values={stats.expenseBars} />}
      />
      <StatCard
        title="Savings This Month"
        icon={<PiggyBank className="size-5" />}
        value={money(stats.savings)}
        valueClass={savingsGood ? undefined : "text-coral-600"}
        note={
          stats.savingsRate === null
            ? "No income yet this month"
            : `${stats.savingsRate.toFixed(0)}% of income saved`
        }
        visual={<DenseBars values={stats.savingsBars} />}
      />
    </div>
  );
}

function StatCard({
  title,
  icon,
  value,
  note,
  visual,
  valueClass,
}: {
  title: string;
  icon: ReactNode;
  value: string;
  note: string;
  visual: ReactNode;
  valueClass?: string;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        <span className="text-ink">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-[28px] leading-none font-semibold tracking-tight", valueClass)}>
            {value}
          </p>
          <p className="mt-2 truncate text-[11px] text-muted">{note}</p>
        </div>
        <div className="h-11 w-[45%] shrink-0">{visual}</div>
      </div>
    </Card>
  );
}

/* --------------------------- Mini visualisations --------------------------- */

function Sparkline({ values }: { values: number[] }) {
  const W = 100;
  const H = 44;
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - 6 - ((v - min) / span) * (H - 12),
  ]);
  // Smooth path via Catmull-Rom → Bézier.
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full overflow-visible">
      {values.map((_, i) => (
        <line
          key={i}
          x1={(i / (values.length - 1)) * W}
          x2={(i / (values.length - 1)) * W}
          y1={0}
          y2={H}
          stroke="#f4c9c1"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path d={d} fill="none" stroke="#e5634d" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill="#e5634d" />
    </svg>
  );
}

function ProgressPill({ value }: { value: number }) {
  return (
    <div className="flex h-full items-center">
      <div className="hatch relative h-9 w-full overflow-hidden rounded-xl">
        <div
          className="h-full rounded-xl bg-coral-500"
          style={{ width: `${Math.max(value * 100, 4)}%` }}
        />
      </div>
    </div>
  );
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-full items-end gap-[3px]">
      {values.map((v, i) => {
        const last = i === values.length - 1;
        const top = values.indexOf(max) === i;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-[2px]",
              last || top ? "bg-coral-500" : i >= values.length - 3 ? "bg-coral-300" : "bg-[#ececef]",
            )}
            style={{ height: `${Math.max((v / max) * 100, 8)}%` }}
          />
        );
      })}
    </div>
  );
}

function DenseBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-full items-end gap-px">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px] bg-coral-500"
          style={{ height: `${Math.max((v / max) * 100, 10)}%`, opacity: v ? 0.55 + 0.45 * (v / max) : 0.18 }}
        />
      ))}
    </div>
  );
}
