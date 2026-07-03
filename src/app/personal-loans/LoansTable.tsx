"use client";

import { useMemo, useState } from "react";
import type { LoanStatus, PersonalLoan } from "./data";

const PAGE_SIZE = 10;

const currency = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);

const statusStyles: Record<LoanStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Declined: "bg-red-100 text-red-700",
};

function YesNo({ value, danger }: { value: boolean; danger?: boolean }) {
  const yes = danger
    ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        value ? yes : "bg-slate-100 text-slate-500"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-2.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

function LoanModal({
  loan,
  status,
  onClose,
  onDecision,
}: {
  loan: PersonalLoan;
  status: LoanStatus;
  onClose: () => void;
  onDecision: (decision: LoanStatus) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-white">Edit Application</h2>
            <p className="text-xs text-slate-400">
              {loan.fullName} · {loan.refNo}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[status]}`}
            >
              {status}
            </span>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <DetailRow label="Full Name" value={loan.fullName} />
            <DetailRow label="Ref No" value={loan.refNo} />
            <DetailRow label="ID Number" value={loan.idNumber} />
            <DetailRow label="Phone Number" value={loan.phoneNumber} />
            <DetailRow label="Email" value={loan.email} />
            <DetailRow label="Employment Status" value={loan.employmentStatus} />
            <DetailRow label="Black Listed" value={<YesNo value={loan.blackListed} danger />} />
            <DetailRow label="In Debt" value={<YesNo value={loan.inDebt} />} />
            <DetailRow label="Gross Income" value={currency(loan.grossIncome)} />
            <DetailRow label="Loan Amount" value={currency(loan.loanAmount)} />
            <DetailRow label="Loan Term" value={`${loan.loanTerm} months`} />
            <DetailRow label="Rate" value={`${loan.rate}%`} />
            <DetailRow label="Monthly Repayments" value={currency(loan.monthlyRepayment)} />
            <DetailRow label="Repayment Method" value={loan.repaymentMethod} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onDecision("Declined")}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Decline
          </button>
          <button
            onClick={() => onDecision("Approved")}
            className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// Build a compact page list: 1 … around-current … last
function buildPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("…");

  pages.push(total);
  return pages;
}

export default function LoansTable({
  loans,
  showActions = true,
  onDecision,
}: {
  loans: PersonalLoan[];
  showActions?: boolean;
  onDecision?: (loan: PersonalLoan, decision: LoanStatus) => void | Promise<void>;
}) {
  const [page, setPage] = useState(1);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, LoanStatus>
  >({});
  const [selected, setSelected] = useState<PersonalLoan | null>(null);

  const keyFor = (loan: PersonalLoan) => loan.id ?? loan.refNo;

  const statusFor = (loan: PersonalLoan): LoanStatus =>
    statusOverrides[keyFor(loan)] ?? loan.status;

  const totalPages = Math.max(1, Math.ceil(loans.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return loans.slice(start, start + PAGE_SIZE);
  }, [loans, currentPage]);

  const firstItem = loans.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(currentPage * PAGE_SIZE, loans.length);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

  const handleDecision = (decision: LoanStatus) => {
    if (!selected) return;
    const target = selected;
    setStatusOverrides((prev) => ({ ...prev, [keyFor(target)]: decision }));
    setSelected(null);
    void onDecision?.(target, decision);
  };

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1600px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Full name</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Ref No</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">ID Number</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Phone Number</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Email</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Employment status</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Black Listed</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">In Debt</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Gross Income</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Loan Amount</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Loan Term</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Rate</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Monthly repayments</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Repayment Method</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
              {showActions && (
                <th className="whitespace-nowrap px-4 py-3 font-semibold">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={showActions ? 16 : 15}
                  className="px-4 py-12 text-center text-slate-400"
                >
                  No records to show.
                </td>
              </tr>
            )}
            {pageRows.map((loan) => (
              <tr
                key={keyFor(loan)}
                className="border-b border-slate-100 text-slate-700 hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                  {loan.fullName}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{loan.refNo}</td>
                <td className="whitespace-nowrap px-4 py-3">{loan.idNumber}</td>
                <td className="whitespace-nowrap px-4 py-3">{loan.phoneNumber}</td>
                <td className="whitespace-nowrap px-4 py-3">{loan.email}</td>
                <td className="whitespace-nowrap px-4 py-3">{loan.employmentStatus}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <YesNo value={loan.blackListed} danger />
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <YesNo value={loan.inDebt} />
                </td>
                <td className="whitespace-nowrap px-4 py-3">{currency(loan.grossIncome)}</td>
                <td className="whitespace-nowrap px-4 py-3">{currency(loan.loanAmount)}</td>
                <td className="whitespace-nowrap px-4 py-3">{loan.loanTerm} mo</td>
                <td className="whitespace-nowrap px-4 py-3">{loan.rate}%</td>
                <td className="whitespace-nowrap px-4 py-3">{currency(loan.monthlyRepayment)}</td>
                <td className="whitespace-nowrap px-4 py-3">{loan.repaymentMethod}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[statusFor(loan)]}`}
                  >
                    {statusFor(loan)}
                  </span>
                </td>
                {showActions && (
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => setSelected(loan)}
                      className="rounded bg-sky-500 px-3 py-1 text-[12px] font-semibold text-white hover:bg-sky-600"
                    >
                      Edit Application
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-[13px] text-slate-500 sm:flex-row">
        <span>
          Showing {firstItem}–{lastItem} of {loans.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded border border-slate-200 px-3 py-1 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
          >
            Prev
          </button>
          {buildPageList(currentPage, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`min-w-8 rounded border px-3 py-1 font-medium ${
                  p === currentPage
                    ? "border-sky-500 bg-sky-500 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded border border-slate-200 px-3 py-1 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      {selected && (
        <LoanModal
          loan={selected}
          status={statusFor(selected)}
          onClose={() => setSelected(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}
