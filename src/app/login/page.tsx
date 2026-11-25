import type { Metadata } from "next";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Logo } from "@/components/ui";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = { title: "Sign in — Pocketwise" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[32px] bg-canvas shadow-[0_30px_80px_-40px_rgb(0_0_0/0.3)] md:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-coral-500 p-10 text-white md:flex">
          <div className="flex items-center gap-3">
            <Logo className="bg-white text-coral-500 shadow-none" />
            <div>
              <p className="font-semibold">Pocketwise</p>
              <p className="text-xs text-white/75">Manage your finance</p>
            </div>
          </div>
          <div>
            <p className="text-3xl leading-tight font-semibold tracking-tight">
              Know where every dollar goes.
            </p>
            <p className="mt-3 text-sm text-white/80">
              Track income and expenses, plan monthly budgets and watch your cash flow — all in one
              place.
            </p>
          </div>
          {/* Decorative pill bars echoing the cash-flow chart */}
          <div aria-hidden className="absolute -right-6 bottom-28 flex items-end gap-3 opacity-25">
            {[60, 110, 80, 150, 95].map((h, i) => (
              <div key={i} className="w-9 rounded-full bg-white" style={{ height: h }} />
            ))}
          </div>
        </div>

        <div className="bg-white p-8 sm:p-10">
          {isSupabaseConfigured ? (
            <AuthForm />
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold tracking-tight">Supabase not connected</h1>
              <p className="text-sm text-muted">
                Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to <code>.env.local</code> and
                restart the dev server to enable sign-in.
              </p>
              <Link
                href="/"
                className="inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white"
              >
                View the demo dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
