"use client";

import LoansTable from "../personal-loans/LoansTable";
import type { LoanStatus, PersonalLoan } from "../personal-loans/data";
import { updateLoanStatus, useLoans } from "@/lib/loans";

export default function LoansView({
  title,
  nodes,
  showActions = true,
}: {
  title: string;
  nodes: readonly string[];
  showActions?: boolean;
}) {
  const { loans, loading, error, reload } = useLoans(nodes);

  const handleDecision = async (loan: PersonalLoan, decision: LoanStatus) => {
    try {
      await updateLoanStatus(loan, decision);
    } catch {
      // Keep the optimistic UI update; surface a reload on next mount.
    }
  };

  return (
    <div className="min-h-screen">
      <section className="flex items-center justify-between bg-slate-800 px-8 py-6">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-white">
          {title}
        </h1>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-xs font-bold text-white">
          <span>DF</span>
        </div>
      </section>

      <section className="px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center rounded-md border border-slate-200 bg-white py-24 text-sm text-slate-400">
            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
            Loading {title.toLowerCase()}…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-red-100 bg-red-50 py-16 text-sm text-red-600">
            <span>Could not load data: {error}</span>
            <button
              onClick={reload}
              className="rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : loans.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white py-24 text-center text-sm text-slate-400">
            No {title.toLowerCase()} found.
          </div>
        ) : (
          <LoansTable
            loans={loans}
            showActions={showActions}
            onDecision={handleDecision}
          />
        )}
      </section>
    </div>
  );
}
