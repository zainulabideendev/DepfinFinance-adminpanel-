import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import {
  CHATS_COLLECTION,
  MESSAGES_SUBCOLLECTION,
  toDate,
  type ChatMessage,
  type ChatSender,
  type ChatThread,
} from "@/lib/chat";
import { firestore } from "@/lib/firebase";
import { getFirebaseErrorMessage } from "@/lib/firebaseErrors";

function mapThread(id: string, data: Record<string, unknown>): ChatThread {
  return {
    id,
    userId: String(data.userId ?? id),
    userName: String(data.userName ?? "User"),
    userEmail: String(data.userEmail ?? ""),
    lastMessage: String(data.lastMessage ?? ""),
    lastMessageAt: toDate(data.lastMessageAt),
    lastSender: (data.lastSender as ChatSender | null) ?? null,
    unreadByAdmin: Number(data.unreadByAdmin ?? 0),
    unreadByUser: Number(data.unreadByUser ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function mapMessage(id: string, data: Record<string, unknown>): ChatMessage {
  return {
    id,
    text: String(data.text ?? ""),
    sender: (data.sender as ChatSender) ?? "user",
    senderId: String(data.senderId ?? ""),
    senderName: String(data.senderName ?? ""),
    createdAt: toDate(data.createdAt),
  };
}

async function ensureThread(
  userId: string,
  userName: string,
  userEmail: string,
): Promise<void> {
  const threadRef = doc(firestore, CHATS_COLLECTION, userId);
  const snapshot = await getDoc(threadRef);

  if (!snapshot.exists()) {
    await setDoc(threadRef, {
      userId,
      userName,
      userEmail,
      lastMessage: "",
      lastMessageAt: null,
      lastSender: null,
      unreadByAdmin: 0,
      unreadByUser: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function sendChatMessage(params: {
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  sender: ChatSender;
  senderId: string;
  senderName: string;
}): Promise<{ error?: boolean; message?: string }> {
  const text = params.text.trim();
  if (!text) {
    return { error: true, message: "Message cannot be empty" };
  }

  try {
    await ensureThread(params.userId, params.userName, params.userEmail);

    const threadRef = doc(firestore, CHATS_COLLECTION, params.userId);
    const messagesRef = collection(
      firestore,
      CHATS_COLLECTION,
      params.userId,
      MESSAGES_SUBCOLLECTION,
    );

    await addDoc(messagesRef, {
      text,
      sender: params.sender,
      senderId: params.senderId,
      senderName: params.senderName,
      createdAt: serverTimestamp(),
    });

    const isAdmin = params.sender === "admin";
    const threadSnap = await getDoc(threadRef);
    const current = threadSnap.data() ?? {};

    await updateDoc(threadRef, {
      userName: params.userName || current.userName || "User",
      userEmail: params.userEmail || current.userEmail || "",
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      lastSender: params.sender,
      unreadByAdmin: isAdmin ? 0 : Number(current.unreadByAdmin ?? 0) + 1,
      unreadByUser: isAdmin ? Number(current.unreadByUser ?? 0) + 1 : 0,
      updatedAt: serverTimestamp(),
    });

    return {};
  } catch (error) {
    return {
      error: true,
      message: getFirebaseErrorMessage(error, "Failed to send message"),
    };
  }
}

export function subscribeToUserMessages(
  userId: string,
  onChange: (messages: ChatMessage[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  const messagesQuery = query(
    collection(
      firestore,
      CHATS_COLLECTION,
      userId,
      MESSAGES_SUBCOLLECTION,
    ),
    orderBy("createdAt", "asc"),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((messageDoc) =>
          mapMessage(messageDoc.id, messageDoc.data()),
        ),
      );
    },
    (error) => {
      onError?.(getFirebaseErrorMessage(error, "Failed to load messages"));
    },
  );
}

export function subscribeToAllThreads(
  onChange: (threads: ChatThread[]) => void,
  onError?: (message: string) => void,
): Unsubscribe {
  const threadsQuery = query(
    collection(firestore, CHATS_COLLECTION),
    orderBy("lastMessageAt", "desc"),
  );

  return onSnapshot(
    threadsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((threadDoc) =>
          mapThread(threadDoc.id, threadDoc.data()),
        ),
      );
    },
    (error) => {
      onError?.(getFirebaseErrorMessage(error, "Failed to load conversations"));
    },
  );
}

export async function markThreadReadByAdmin(userId: string): Promise<void> {
  try {
    await updateDoc(doc(firestore, CHATS_COLLECTION, userId), {
      unreadByAdmin: 0,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Thread may not exist yet
  }
}
