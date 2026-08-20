"use client";

import MessagesPanel from "@/components/messages/MessagesPanel";
import { useAuth } from "@/context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background p-4 md:p-5">
      <div className="mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Messages
        </h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Respond to live support chats from app users
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <MessagesPanel admin={user} />
      </div>
    </div>
  );
}
