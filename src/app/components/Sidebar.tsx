"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const MonitorIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const GridIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const UserIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: MonitorIcon },
  { label: "Personal Loans", href: "/personal-loans", icon: GridIcon },
  { label: "Business Loans", href: "/business-loans", icon: GridIcon },
  { label: "Consolidate Loans", href: "/consolidate-loans", icon: GridIcon },
  { label: "General Loans", href: "/general-loans", icon: GridIcon },
  { label: "Mortage Loans", href: "/mortage-loans", icon: GridIcon },
  { label: "Approved Loans", href: "/approved-loans", icon: GridIcon },
  { label: "Declined Loans", href: "/declined-loans", icon: GridIcon },
  { label: "Add New Admin", href: "/add-admin", icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 py-6">
        <span className="text-sm font-bold tracking-wide text-slate-800">
          DEPFIN FINANCE
        </span>
      </div>

      <div className="border-t border-slate-100" />

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Admin Layout Pages
        </p>

        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                    isActive
                      ? "text-sky-500"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={isActive ? "text-sky-500" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
