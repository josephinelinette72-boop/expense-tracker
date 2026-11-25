"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { MonthPoint } from "@/lib/analytics";
import { compactMoney, money } from "@/lib/format";
import { Card, CardHeader, Select } from "../ui";

const INCOME = "#22a06b";
const EXPENSE = "#e5634d";

type Range = "6" | "12";

export function IncomeExpenseChart({ months }: { months: MonthPoint[] }) {
  const [range, setRange] = useState<Range>("6");
  const data = months.slice(-Number(range));

  return (
    <Card className="flex flex-col" id="overview">
      <CardHeader
        title="Income vs Expenses"
        subtitle={`${range}-month overview`}
        action={
          <Select
            label="Range"
            value={range}
            onChange={setRange}
            options={[
              { value: "6", label: "6 months" },
              { value: "12", label: "12 months" },
            ]}
          />
        }
      />
      <div className="mt-2 flex gap-4 text-[11px] text-muted">
        <Legend color={INCOME} label="Income" />
        <Legend color={EXPENSE} label="Expense" />
      </div>
      <div className="mt-3 h-60 min-h-60 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="#f0f0f2" strokeDasharray="0" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#17171a" }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#17171a" }}
              tickFormatter={compactMoney}
              width={48}
            />
            <Tooltip content={ChartTooltip} cursor={{ stroke: "#d9d9de", strokeDasharray: "3 3" }} />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={INCOME}
              strokeWidth={2.5}
              dot={{ r: 4, fill: INCOME, strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke={EXPENSE}
              strokeWidth={2.5}
              dot={{ r: 4, fill: EXPENSE, strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-0.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as MonthPoint;
  return (
    <div className="min-w-36 rounded-xl border border-line bg-white px-3 py-2.5 text-[11px] shadow-lg">
      <p className="mb-1.5 font-medium text-ink">{point.fullLabel}</p>
      <Row color={INCOME} label="Income" value={money(point.income)} />
      <Row color={EXPENSE} label="Expense" value={money(point.expense)} />
    </div>
  );
}

function Row({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="inline-flex items-center gap-1.5 text-muted">
        <span className="h-3 w-0.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-medium text-ink tabular-nums">{value}</span>
    </div>
  );
}
