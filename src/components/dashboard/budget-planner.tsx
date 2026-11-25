"use client";

import { Pencil } from "lucide-react";
import type { DashboardData } from "@/lib/analytics";
import { money } from "@/lib/format";
import { Card, CardHeader, cn, IconButton } from "../ui";
import { CategoryIcon } from "./category-icon";

export function BudgetPlanner({
  budgets,
  onEdit,
}: {
  budgets: DashboardData["budgets"];
  onEdit: () => void;
}) {
  return (
    <Card id="budgets">
      <CardHeader
        title="Budget Planner"
        subtitle="Monthly budgets and how much you've used"
        action={
          <IconButton label="Edit budgets" onClick={onEdit}>
            <Pencil className="size-4" />
          </IconButton>
        }
      />

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center text-sm text-muted">
          <p>No budgets yet.</p>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl bg-canvas px-3 py-2 text-xs font-medium text-ink hover:bg-line"
          >
            Set monthly budgets
          </button>
        </div>
      ) : (
        <ul className="mt-5 space-y-4">
          {budgets.map((b) => {
            const over = b.pct > 100;
            return (
              <li key={b.id} className="flex items-center gap-3">
                <CategoryIcon category={b.category} className="size-10 rounded-full bg-canvas text-ink" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{b.category}</p>
                    <p className="text-[11px] text-muted tabular-nums">
                      {money(b.spent)} / {money(b.monthly_limit)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        over ? "bg-coral-600" : "bg-gradient-to-r from-coral-300 to-coral-500",
                      )}
                      style={{ width: `${Math.min(b.pct, 100)}%` }}
                    />
                  </div>
                </div>
                <p
                  className={cn(
                    "w-12 text-right text-lg font-medium tabular-nums",
                    over && "text-coral-600",
                  )}
                >
                  {b.pct.toFixed(0)}%
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
