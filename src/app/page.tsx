import { Suspense } from "react";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { TxRow } from "@/components/dashboard/transactions-table";
import { buildDashboard } from "@/lib/analytics";
import { getDashboardInput } from "@/lib/data";
import { formatTxDate } from "@/lib/format";

export default function Page() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

/** Reads the Supabase session (cookies), so it streams in behind the Suspense boundary. */
async function Dashboard() {
  const { mode, user, transactions, budgets, now } = await getDashboardInput();
  const data = buildDashboard(transactions, budgets, now);

  // Format dates on the server so client and server render identical text.
  const rows: TxRow[] = transactions.map((t) => ({ ...t, dateLabel: formatTxDate(t.occurred_at) }));

  return <DashboardView mode={mode} user={user} data={data} rows={rows} budgets={budgets} />;
}

function DashboardSkeleton() {
  const block = "animate-pulse rounded-3xl bg-white";
  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-[1440px] rounded-[32px] bg-canvas p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="size-11 animate-pulse rounded-2xl bg-coral-200" />
          <div className="h-8 w-40 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="mt-6 flex gap-6">
          <div className={`hidden h-[600px] w-14 md:block ${block}`} />
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-32 ${block}`} />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className={`h-80 xl:col-span-4 ${block}`} />
              <div className={`h-80 xl:col-span-4 ${block}`} />
              <div className={`h-80 xl:col-span-4 ${block}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
