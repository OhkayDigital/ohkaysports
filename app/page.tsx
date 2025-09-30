import { Suspense } from "react";
import { FantasyLeagueDashboard } from "@/components/FantasyLeagueDashboard";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-primary/30 bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Loading SEA Games 2025 Fantasy League…
            </h1>
            <p className="mt-3 text-slate-600">
              Fetching Supabase data and preparing your dashboard.
            </p>
          </div>
        </main>
      }
    >
      <FantasyLeagueDashboard />
    </Suspense>
  );
}
