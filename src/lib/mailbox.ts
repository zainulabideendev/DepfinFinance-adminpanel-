export type Mailbox =
  | "inbox"
  | "starred"
  | "sent"
  | "drafts"
  | "snoozed"
  | "spam"
  | "trash"
  | "archive";

export type FolderView = Mailbox;

export const mailboxRoutes: Record<Mailbox, string> = {
  inbox: "/email",
  starred: "/email/starred",
  sent: "/email/sent",
  drafts: "/email/drafts",
  snoozed: "/email/snoozed",
  spam: "/email/spam",
  trash: "/email/trash",
  archive: "/email/archive",
};

export const mailboxLabels: Record<Mailbox, string> = {
  inbox: "Inbox",
  starred: "Starred",
  sent: "Sent",
  drafts: "Drafts",
  snoozed: "Snoozed",
  spam: "Spam",
  trash: "Trash",
  archive: "Archive",
};

export function getMailboxFromPath(pathname: string): Mailbox {
  const entry = Object.entries(mailboxRoutes).find(([, route]) => route === pathname);
  return (entry?.[0] as Mailbox) ?? "inbox";
}

export function getBackPath(folder: Mailbox): string {
  return mailboxRoutes[folder === "starred" ? "inbox" : folder];
}
