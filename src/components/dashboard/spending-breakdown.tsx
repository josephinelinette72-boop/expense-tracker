"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { DashboardData } from "@/lib/analytics";
import { money } from "@/lib/format";
import { Card, CardHeader } from "../ui";

// Coral family for the biggest slices, then calm neutrals — matches the design.
const PALETTE = ["#e5634d", "#f2a597", "#f6cfc7", "#bfe3fa", "#e9e9ec", "#f9e4e4", "#d8d0f0", "#d6eee2"];

export function SpendingBreakdown({
  breakdown,
  label,
}: {
  breakdown: DashboardData["breakdown"];
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = breakdown.reduce((s, b) => s + b.amount, 0);
  const focused = hover !== null ? breakdown[hover] : null;

  return (
    <Card id="breakdown">
      <CardHeader title="Spending Breakdown" subtitle={`Expense distribution · ${label}`} />

      {breakdown.length === 0 ? (
        <div className="grid h-56 place-items-center text-center text-sm text-muted">
          No expenses recorded this month yet.
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-2 aspect-square w-full max-w-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  isAnimationActive={false}
                  data={breakdown}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius="58%"
                  outerRadius="100%"
                  paddingAngle={2}
                  cornerRadius={6}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  onMouseEnter={(_, i) => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {breakdown.map((b, i) => (
                    <Cell
                      key={b.category}
                      fill={PALETTE[i % PALETTE.length]}
                      opacity={hover === null || hover === i ? 1 : 0.45}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="grid size-[48%] place-items-center rounded-full bg-white text-center shadow-[0_4px_20px_rgb(0_0_0/0.08)]">
                <div>
                  <p className="text-2xl leading-none font-semibold tracking-tight">
                    {focused ? `${focused.pct.toFixed(0)}%` : money(total)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">{focused ? focused.category : "Total"}</p>
                </div>
              </div>
            </div>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs">
            {breakdown.map((b, i) => (
              <li
                key={b.category}
                className="flex items-center justify-between gap-2"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-[3px]"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="truncate">{b.category}</span>
                </span>
                <span className="text-muted tabular-nums">{b.pct.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
