"use client";

import EmailList from "@/components/email/EmailList";
import type { FolderView } from "@/lib/mailbox";

export default function MailboxView({ folder }: { folder: FolderView }) {
  return <EmailList folder={folder} />;
}
