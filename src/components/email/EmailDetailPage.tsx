"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmailDetail from "@/components/email/EmailDetail";
import { useEmailStore } from "@/context/EmailStore";
import { mailboxRoutes, type Mailbox } from "@/lib/mailbox";

export default function EmailDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { getEmailById, markRead } = useEmailStore();
  const email = getEmailById(Number(id));
  const fromParam = searchParams.get("from") as Mailbox | null;
  const backHref =
    fromParam && mailboxRoutes[fromParam]
      ? mailboxRoutes[fromParam]
      : email
        ? mailboxRoutes[email.folder === "starred" ? "inbox" : email.folder]
        : "/";

  useEffect(() => {
    markRead(Number(id));
  }, [id, markRead]);

  if (!email) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-surface">
        <p className="text-sm font-medium text-foreground">Email not found</p>
        <Link href="/email" className="text-sm text-primary hover:text-primary-hover">
          Back to Inbox
        </Link>
      </div>
    );
  }

  return <EmailDetail email={email} backHref={backHref} />;
}
