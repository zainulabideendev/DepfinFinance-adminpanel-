"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  formatNowDateTime,
  formatNowTime,
  initialEmails,
  type Email,
  type ThreadMessage,
} from "@/lib/emails";
import type { FolderView, Mailbox } from "@/lib/mailbox";

export type ComposeMode = "new" | "reply" | "forward" | "draft";

export type ComposeData = {
  mode: ComposeMode;
  to?: string[];
  subject?: string;
  body?: string;
  draftId?: number;
  replyToEmailId?: number;
};

type EmailStoreContextValue = {
  emails: Email[];
  getEmailById: (id: number) => Email | undefined;
  getEmailsForFolder: (folder: FolderView) => Email[];
  getBadgeCount: (folder: Mailbox) => number | undefined;
  toggleStar: (id: number) => void;
  moveToTrash: (id: number) => void;
  archiveEmail: (id: number) => void;
  markUnread: (id: number) => void;
  markRead: (id: number) => void;
  restoreFromTrash: (id: number) => void;
  deletePermanently: (id: number) => void;
  sendReply: (emailId: number, body: string) => void;
  sendEmail: (data: {
    to: string[];
    subject: string;
    body: string;
    draftId?: number;
  }) => void;
  saveDraft: (data: {
    to: string[];
    subject: string;
    body: string;
    draftId?: number;
  }) => void;
  composeOpen: boolean;
  composeData: ComposeData | null;
  openCompose: (data?: ComposeData) => void;
  closeCompose: () => void;
};

const EmailStoreContext = createContext<EmailStoreContextValue | null>(null);

