export const CHATS_COLLECTION = "chats";
export const MESSAGES_SUBCOLLECTION = "messages";

export type ChatSender = "user" | "admin";

export type ChatMessage = {
  id: string;
  text: string;
  sender: ChatSender;
  senderId: string;
  senderName: string;
  createdAt: Date | null;
};

export type ChatThread = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: Date | null;
  lastSender: ChatSender | null;
  unreadByAdmin: number;
  unreadByUser: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}
