"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, SendHorizontal } from "lucide-react";
import type { ChatMessage } from "@/lib/chat";

type ChatWindowProps = {
  title: string;
  subtitle?: string;
  messages: ChatMessage[];
  loading?: boolean;
  emptyText?: string;
  sending?: boolean;
  onSend: (text: string) => Promise<void> | void;
  onBack?: () => void;
  onClose?: () => void;
  selfSender: "user" | "admin";
  className?: string;
};

function formatTime(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function sameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}

export default function ChatWindow({
  title,
  subtitle,
  messages,
  loading = false,
  emptyText = "No messages yet. Say hello!",
  sending = false,
  onSend,
  onBack,
  onClose,
  selfSender,
  className = "",
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [title]);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    await onSend(text);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden bg-surface ${className}`}
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground md:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
          {getInitials(title)}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {title}
          </h2>
          {subtitle ? (
            <p className="truncate text-xs text-text-secondary">{subtitle}</p>
          ) : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2.5 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background hover:text-foreground"
            aria-label="Close chat"
          >
            Close
          </button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto bg-[#f8fafc] px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <SendHorizontal className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">{emptyText}</p>
            <p className="max-w-xs text-xs text-text-secondary">
              Replies you send will appear in the user’s chat box.
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const mine = message.sender === selfSender;
            const prev = messages[index - 1] ?? null;
            const showDay =
              !prev || !sameDay(prev.createdAt, message.createdAt);

            return (
              <div key={message.id}>
                {showDay && message.createdAt ? (
                  <div className="my-4 flex justify-center">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-text-secondary shadow-sm ring-1 ring-border">
                      {formatDayLabel(message.createdAt)}
                    </span>
                  </div>
                ) : null}

                <div
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[min(85%,28rem)] px-3.5 py-2.5 shadow-sm ${
                      mine
                        ? "rounded-2xl rounded-br-md bg-primary text-white"
                        : "rounded-2xl rounded-bl-md bg-white text-foreground ring-1 ring-border"
                    }`}
                  >
                    {!mine ? (
                      <p className="mb-1 text-[11px] font-semibold text-primary">
                        {message.sender === "admin"
                          ? "Depfin Finance"
                          : message.senderName || "User"}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                      {message.text}
                    </p>
                    <p
                      className={`mt-1.5 text-right text-[10px] ${
                        mine ? "text-white/70" : "text-text-muted"
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border bg-surface px-4 py-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => handleDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a reply…"
            rows={1}
            className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-text-muted"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !draft.trim()}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-text-muted">
          Press Enter to send · Shift+Enter for a new line
        </p>
      </form>
    </div>
  );
}
