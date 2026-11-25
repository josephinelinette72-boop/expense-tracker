"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.03)]", className)}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid size-11 place-items-center rounded-2xl bg-coral-500 text-white shadow-sm shadow-coral-500/30",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.4" />
        <path d="M6.5 6.5l11 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none rounded-xl border border-line bg-white py-1.5 pr-8 pl-3 text-xs font-medium text-ink outline-none hover:bg-canvas focus-visible:ring-2 focus-visible:ring-coral-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted" />
    </label>
  );
}

export function IconButton({
  children,
  label,
  onClick,
  className,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition hover:bg-canvas focus-visible:ring-2 focus-visible:ring-coral-200 focus-visible:outline-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Thin wrapper around <dialog> so modals get focus trapping and Esc for free. */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(440px,calc(100vw-2rem))] rounded-3xl bg-white p-0 text-ink shadow-2xl"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {/* Content mounts only while open, so forms reset each time. */}
        <div className="mt-4">{open && children}</div>
      </div>
    </dialog>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-canvas/60 px-3 py-2.5 text-sm outline-none transition placeholder:text-muted focus:border-coral-300 focus:bg-white focus:ring-2 focus:ring-coral-100";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-ink/85 disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas disabled:opacity-50";
