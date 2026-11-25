"use client";

import { useState } from "react";
import type { MonthPoint } from "@/lib/analytics";
import { compactMoney, money } from "@/lib/format";
import { Card, CardHeader, cn, Select } from "../ui";

type Range = "6" | "12";

/**
 * Monthly net cash flow as pill-shaped bars. Built with plain elements rather than
 * a chart library so the hatched pills and selected-month state match the design.
 */
export function CashFlowChart({ months }: { months: MonthPoint[] }) {
  const [range, setRange] = useState<Range>("6");
  const data = months.slice(-Number(range));
  const [selected, setSelected] = useState(months[months.length - 1].key);
  const active = data.find((m) => m.key === selected) ?? data[data.length - 1];

  const max = Math.max(...data.map((m) => Math.abs(m.net)), 1);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];

  return (
    <Card className="flex flex-col" id="cashflow">
      <CardHeader
        title="Cash Flow"
        subtitle="Monthly net cash flow"
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

      <p className="mt-2 text-[11px] text-muted">
        {active.fullLabel}:{" "}
        <span className={cn("font-semibold", active.net < 0 ? "text-coral-600" : "text-ink")}>
          {active.net < 0 ? "−" : "+"}
          {money(Math.abs(active.net))}
        </span>
      </p>

      <div className="mt-3 flex min-h-60 flex-1 gap-2">
        {/* Y axis */}
        <div className="flex flex-col-reverse justify-between pb-8 text-[11px] text-ink">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0">
              {compactMoney(t)}
            </span>
          ))}
        </div>

        {/* Bars */}
        <div className="flex flex-1 items-stretch gap-[min(2.5%,12px)]">
          {data.map((m) => {
            const isActive = m.key === active.key;
            const h = (Math.abs(m.net) / top) * 100;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelected(m.key)}
                aria-pressed={isActive}
                aria-label={`${m.fullLabel}: net ${money(m.net)}`}
                title={`${m.fullLabel}: ${money(m.net)}`}
                className="group flex min-w-0 flex-1 flex-col items-center gap-2 outline-none"
              >
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      "w-full rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-coral-200",
                      isActive ? "coral-gradient" : "hatch group-hover:brightness-95",
                      m.net < 0 && !isActive && "outline outline-1 -outline-offset-1 outline-coral-200",
                    )}
                    style={{ height: `${Math.max(h, 6)}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] leading-5",
                    isActive ? "bg-coral-500 font-medium text-white" : "text-ink",
                  )}
                >
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-muted">Outlined bars are months with negative cash flow.</p>
    </Card>
  );
}

function niceTicks(max: number) {
  const step = Math.pow(10, Math.floor(Math.log10(max / 4)));
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * step).find((s) => s * 4 >= max) ?? step * 10;
  return [0, 1, 2, 3, 4].map((i) => i * nice);
}
