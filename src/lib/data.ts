import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { isSupabaseConfigured } from "./supabase/config";
import { createClient } from "./supabase/server";
import { demoData } from "./sample-data";
import type { AppUser, Budget, Transaction } from "./types";

export interface DashboardInput {
  mode: "demo" | "live";
  user: AppUser;
  transactions: Transaction[];
  budgets: Budget[];
  now: Date;
}

const PAGE = 1000; // Supabase's default max rows per request.

export async function getDashboardInput(): Promise<DashboardInput> {
  if (!isSupabaseConfigured) {
    await connection(); // Opt into request-time rendering before reading the clock.
    const now = new Date();
    return {
      mode: "demo",
      user: { name: "Demo User", email: "demo@example.com" },
      ...demoData(now),
      now,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const transactions: Transaction[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, name, category, type, amount, status, occurred_at")
      .order("occurred_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Failed to load transactions: ${error.message}`);
    transactions.push(...data.map((t) => ({ ...t, amount: Number(t.amount) })));
    if (data.length < PAGE) break;
  }

  const { data: budgets, error: budgetError } = await supabase
    .from("budgets")
    .select("id, category, monthly_limit")
    .order("category");
  if (budgetError) throw new Error(`Failed to load budgets: ${budgetError.message}`);

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "You";

  return {
    mode: "live",
    user: { name, email: user.email ?? "" },
    transactions,
    budgets: budgets.map((b) => ({ ...b, monthly_limit: Number(b.monthly_limit) })),
    now: new Date(),
  };
}
