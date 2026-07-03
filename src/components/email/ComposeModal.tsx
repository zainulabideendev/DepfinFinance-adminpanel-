"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold,
  ChevronRight,
  FileText,
  Image,
  Italic,
  Link2,
  List,
  Maximize2,
  Minus,
  MoreHorizontal,
  Paperclip,
  Smile,
  Sparkles,
  Trash2,
  Type,
  UserPlus,
  X,
} from "lucide-react";
import type { ComposeData } from "@/context/EmailStore";

type ComposeModalProps = {
  open: boolean;
  onClose: () => void;
  composeData?: ComposeData | null;
  onSend: (data: {
    to: string[];
    subject: string;
    body: string;
    draftId?: number;
  }) => void;
  onSaveDraft: (data: {
    to: string[];
    subject: string;
    body: string;
    draftId?: number;
  }) => void;
};

type LocalAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["xlsx", "xls", "csv"].includes(ext)) return "sheet";
  if (["doc", "docx"].includes(ext)) return "doc";
  return "file";
}

function getComposeTitle(mode?: ComposeData["mode"]) {
  if (mode === "reply") return "Reply";
  if (mode === "forward") return "Forward";
  if (mode === "draft") return "Edit Draft";
  return "New Message";
}

const typeStyles: Record<string, { bg: string; label: string }> = {
  pdf: { bg: "bg-red-50 text-red-500", label: "PDF" },
  image: { bg: "bg-blue-50 text-blue-500", label: "IMG" },
  sheet: { bg: "bg-green-50 text-green-600", label: "XLS" },
  doc: { bg: "bg-blue-50 text-blue-500", label: "DOC" },
  file: { bg: "bg-gray-100 text-gray-500", label: "FILE" },
};

export default function ComposeModal({
  open,
  onClose,
  composeData,
  onSend,
  onSaveDraft,
}: ComposeModalProps) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [toInput, setToInput] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setRecipients(composeData?.to ?? []);
    setToInput("");
    setSubject(composeData?.subject ?? "");
    setBody(composeData?.body ?? "");
    setAttachments([]);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, composeData]);

  if (!open) return null;

  const draftId = composeData?.draftId;

  const removeRecipient = (name: string) => {
    setRecipients((prev) => prev.filter((r) => r !== name));
  };

  const addRecipient = (value: string) => {
    const trimmed = value.trim().replace(/,$/, "");
    if (trimmed && !recipients.includes(trimmed)) {
      setRecipients((prev) => [...prev, trimmed]);
    }
    setToInput("");
  };

  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addRecipient(toInput);
    }
  };

  const getPayload = () => {
    const finalRecipients = [...recipients];
    if (toInput.trim()) finalRecipients.push(toInput.trim());
    return { to: finalRecipients, subject, body, draftId };
  };

  const handleSend = () => {
    const payload = getPayload();
    if (!payload.body.trim() || payload.to.length === 0) return;
    onSend(payload);
  };

  const handleSaveDraft = () => {
    onSaveDraft(getPayload());
  };

  const addFiles = (files: FileList | File[]) => {
    const newAttachments = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
    }));

    setAttachments((prev) => {
      const existingNames = new Set(prev.map((a) => a.name));
      return [...prev, ...newAttachments.filter((a) => !existingNames.has(a.name))];
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInput}
        aria-hidden
      />

      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <h2 id="compose-title" className="text-sm font-semibold text-foreground">
              {getComposeTitle(composeData?.mode)}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="Minimize">
              <Minus className="h-4 w-4" />
            </button>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="Expand">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-2.5">
          <span className="w-8 shrink-0 text-sm text-text-secondary">To</span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {recipients.map((name) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-sm text-foreground">
                {name}
                <button type="button" onClick={() => removeRecipient(name)} className="text-text-muted hover:text-foreground" aria-label={`Remove ${name}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              onKeyDown={handleToKeyDown}
              onBlur={() => toInput.trim() && addRecipient(toInput)}
              placeholder="Add recipients..."
              className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-text-muted outline-none"
            />
          </div>
          <button type="button" className="shrink-0 text-sm text-text-secondary hover:text-primary">Cc/Bcc</button>
        </div>

        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-2.5">
          <span className="w-8 shrink-0 text-sm text-text-secondary">Sub</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject of your message"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-text-muted outline-none"
          />
          <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="Add contact">
            <UserPlus className="h-4 w-4" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            className="min-h-[200px] w-full resize-none px-5 py-4 pr-16 text-sm leading-relaxed text-foreground placeholder:text-text-muted outline-none"
          />
          <div className="absolute right-4 top-4 flex flex-col items-center gap-2">
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-hover" aria-label="AI assist">
              <Sparkles className="h-4 w-4" />
            </button>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="Text formatting">
              <Type className="h-4 w-4" />
            </button>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="More tools">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-border px-5 py-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-text-secondary">
            <Paperclip className="h-3.5 w-3.5" />
            ATTACHMENTS ({attachments.length})
          </div>
          <div className="flex flex-wrap gap-3">
            {attachments.map((file) => {
              const style = typeStyles[file.type] ?? typeStyles.file;
              return (
                <div key={file.id} className="group relative flex w-44 shrink-0 items-center gap-3 rounded-lg border border-border bg-background p-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${style.bg}`}>{style.label}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-text-secondary">{formatFileSize(file.size)}</p>
                  </div>
                  <button type="button" onClick={() => removeAttachment(file.id)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-text-secondary opacity-0 shadow-sm group-hover:opacity-100 hover:text-red-500" aria-label={`Remove ${file.name}`}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={openFilePicker}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[72px] min-w-[200px] flex-1 items-center justify-center rounded-lg border border-dashed px-4 py-6 text-sm transition-colors ${isDragging ? "border-primary bg-primary-light text-primary" : "border-border bg-background text-text-muted hover:border-primary/40 hover:text-text-secondary"}`}
            >
              Drag and drop more files or images
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-border px-5 py-3">
          <div className="mb-3 flex items-center gap-1">
            {[
              { icon: Bold, label: "Bold" },
              { icon: Italic, label: "Italic" },
              { icon: List, label: "List" },
              { icon: Link2, label: "Link" },
              { icon: Image, label: "Image" },
              { icon: Smile, label: "Emoji" },
              { icon: Paperclip, label: "Attach", action: openFilePicker },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} type="button" onClick={action} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label={label}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleSend} className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover">Send</button>
              <button type="button" onClick={handleSaveDraft} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-background">
                <FileText className="h-4 w-4" />
                Save Draft
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="More options">
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-background" aria-label="Discard">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
