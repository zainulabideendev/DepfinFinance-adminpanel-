"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { MessageSquare, Search } from "lucide-react";
import ChatWindow from "@/components/messages/ChatWindow";
import type { ChatMessage, ChatThread } from "@/lib/chat";
import {
  markThreadReadByAdmin,
  sendChatMessage,
  subscribeToAllThreads,
  subscribeToUserMessages,
} from "@/lib/chatService";

function formatPreviewTime(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function MessagesPanel({ admin }: { admin: User }) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [query, setQuery] = useState("");

  const selected = threads.find((thread) => thread.id === selectedId) ?? null;
  const adminId = admin.uid;
  const adminDisplayName = "Depfin Finance";

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => {
      const haystack = [
        thread.userName,
        thread.userEmail,
        thread.userId,
        thread.lastMessage,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [threads, query]);

  const unreadTotal = useMemo(
    () => threads.reduce((sum, thread) => sum + (thread.unreadByAdmin || 0), 0),
    [threads],
  );

  useEffect(() => {
    const unsub = subscribeToAllThreads(
      (next) => {
        setThreads(next);
        setLoadingThreads(false);
        setSelectedId((current) => {
          if (current && next.some((thread) => thread.id === current)) {
            return current;
          }
          return next[0]?.id ?? null;
        });
      },
      (message) => {
        setError(message);
        setLoadingThreads(false);
      },
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const unsub = subscribeToUserMessages(
      selectedId,
      (next) => {
        setMessages(next);
        setLoadingMessages(false);
      },
      (message) => {
        setError(message);
        setLoadingMessages(false);
      },
    );

    markThreadReadByAdmin(selectedId).catch(() => {});

    return () => unsub();
  }, [selectedId]);

  const handleSend = async (text: string) => {
    if (!selected) return;
    setSending(true);
    setError(null);
    const result = await sendChatMessage({
      userId: selected.userId,
      userName: selected.userName,
      userEmail: selected.userEmail,
      text,
      sender: "admin",
      senderId: adminId,
      senderName: adminDisplayName,
    });
    if (result.error) {
      setError(result.message ?? "Failed to send reply");
    }
    setSending(false);
  };

  const selectThread = (id: string) => {
    setSelectedId(id);
    setMobileShowChat(true);
  };

  return (
    <div className="flex h-full w-full overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <aside
        className={`flex w-full flex-col border-r border-border bg-surface md:w-[340px] md:max-w-[340px] ${
          mobileShowChat ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-border px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Inbox
              </h2>
              <p className="text-xs text-text-secondary">
                {loadingThreads
                  ? "Loading conversations…"
                  : `${threads.length} conversation${threads.length === 1 ? "" : "s"}`}
                {unreadTotal > 0 ? ` · ${unreadTotal} unread` : ""}
              </p>
            </div>
          </div>

          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email"
              className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {query.trim() ? "No matches" : "No conversations yet"}
              </p>
              <p className="text-xs text-text-secondary">
                {query.trim()
                  ? "Try a different name or email."
                  : "When a logged-in user chats, it will appear here."}
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const active = thread.id === selectedId;
              const unread = thread.unreadByAdmin > 0;

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => selectThread(thread.id)}
                  className={`flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors ${
                    active
                      ? "bg-primary-light/70"
                      : "hover:bg-background"
                  }`}
                >
                  <div
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      active
                        ? "bg-primary text-white"
                        : "bg-primary-light text-primary"
                    }`}
                  >
                    {getInitials(thread.userName || thread.userEmail || "U")}
                    {unread ? (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm ${
                          unread
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground"
                        }`}
                      >
                        {thread.userName || "Unknown user"}
                      </span>
                      <span className="shrink-0 text-[11px] text-text-muted">
                        {formatPreviewTime(thread.lastMessageAt)}
                      </span>
                    </div>

                    <p className="truncate text-xs text-text-secondary">
                      {thread.userEmail || thread.userId}
                    </p>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          unread
                            ? "font-medium text-foreground"
                            : "text-text-secondary"
                        }`}
                      >
                        {thread.lastSender === "admin" ? "You: " : ""}
                        {thread.lastMessage || "No messages"}
                      </p>
                      {unread ? (
                        <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {thread.unreadByAdmin}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section
        className={`min-w-0 flex-1 flex-col ${
          mobileShowChat ? "flex" : "hidden md:flex"
        }`}
      >
        {selected ? (
          <>
            <ChatWindow
              title={selected.userName || "Unknown user"}
              subtitle={selected.userEmail || selected.userId}
              messages={messages}
              loading={loadingMessages}
              sending={sending}
              onSend={handleSend}
              onBack={() => setMobileShowChat(false)}
              selfSender="admin"
              emptyText="No messages in this conversation yet."
              className="min-h-0 flex-1"
            />
            {error ? (
              <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#f8fafc] px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Select a conversation
              </p>
              <p className="mt-1 max-w-sm text-xs text-text-secondary">
                Choose a thread from the inbox to view the chat and reply as
                Depfin Finance.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
