"use client";

import { useEffect, useRef, useState } from "react";
import LoansTable from "../personal-loans/LoansTable";
import type { LoanStatus, PersonalLoan } from "../personal-loans/data";
import { searchLoans, updateLoanStatus, useLoans } from "@/lib/loans";

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

  const [term, setTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PersonalLoan[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodesKey = nodes.join("|");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = term.trim();
    if (!q) {
      setResults(null);
      setSearching(false);
      setSearchError(null);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await searchLoans(nodesKey.split("|"), q);
        setResults(found);
        setSearchError(null);
      } catch (e) {
        setSearchError(e instanceof Error ? e.message : "Search failed");
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term, nodesKey]);

  const handleDecision = async (loan: PersonalLoan, decision: LoanStatus) => {
    try {
      await updateLoanStatus(loan, decision);
    } catch {
      // Keep the optimistic UI update.
    }
  };

  const isSearchMode = term.trim().length > 0;
  const displayed = isSearchMode ? results ?? [] : loans;
  const showLoading = isSearchMode ? searching : loading;
  const activeError = isSearchMode ? searchError : error;

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
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search ref no, email, ID, phone or name…"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-8 text-[13px] text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
            {term && (
              <button
                onClick={() => setTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          {isSearchMode && !showLoading && (
            <span className="text-[13px] text-slate-400">
              {displayed.length} match{displayed.length === 1 ? "" : "es"}
            </span>
          )}
        </div>

        {showLoading ? (
          <div className="flex items-center justify-center rounded-md border border-slate-200 bg-white py-24 text-sm text-slate-400">
            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
            {isSearchMode ? "Searching…" : `Loading ${title.toLowerCase()}…`}
          </div>
        ) : activeError ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-red-100 bg-red-50 py-16 text-sm text-red-600">
            <span>Could not load data: {activeError}</span>
            {!isSearchMode && (
              <button
                onClick={reload}
                className="rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
              >
                Retry
              </button>
            )}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white py-24 text-center text-sm text-slate-400">
            {isSearchMode
              ? `No results starting with “${term.trim()}”.`
              : `No ${title.toLowerCase()} found.`}
          </div>
        ) : (
          <LoansTable
            loans={displayed}
            showActions={showActions}
            onDecision={handleDecision}
          />
        )}
      </section>
    </div>
  );
}
