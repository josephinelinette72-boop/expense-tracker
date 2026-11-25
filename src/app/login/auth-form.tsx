"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type ActionState } from "@/app/actions";
import { cn, inputClass, primaryButtonClass } from "@/components/ui";

type Mode = "signin" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("signin");
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "signin"
          ? "Sign in to see your dashboard."
          : "Start tracking your money in a minute."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-lg py-2 text-sm font-medium transition",
              mode === m ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {m === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      {/* Keyed so switching tabs resets the action state. */}
      <Form key={mode} mode={mode} />
    </div>
  );
}

function Form({ mode }: { mode: Mode }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    {},
  );

  return (
    <form action={action} className="mt-5 space-y-3">
      {mode === "signup" && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Full name</span>
          <input name="name" autoComplete="name" placeholder="Jordan Lee" className={inputClass} />
        </label>
      )}
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          placeholder="••••••••"
          className={inputClass}
        />
      </label>

      {state.error && (
        <p className="rounded-xl bg-coral-50 px-3 py-2 text-xs text-coral-600">{state.error}</p>
      )}
      {state.message && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className={cn(primaryButtonClass, "w-full")}>
        {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
