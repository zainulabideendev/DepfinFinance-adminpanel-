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

export default function LoansTable({ loans }: { loans: PersonalLoan[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(loans.length / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return loans.slice(start, start + PAGE_SIZE);
  }, [loans, page]);

  const firstItem = (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, loans.length);

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages));

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
              <th className="whitespace-nowrap px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((loan) => (
              <tr
                key={loan.refNo}
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
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusStyles[loan.status]}`}
                  >
                    {loan.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex gap-2">
                    <button className="rounded bg-sky-500 px-3 py-1 text-[12px] font-semibold text-white hover:bg-sky-600">
                      View
                    </button>
                    <button className="rounded bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-600 hover:bg-slate-200">
                      Edit
                    </button>
                  </div>
                </td>
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
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="rounded border border-slate-200 px-3 py-1 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`min-w-8 rounded border px-3 py-1 font-medium ${
                p === page
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="rounded border border-slate-200 px-3 py-1 font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
