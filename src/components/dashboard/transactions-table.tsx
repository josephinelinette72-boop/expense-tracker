"use client";

import { ArrowDownUp, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition, type ReactNode } from "react";
import { deleteTransaction } from "@/app/actions";
import { moneyCents } from "@/lib/format";
import type { Transaction, TxStatus } from "@/lib/types";
import { Card, CardHeader, cn } from "../ui";
import { CategoryIcon } from "./category-icon";

export type TxRow = Transaction & { dateLabel: string };

type TypeFilter = "all" | "income" | "expense";
type StatusFilter = "all" | TxStatus;
type Sort = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

const PAGE_SIZE = 8;

const STATUS_STYLE: Record<TxStatus, string> = {
  complete: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-coral-50 text-coral-600",
};

export function TransactionsTable({
  rows,
  query,
  onQueryChange,
  readOnly,
  onEmptySeed,
}: {
  rows: TxRow[];
  query: string;
  onQueryChange: (q: string) => void;
  readOnly: boolean;
  onEmptySeed?: ReactNode;
}) {
  const [type, setType] = useState<TypeFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<Sort>("date-desc");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        (type === "all" || r.type === type) &&
        (status === "all" || r.status === status) &&
        (!q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)),
    );
    const dir = sort.endsWith("asc") ? 1 : -1;
    return list.sort((a, b) =>
      sort.startsWith("date")
        ? dir * a.occurred_at.localeCompare(b.occurred_at)
        : dir * (a.amount - b.amount),
    );
  }, [rows, query, type, status, sort]);

  const filtersActive = type !== "all" || status !== "all";

  function remove(id: string) {
    setError(null);
    setDeleting(id);
    startTransition(async () => {
      const res = await deleteTransaction(id);
      if (res.error) setError(res.error);
      setDeleting(null);
    });
  }

  return (
    <Card id="transactions" className="flex flex-col">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <CardHeader title="Latest Transactions" subtitle="Monitor your recent financial activities" />
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search transactions</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink" />
            <input
              value={query}
              onChange={(e) => {
                onQueryChange(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search…"
              className="h-9 w-44 rounded-xl border border-line bg-white pr-3 pl-9 text-xs outline-none focus:border-coral-300 focus:ring-2 focus:ring-coral-100"
            />
          </label>

          <Dropdown
            icon={<SlidersHorizontal className="size-3.5" />}
            label="Filter"
            highlight={filtersActive}
          >
            <FilterGroup
              title="Type"
              value={type}
              onChange={setType}
              options={[
                ["all", "All"],
                ["expense", "Send"],
                ["income", "Receive"],
              ]}
            />
            <FilterGroup
              title="Status"
              value={status}
              onChange={setStatus}
              options={[
                ["all", "All"],
                ["complete", "Complete"],
                ["pending", "Pending"],
                ["failed", "Failed"],
              ]}
            />
          </Dropdown>

          <Dropdown icon={<ArrowDownUp className="size-3.5" />} label="Sort by">
            <FilterGroup
              title="Sort by"
              value={sort}
              onChange={setSort}
              options={[
                ["date-desc", "Newest first"],
                ["date-asc", "Oldest first"],
                ["amount-desc", "Highest amount"],
                ["amount-asc", "Lowest amount"],
              ]}
            />
          </Dropdown>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-coral-50 px-3 py-2 text-xs text-coral-600">{error}</p>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead>
            <tr className="bg-canvas text-xs text-ink">
              <th className="rounded-l-xl px-3 py-3 font-medium">Name</th>
              <th className="px-3 py-3 font-medium">Date &amp; time</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 text-right font-medium">Amount</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="rounded-r-xl px-3 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visible).map((r) => (
              <tr
                key={r.id}
                className={cn(
                  "group border-b border-dashed border-line last:border-0",
                  deleting === r.id && pending && "opacity-40",
                )}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={r.category} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.name}</p>
                      <p className="text-[11px] text-muted">{r.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-muted">{r.dateLabel}</td>
                <td className="px-3 py-3">{r.type === "income" ? "Receive" : "Send"}</td>
                <td
                  className={cn(
                    "px-3 py-3 text-right font-medium whitespace-nowrap tabular-nums",
                    r.type === "income" ? "text-mint-500" : "text-ink",
                  )}
                >
                  {r.type === "income" ? "+" : "−"}
                  {moneyCents(r.amount)}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
                      STATUS_STYLE[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      disabled={pending}
                      aria-label={`Delete ${r.name}`}
                      className="rounded-lg p-1.5 text-muted opacity-0 transition group-hover:opacity-100 hover:bg-coral-50 hover:text-coral-600 focus-visible:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted">
            {rows.length === 0 ? (
              <>
                <p>No transactions yet. Add your first one with the + button.</p>
                {onEmptySeed}
              </>
            ) : (
              <p>No transactions match your search or filters.</p>
            )}
          </div>
        )}
      </div>

      {filtered.length > visible && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE * 2)}
          className="mx-auto mt-3 rounded-xl px-4 py-2 text-xs font-medium text-ink hover:bg-canvas"
        >
          Show more ({filtered.length - visible} remaining)
        </button>
      )}
    </Card>
  );
}

function Dropdown({
  icon,
  label,
  highlight,
  children,
}: {
  icon: ReactNode;
  label: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group/dd relative">
      <summary
        className={cn(
          "flex h-9 cursor-pointer list-none items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-medium select-none hover:bg-canvas [&::-webkit-details-marker]:hidden",
          highlight && "border-coral-300 text-coral-600",
        )}
      >
        {icon}
        {label}
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-52 space-y-3 rounded-2xl border border-line bg-white p-3 shadow-xl">
        {children}
      </div>
    </details>
  );
}

function FilterGroup<T extends string>({
  title,
  value,
  onChange,
  options,
}: {
  title: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[11px] font-medium text-muted">{title}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs transition",
              value === v ? "bg-ink text-white" : "bg-canvas text-ink hover:bg-line",
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
