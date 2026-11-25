export type TxType = "income" | "expense";
export type TxStatus = "complete" | "pending" | "failed";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  occurred_at: string; // ISO timestamp
}

export interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
}

export const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Transport",
  "Utilities",
  "Shopping",
  "Entertainment",
  "Health",
  "Others",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Other income",
] as const;

export interface AppUser {
  name: string;
  email: string;
}
