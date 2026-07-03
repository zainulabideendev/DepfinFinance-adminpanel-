"use client";

import { useMemo } from "react";
import { useLoans } from "@/lib/loans";
import { DASHBOARD_NODES } from "@/lib/loan-nodes";
import type { PersonalLoan } from "./personal-loans/data";

const BarChartIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const PieChartIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const UsersIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const WalletIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currency = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);

const compactCurrency = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Declined: "bg-red-100 text-red-700",
};

// Records store dates like "02/07/2026, 10:37:02" (dd/mm/yyyy).
function parseDate(value?: string): Date | null {
  if (!value) return null;
  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, d, m, y] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function Donut({
  segments,
  total,
}: {
  segments: { label: string; value: number; color: string }[];
  total: number;
}) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
      <div className="relative h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
          {total > 0 &&
            segments.map((s) => {
              const length = (s.value / total) * circumference;
              const dash = `${length} ${circumference - length}`;
              const el = (
                <circle
                  key={s.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="18"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">
            {total.toLocaleString()}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-slate-400">
            Total
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="w-24 text-sm text-slate-600">{s.label}</span>
            <span className="text-sm font-semibold text-slate-800">
              {total > 0 ? ((s.value / total) * 100).toFixed(1) : "0.0"}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { loans, loading, error } = useLoans(DASHBOARD_NODES);

  const metrics = useMemo(() => {
    const count = (s: PersonalLoan["status"]) =>
      loans.filter((l) => l.status === s).length;

    const pending = count("Pending");
    const approved = count("Approved");
    const declined = count("Declined");
    const disbursed = loans
      .filter((l) => l.status === "Approved")
      .reduce((sum, l) => sum + l.loanAmount, 0);

    const year = new Date().getFullYear();
    const monthly = Array(12).fill(0) as number[];
    loans.forEach((l) => {
      const d = parseDate(l.dateCreated);
      if (d && d.getFullYear() === year) monthly[d.getMonth()] += 1;
    });

    const recent = [...loans]
      .sort(
        (a, b) =>
          (parseDate(b.dateCreated)?.getTime() ?? 0) -
          (parseDate(a.dateCreated)?.getTime() ?? 0)
      )
      .slice(0, 6);

    return { pending, approved, declined, disbursed, monthly, recent };
  }, [loans]);

  const stats = [
    { label: "Pending", value: metrics.pending.toLocaleString(), color: "bg-red-500", icon: BarChartIcon },
    { label: "Approved Loans", value: metrics.approved.toLocaleString(), color: "bg-orange-500", icon: PieChartIcon },
    { label: "Declined Loans", value: metrics.declined.toLocaleString(), color: "bg-pink-500", icon: UsersIcon },
  ];

  const donutSegments = [
    { label: "Approved", value: metrics.approved, color: "#f97316" },
    { label: "Pending", value: metrics.pending, color: "#ef4444" },
    { label: "Declined", value: metrics.declined, color: "#ec4899" },
  ];
  const donutTotal = metrics.pending + metrics.approved + metrics.declined;
  const maxApps = Math.max(1, ...metrics.monthly);

  return (
    <div className="min-h-screen bg-slate-100">
      <section className="flex items-center justify-between bg-slate-800 px-8 py-6">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-white">
          Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-white">Admin</p>
            <p className="text-xs text-slate-400">DEPFIN Finance</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-sky-400 text-xs font-bold text-white">
            <span>DF</span>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-sm text-slate-400">
          <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
          Loading dashboard…
        </div>
      ) : error ? (
        <div className="m-8 rounded-md border border-red-100 bg-red-50 px-6 py-16 text-center text-sm text-red-600">
          Could not load dashboard data: {error}
        </div>
      ) : (
        <div className="space-y-6 px-8 py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full text-white ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Loan Applications
                  </h2>
                  <p className="text-xs text-slate-400">Monthly volume this year</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  {new Date().getFullYear()}
                </span>
              </div>
              <div className="flex h-56 items-end justify-between gap-2">
                {metrics.monthly.map((value, i) => (
                  <div key={months[i]} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-48 w-full items-end justify-center">
                      <div
                        className="w-full max-w-8 rounded-t bg-sky-500 transition-all hover:bg-sky-600"
                        style={{ height: `${(value / maxApps) * 100}%` }}
                        title={`${months[i]}: ${value}`}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      {months[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="mb-6">
                <h2 className="text-base font-bold text-slate-800">
                  Status Breakdown
                </h2>
                <p className="text-xs text-slate-400">All loan applications</p>
              </div>
              <Donut segments={donutSegments} total={donutTotal} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