let nextId = 100;

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState<ComposeData | null>(null);

  const getEmailById = useCallback(
    (id: number) => emails.find((email) => email.id === id),
    [emails],
  );

  const getEmailsForFolder = useCallback(
    (folder: FolderView) => {
      if (folder === "starred") {
        return emails.filter((email) => email.starred && email.folder !== "trash");
      }
      return emails.filter((email) => email.folder === folder);
    },
    [emails],
  );

  const getBadgeCount = useCallback(
    (folder: Mailbox) => {
      if (folder === "inbox") {
        return emails.filter((e) => e.folder === "inbox" && e.unread).length;
      }
      if (folder === "drafts") {
        return emails.filter((e) => e.folder === "drafts").length;
      }
      return undefined;
    },
    [emails],
  );

  const updateEmail = useCallback((id: number, updater: (email: Email) => Email) => {
    setEmails((prev) => prev.map((email) => (email.id === id ? updater(email) : email)));
  }, []);

  const toggleStar = useCallback(
    (id: number) => {
      updateEmail(id, (email) => ({ ...email, starred: !email.starred }));
    },
    [updateEmail],
  );

  const moveToTrash = useCallback(
    (id: number) => {
      updateEmail(id, (email) => ({
        ...email,
        folder: "trash",
        unread: false,
        highlighted: false,
      }));
    },
    [updateEmail],
  );

  const archiveEmail = useCallback(
    (id: number) => {
      updateEmail(id, (email) => ({
        ...email,
        folder: "archive",
        unread: false,
        highlighted: false,
      }));
    },
    [updateEmail],
  );

  const markUnread = useCallback((id: number) => {
    setEmails((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target || target.unread) return prev;
      return prev.map((email) => (email.id === id ? { ...email, unread: true } : email));
    });
  }, []);

  const markRead = useCallback((id: number) => {
    setEmails((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target || (!target.unread && !target.highlighted)) return prev;
      return prev.map((email) =>
        email.id === id ? { ...email, unread: false, highlighted: false } : email,
      );
    });
  }, []);

  const restoreFromTrash = useCallback(
    (id: number) => {
      updateEmail(id, (email) => ({ ...email, folder: "inbox" }));
    },
    [updateEmail],
  );

  const deletePermanently = useCallback((id: number) => {
    setEmails((prev) => prev.filter((email) => email.id !== id));
  }, []);

  const sendReply = useCallback(
    (emailId: number, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      const original = emails.find((e) => e.id === emailId);
      if (!original) return;

      const newMessage: ThreadMessage = {
        id: `reply-${Date.now()}`,
        sender: "You",
        email: "you@admincorp.com",
        avatar: "ME",
        avatarColor: "bg-primary",
        time: formatNowDateTime(),
        body: trimmed,
        isMe: true,
      };

      setEmails((prev) => {
        const updated = prev.map((email) => {
          if (email.id !== emailId) return email;
          return {
            ...email,
            unread: false,
            highlighted: false,
            preview: trimmed.slice(0, 80),
            time: formatNowTime(),
            messages: [...(email.messages ?? []), newMessage],
          };
        });

        const sentEmail: Email = {
          id: nextId++,
          sender: "You",
          subject: original.subject.startsWith("Re:")
            ? original.subject
            : `Re: ${original.subject}`,
          preview: trimmed.slice(0, 100),
          time: formatNowTime(),
          starred: false,
          unread: false,
          folder: "sent",
          recipient: original.replyTo ?? original.sender,
          recipientEmail: original.replyToEmail,
          attachment: null,
          highlighted: false,
          messages: [newMessage],
        };

        return [sentEmail, ...updated];
      });
    },
    [emails],
  );

  const sendEmail = useCallback(
    (data: { to: string[]; subject: string; body: string; draftId?: number }) => {
      const trimmed = data.body.trim();
      if (!trimmed || data.to.length === 0) return;

      const message: ThreadMessage = {
        id: `sent-${Date.now()}`,
        sender: "You",
        email: "you@admincorp.com",
        avatar: "ME",
        avatarColor: "bg-primary",
        time: formatNowDateTime(),
        body: trimmed,
        isMe: true,
      };

      const newId = data.draftId ?? nextId++;
      const sentEmail: Email = {
        id: newId,
        sender: "You",
        subject: data.subject || "(No subject)",
        preview: trimmed.slice(0, 100),
        time: formatNowTime(),
        starred: false,
        unread: false,
        folder: "sent",
        recipient: data.to.join(", "),
        recipientEmail: data.to[0],
        attachment: null,
        highlighted: false,
        messages: [message],
      };

      setEmails((prev) => {
        const withoutDraft = data.draftId
          ? prev.filter((e) => e.id !== data.draftId)
          : prev;
        return [sentEmail, ...withoutDraft];
      });
      setComposeOpen(false);
      setComposeData(null);
    },
    [],
  );

  const saveDraft = useCallback(
    (data: { to: string[]; subject: string; body: string; draftId?: number }) => {
      const draftEmail: Email = {
        id: data.draftId ?? nextId++,
        sender: "You",
        subject: data.subject || "(No subject)",
        preview: data.body.trim().slice(0, 100) || "Empty draft",
        time: "Draft",
        starred: false,
        unread: false,
        folder: "drafts",
        recipient: data.to.join(", ") || "No recipient",
        recipientEmail: data.to[0],
        attachment: null,
        highlighted: false,
        messages: [
          {
            id: `draft-${Date.now()}`,
            sender: "You",
            email: "you@admincorp.com",
            avatar: "ME",
            avatarColor: "bg-primary",
            time: "Draft",
            body: data.body,
            isMe: true,
          },
        ],
      };

      setEmails((prev) => {
        if (data.draftId) {
          return prev.map((e) => (e.id === data.draftId ? draftEmail : e));
        }
        return [draftEmail, ...prev];
      });
      setComposeOpen(false);
      setComposeData(null);
    },
    [],
  );

  const openCompose = useCallback((data?: ComposeData) => {
    setComposeData(data ?? { mode: "new" });
    setComposeOpen(true);
  }, []);

  const closeCompose = useCallback(() => {
    setComposeOpen(false);
    setComposeData(null);
  }, []);

  const value = useMemo(
    () => ({
      emails,
      getEmailById,
      getEmailsForFolder,
      getBadgeCount,
      toggleStar,
      moveToTrash,
      archiveEmail,
      markUnread,
      markRead,
      restoreFromTrash,
      deletePermanently,
      sendReply,
      sendEmail,
      saveDraft,
      composeOpen,
      composeData,
      openCompose,
      closeCompose,
    }),
    [
      emails,
      getEmailById,
      getEmailsForFolder,
      getBadgeCount,
      toggleStar,
      moveToTrash,
      archiveEmail,
      markUnread,
      markRead,
      restoreFromTrash,
      deletePermanently,
      sendReply,
      sendEmail,
      saveDraft,
      composeOpen,
      composeData,
      openCompose,
      closeCompose,
    ],
  );

  return (
    <EmailStoreContext.Provider value={value}>{children}</EmailStoreContext.Provider>
  );
}

export function useEmailStore() {
  const context = useContext(EmailStoreContext);
  if (!context) {
    throw new Error("useEmailStore must be used within EmailProvider");
  }
  return context;
}
