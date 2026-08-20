"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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

const MailIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const MessageIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
  { label: "Messages", href: "/messages", icon: MessageIcon },
  // { label: "Email", href: "/email", icon: MailIcon },
  { label: "Add New Admin", href: "/add-admin", icon: UserIcon },
];

const LogoutIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CollapseIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <polyline points="16 9 13 12 16 15" />
  </svg>
);

const ExpandIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <polyline points="13 9 16 12 13 15" />
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className={`flex items-center py-6 ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
        {!collapsed && (
          <span className="text-sm font-bold tracking-wide text-slate-800">
            DEPFIN FINANCE
          </span>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-800"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? ExpandIcon : CollapseIcon}
        </button>
      </div>

      <div className="border-t border-slate-100" />

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {!collapsed && (
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Admin Layout Pages
          </p>
        )}

        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/email"
                ? pathname.startsWith("/email")
                : item.href === "/messages"
                  ? pathname.startsWith("/messages")
                  : pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-md py-2.5 text-[13px] font-semibold uppercase tracking-wide transition-colors ${
                    collapsed ? "justify-center px-0" : "px-3"
                  } ${
                    isActive
                      ? "text-sky-500"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span className={isActive ? "text-sky-500" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-slate-100 p-3">
        {!collapsed && user?.email && (
          <p className="truncate px-3 pb-2 text-[11px] text-slate-400" title={user.email}>
            {user.email}
          </p>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-md py-2.5 text-[13px] font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 ${
            collapsed ? "justify-center px-0" : "px-3"
          }`}
        >
          <span className="text-slate-400">{LogoutIcon}</span>
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
