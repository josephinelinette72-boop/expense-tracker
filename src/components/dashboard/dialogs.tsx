"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { addTransaction, saveBudgets, type ActionState } from "@/app/actions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Budget, type TxType } from "@/lib/types";
import { cn, inputClass, Modal, primaryButtonClass, secondaryButtonClass } from "../ui";

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AddTransactionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<TxType>("expense");

  return (
    <Modal open={open} onClose={onClose} title="Add transaction">
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-lg py-2 text-sm font-medium transition",
              type === t ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {t === "expense" ? "Expense" : "Income"}
          </button>
        ))}
      </div>
      <TransactionForm key={type} type={type} onDone={onClose} />
    </Modal>
  );
}

function TransactionForm({ type, onDone }: { type: TxType; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addTransaction, {});
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="type" value={type} />
      <Field label="Name">
        <input
          name="name"
          required
          placeholder={type === "income" ? "e.g. Monthly salary" : "e.g. Groceries"}
          className={inputClass}
          autoFocus
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Amount (USD)">
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
        <Field label="Date">
          <input name="date" type="date" defaultValue={localToday()} className={inputClass} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select name="category" className={inputClass} defaultValue={categories[0]}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" className={inputClass} defaultValue="complete">
            <option value="complete">Complete</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </Field>
      </div>

      {state.error && (
        <p className="rounded-xl bg-coral-50 px-3 py-2 text-xs text-coral-600">{state.error}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onDone} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving…" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}

export function BudgetDialog({
  open,
  onClose,
  budgets,
}: {
  open: boolean;
  onClose: () => void;
  budgets: Budget[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="Monthly budgets">
      <BudgetForm budgets={budgets} onDone={onClose} />
    </Modal>
  );
}

function BudgetForm({ budgets, onDone }: { budgets: Budget[]; onDone: () => void }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveBudgets, {});
  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  const limits = new Map(budgets.map((b) => [b.category, b.monthly_limit]));

  return (
    <form action={action} className="space-y-3">
      <p className="text-xs text-muted">Leave a field empty to remove that budget.</p>
      <div className="grid grid-cols-2 gap-3">
        {EXPENSE_CATEGORIES.map((c) => (
          <Field key={c} label={c}>
            <input
              name={`limit_${c}`}
              type="number"
              min="0"
              step="1"
              placeholder="—"
              defaultValue={limits.get(c) ?? ""}
              className={inputClass}
            />
          </Field>
        ))}
      </div>
      {state.error && (
        <p className="rounded-xl bg-coral-50 px-3 py-2 text-xs text-coral-600">{state.error}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onDone} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Saving…" : "Save budgets"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
