type Stat = {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
};

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

const stats: Stat[] = [
  { label: "Pending", value: "6594", color: "bg-red-500", icon: BarChartIcon },
  { label: "Approved Loans", value: "6562", color: "bg-orange-500", icon: PieChartIcon },
  { label: "Declined Loans", value: "4243", color: "bg-pink-500", icon: UsersIcon },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-slate-800 px-8 pb-16 pt-6">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-sm font-semibold uppercase tracking-widest text-white">
            Dashboard
          </h1>
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-sky-400 text-xs font-bold text-white">
            <span>DF</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-md bg-white px-6 py-6 shadow-sm"
            >
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold text-slate-700">
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-8 py-10" />
    </div>
  );
}
