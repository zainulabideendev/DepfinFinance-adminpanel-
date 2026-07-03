"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Clock,
  FileText,
  Inbox,
  Plus,
  Send,
  ShieldAlert,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { useEmailStore } from "@/context/EmailStore";
import { mailboxRoutes, type Mailbox } from "@/lib/mailbox";

const navItems: { label: string; folder: Mailbox; icon: typeof Inbox }[] = [
  { label: "Inbox", folder: "inbox", icon: Inbox },
  { label: "Starred", folder: "starred", icon: Star },
  { label: "Sent", folder: "sent", icon: Send },
  { label: "Drafts", folder: "drafts", icon: FileText },
  { label: "Snoozed", folder: "snoozed", icon: Clock },
  { label: "Spam", folder: "spam", icon: ShieldAlert },
  { label: "Trash", folder: "trash", icon: Trash2 },
  { label: "Archive", folder: "archive", icon: Archive },
];

const labels = [
  { label: "Project Alpha", color: "text-blue-500" },
  { label: "Invoices", color: "text-green-500" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { getBadgeCount, openCompose } = useEmailStore();

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="p-3">
        <button
          type="button"
          onClick={() => openCompose()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Compose
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const href = mailboxRoutes[item.folder];
            const isActive = pathname === href;
            const badge = getBadgeCount(item.folder);

            return (
              <li key={item.label}>
                <Link
                  href={href}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary-light font-medium text-primary"
                      : "text-foreground hover:bg-background"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-text-secondary"}`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span
                      className={`text-xs font-medium ${isActive ? "text-primary" : "text-text-secondary"}`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 px-3">
          <p className="mb-2 text-[11px] font-semibold tracking-wider text-text-secondary">
            LABELS
          </p>
          <ul className="space-y-0.5">
            {labels.map((label) => (
              <li key={label.label}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-background"
                >
                  <Tag className={`h-3.5 w-3.5 shrink-0 ${label.color}`} />
                  <span>{label.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Manage Labels</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-white">
            HQ
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">Admin Corp</p>
            <p className="truncate text-xs text-text-secondary">Main Account</p>
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-text-muted">AdminMail v1.0.4</p>
      </div>
    </aside>
  );
}
