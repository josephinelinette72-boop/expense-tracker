"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { generateSampleTransactions, sampleBudgets } from "@/lib/sample-data";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types";

export type ActionState = { error?: string; message?: string; ok?: boolean };

const DEMO_ERROR: ActionState = {
  error: "Demo mode — add your Supabase keys to .env.local to save changes.",
};

/* ---------------------------------- Auth --------------------------------- */

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return DEMO_ERROR;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/");
}

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return DEMO_ERROR;
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 6)
    return { error: "Enter an email and a password of at least 6 characters." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name || undefined } },
  });
  if (error) return { error: error.message };
  // If email confirmation is enabled, there is no session yet.
  if (!data.session)
    return { message: "Check your inbox to confirm your email, then sign in." };
  redirect("/");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

/* ------------------------------ Transactions ----------------------------- */

export async function addTransaction(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return DEMO_ERROR;

  const type = formData.get("type") === "income" ? "income" : "expense";
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const amount = Number(formData.get("amount"));
  const status = String(formData.get("status") ?? "complete");
  const date = String(formData.get("date") ?? "");

  const validCategories: readonly string[] =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!name) return { error: "Give the transaction a name." };
  if (!validCategories.includes(category)) return { error: "Pick a category." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Amount must be greater than 0." };
  if (!["complete", "pending", "failed"].includes(status)) return { error: "Invalid status." };

  // Keep the current time of day when a date is picked, so ordering is sensible.
  const now = new Date();
  const occurred = date ? new Date(`${date}T${now.toTimeString().slice(0, 8)}`) : now;
  if (Number.isNaN(occurred.getTime())) return { error: "Invalid date." };

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert({
    name,
    category,
    type,
    amount: Math.round(amount * 100) / 100,
    status,
    occurred_at: occurred.toISOString(),
  });
  if (error) return { error: error.message };

  revalidatePath("/");
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<ActionState> {
  if (!isSupabaseConfigured) return DEMO_ERROR;
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  return { ok: true };
}

/* --------------------------------- Budgets ------------------------------- */

export async function saveBudgets(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured) return DEMO_ERROR;
  const supabase = await createClient();

  const upserts: { category: string; monthly_limit: number }[] = [];
  const removals: string[] = [];
  for (const category of EXPENSE_CATEGORIES) {
    const raw = String(formData.get(`limit_${category}`) ?? "").trim();
    const value = Number(raw);
    if (!raw || value <= 0) removals.push(category);
    else if (Number.isFinite(value)) upserts.push({ category, monthly_limit: value });
    else return { error: `Invalid limit for ${category}.` };
  }

  if (upserts.length) {
    const { error } = await supabase
      .from("budgets")
      .upsert(upserts, { onConflict: "user_id,category" });
    if (error) return { error: error.message };
  }
  if (removals.length) {
    const { error } = await supabase.from("budgets").delete().in("category", removals);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  return { ok: true };
}

/* ------------------------------- Sample data ----------------------------- */

export async function seedSampleData(): Promise<ActionState> {
  if (!isSupabaseConfigured) return DEMO_ERROR;
  const supabase = await createClient();

  const { error } = await supabase
    .from("transactions")
    .insert(generateSampleTransactions(new Date(), Date.now() % 100000));
  if (error) return { error: error.message };

  await supabase
    .from("budgets")
    .upsert(sampleBudgets(), { onConflict: "user_id,category", ignoreDuplicates: true });

  revalidatePath("/");
  return { ok: true };
}
