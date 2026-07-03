"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  Forward,
  Image,
  Link2,
  Mail,
  MoreVertical,
  Paperclip,
  Reply,
  ReplyAll,
  Smile,
  Sparkles,
  Star,
  Trash2,
  Type,
} from "lucide-react";
import AttachmentsPanel from "@/components/email/AttachmentsPanel";
import { useEmailStore } from "@/context/EmailStore";
import type { Attachment, Email } from "@/lib/emails";

const attachmentIcons: Record<string, { bg: string; label: string }> = {
  pdf: { bg: "bg-red-50 text-red-500", label: "PDF" },
  xlsx: { bg: "bg-green-50 text-green-600", label: "XLS" },
  jpg: { bg: "bg-blue-50 text-blue-500", label: "IMG" },
  png: { bg: "bg-blue-50 text-blue-500", label: "IMG" },
  zip: { bg: "bg-gray-100 text-gray-500", label: "ZIP" },
  docx: { bg: "bg-blue-50 text-blue-500", label: "DOC" },
};

const aiSuggestions = [
  "I'll review this now.",
  "Looks great, thanks!",
  "Can we reschedule the sync?",
  "Please send the editable version.",
];

export default function EmailDetail({
  email,
  backHref,
}: {
  email: Email;
  backHref: string;
}) {
  const router = useRouter();
  const {
    moveToTrash,
    archiveEmail,
    markUnread,
    restoreFromTrash,
    deletePermanently,
    sendReply,
    openCompose,
  } = useEmailStore();

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [initialAttachment, setInitialAttachment] = useState<Attachment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sentNotice, setSentNotice] = useState(false);

  const attachments = email.attachments ?? [];
  const messages = email.messages ?? [];
  const isTrash = email.folder === "trash";
  const isDraft = email.folder === "drafts";

  const openAllAttachments = () => {
    setPreviewOnly(false);
    setInitialAttachment(null);
    setAttachmentsOpen(true);
  };

  const openAttachmentPreview = (file: Attachment) => {
    setPreviewOnly(true);
    setInitialAttachment(file);
    setAttachmentsOpen(true);
  };

  const closeAttachments = () => {
    setAttachmentsOpen(false);
    setPreviewOnly(false);
    setInitialAttachment(null);
  };

  const handleDelete = () => {
    if (isTrash) {
      deletePermanently(email.id);
    } else {
      moveToTrash(email.id);
    }
    router.push(backHref);
  };

  const handleRestore = () => {
    restoreFromTrash(email.id);
    router.push("/email");
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    sendReply(email.id, replyText);
    setReplyText("");
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3000);
  };

  const handleOpenReply = () => {
    openCompose({
      mode: "reply",
      to: [email.replyTo ?? email.sender],
      subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
      replyToEmailId: email.id,
    });
  };

  const handleOpenForward = () => {
    openCompose({
      mode: "forward",
      subject: email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`,
      body: `\n\n---------- Forwarded message ----------\nFrom: ${email.sender}\nSubject: ${email.subject}\n\n${messages[0]?.body ?? email.preview}`,
    });
  };

  const handleEditDraft = () => {
    openCompose({
      mode: "draft",
      to: email.recipient ? [email.recipient] : [],
      subject: email.subject,
      body: messages[0]?.body ?? email.preview,
      draftId: email.id,
    });
  };

  const applySuggestion = (text: string) => {
    setReplyText(text);
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Top action bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-2.5">
        <div className="flex items-center gap-4">
          {!isTrash ? (
            <>
              <button
                type="button"
                onClick={() => {
                  archiveEmail(email.id);
                  router.push(backHref);
                }}
                className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-foreground"
              >
                <Archive className="h-4 w-4" />
                Archive
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-sm text-red-500 transition-colors hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => markUnread(email.id)}
                className="flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                Mark Unread
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRestore}
                className="flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary-hover"
              >
                <Archive className="h-4 w-4" />
                Restore
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-sm text-red-500 transition-colors hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete forever
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isDraft && (
            <>
              <button
                type="button"
                onClick={handleOpenReply}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
                aria-label="Reply"
              >
                <Reply className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleOpenReply}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
                aria-label="Reply all"
              >
                <ReplyAll className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleOpenForward}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
                aria-label="Forward"
              >
                <Forward className="h-4 w-4" />
              </button>
            </>
          )}
          {isDraft && (
            <button
              type="button"
              onClick={handleEditDraft}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Edit Draft
            </button>
          )}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
            aria-label="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {/* Back + subject */}
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-background hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <div className="mb-6 flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold leading-snug text-foreground">
            {email.subject}
          </h1>
          {email.label && (
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
            >
              {email.label}
              <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
            </button>
          )}
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Paperclip className="h-4 w-4 text-text-secondary" />
                Attachments ({attachments.length})
              </div>
              <button
                type="button"
                onClick={openAllAttachments}
                className="text-sm font-medium text-primary hover:text-primary-hover cursor-pointer"
              >
                View all attachments
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {attachments.map((file) => {
                const icon = attachmentIcons[file.type] ?? attachmentIcons.pdf;
                return (
                  <button
                    key={file.name}
                    type="button"
                    onClick={() => openAttachmentPreview(file)}
                    className="flex w-52 cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary-light/30"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${icon.bg}`}
                    >
                      {icon.label}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {file.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {file.type.toUpperCase()} · {file.size}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Thread */}
        <div className="space-y-0">
          {messages.map((message, index) => (
            <div key={message.id}>
              {index > 0 && <hr className="my-6 border-border" />}
              <div className="flex gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${message.avatarColor}`}
                >
                  {message.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <span className="font-semibold text-foreground">
                        {message.sender}
                      </span>
                      <span className="ml-2 text-sm text-text-secondary">
                        {message.email}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm text-text-secondary">{message.time}</span>
                      {message.showActions && (
                        <>
                          <button
                            type="button"
                            className="text-text-muted hover:text-amber-400"
                            aria-label="Star"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenReply}
                            className="text-text-muted hover:text-foreground"
                            aria-label="Reply"
                          >
                            <Reply className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="text-text-muted hover:text-foreground"
                            aria-label="More"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                    {message.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isDraft && (
        <div className="mt-8 rounded-xl border border-border bg-surface">
          {sentNotice && (
            <div className="border-b border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
              Message sent successfully.
            </div>
          )}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm text-text-secondary">
              Replying to{" "}
              <span className="font-medium text-foreground">{email.replyTo}</span>
            </span>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate AI Reply
            </button>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your message here..."
            rows={5}
            className="w-full resize-none px-4 py-4 text-sm text-foreground placeholder:text-text-muted outline-none"
          />

          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
            {aiSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary transition-colors hover:border-primary/30 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <div className="flex items-center gap-1">
              {[
                { icon: Type, label: "Bold" },
                { icon: Link2, label: "Link" },
                { icon: Image, label: "Image" },
                { icon: Smile, label: "Emoji" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setReplyText("")}
                className="text-sm text-text-secondary transition-colors hover:text-foreground"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      <AttachmentsPanel
        open={attachmentsOpen}
        onClose={closeAttachments}
        attachments={attachments}
        initialAttachment={initialAttachment}
        previewOnly={previewOnly}
      />
    </div>
  );
}
