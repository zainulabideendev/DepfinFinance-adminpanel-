"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MoreVertical,
  RefreshCw,
  Star,
} from "lucide-react";
import { useEmailStore } from "@/context/EmailStore";
import type { Email } from "@/lib/emails";
import type { FolderView } from "@/lib/mailbox";
import { mailboxLabels } from "@/lib/mailbox";

const tabs = ["All", "Unread", "Primary"];

type EmailListProps = {
  folder: FolderView;
};

function getDisplayName(email: Email, folder: FolderView): string {
  if (folder === "sent" || folder === "drafts") {
    return `To: ${email.recipient ?? "No recipient"}`;
  }
  return email.sender;
}

export default function EmailList({ folder }: EmailListProps) {
  const { getEmailsForFolder, toggleStar } = useEmailStore();
  const allEmails = getEmailsForFolder(folder);
  const folderLabel = mailboxLabels[folder];

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2.5">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
          aria-label="Select all"
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
          aria-label="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {folder === "inbox" && (
          <div className="ml-2 flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`rounded-full px-3.5 py-1 text-sm transition-colors ${
                  tab === "All"
                    ? "bg-primary-light font-medium text-primary"
                    : "text-text-secondary hover:bg-background hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {folder !== "inbox" && (
          <span className="ml-2 text-sm font-medium text-foreground">{folderLabel}</span>
        )}

        <div className="ml-auto flex items-center gap-1 text-sm text-text-secondary">
          <span>
            1-{allEmails.length} of {allEmails.length}
          </span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-background hover:text-foreground"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-background hover:text-foreground"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {allEmails.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium text-foreground">No emails in {folderLabel}</p>
            <p className="text-sm text-text-secondary">
              {folder === "trash"
                ? "Deleted emails will appear here."
                : folder === "drafts"
                  ? "Saved drafts will appear here."
                  : folder === "sent"
                    ? "Emails you send will appear here."
                    : "This folder is empty."}
            </p>
          </div>
        ) : (
          allEmails.map((email) => (
            <div
              key={email.id}
              className={`group flex items-start gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-primary-light/50 ${
                email.highlighted || email.unread ? "bg-primary-light/60" : ""
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                aria-label={`Select email from ${email.sender}`}
              />
              <button
                type="button"
                onClick={() => toggleStar(email.id)}
                className="mt-0.5 shrink-0 text-text-muted transition-colors hover:text-amber-400"
                aria-label={email.starred ? "Unstar" : "Star"}
              >
                <Star
                  className={`h-4 w-4 ${email.starred ? "fill-amber-400 text-amber-400" : ""}`}
                />
              </button>

              <Link
                href={`/email/${email.id}?from=${folder}`}
                className="flex min-w-0 flex-1 cursor-pointer gap-2"
              >
                <span
                  className={`w-44 shrink-0 truncate text-sm ${
                    email.unread ? "font-bold text-foreground" : "font-semibold text-foreground"
                  }`}
                >
                  {getDisplayName(email, folder)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`shrink-0 text-sm ${
                        email.unread ? "font-bold text-foreground" : "font-medium text-foreground"
                      }`}
                    >
                      {email.subject}
                    </span>
                    <span className="truncate text-sm text-text-secondary">
                      — {email.preview}
                    </span>
                  </div>
                  {email.attachment && (
                    <span className="flex w-fit items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-xs text-text-secondary">
                      <FileText className="h-3 w-3 text-red-500" />
                      {email.attachment.name}
                    </span>
                  )}
                </div>
              </Link>

              <Link
                href={`/email/${email.id}?from=${folder}`}
                className={`shrink-0 cursor-pointer pt-0.5 text-xs group-hover:text-foreground ${
                  email.unread ? "font-semibold text-foreground" : "text-text-secondary"
                }`}
              >
                {email.time}
              </Link>
            </div>
          ))
        )}
      </div>

      <div className="flex shrink-0 justify-end gap-4 border-t border-border px-6 py-3">
        {["Terms", "Privacy", "Support"].map((link) => (
          <a
            key={link}
            href="#"
            className="text-xs text-text-secondary transition-colors hover:text-foreground"
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}
