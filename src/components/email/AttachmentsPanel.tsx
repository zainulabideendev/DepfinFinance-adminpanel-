"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileArchive,
  FileText,
  Filter,
  HardDrive,
  ImageIcon,
  Link2,
  MoreVertical,
  Search,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { Attachment } from "@/lib/emails";

type AttachmentsPanelProps = {
  open: boolean;
  onClose: () => void;
  attachments: Attachment[];
  initialAttachment?: Attachment | null;
  previewOnly?: boolean;
};

type FilterKey = "all" | "image" | "document" | "spreadsheet";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Filter" },
  { key: "image", label: "Images" },
  { key: "document", label: "Documents" },
  { key: "spreadsheet", label: "Spreadsheets" },
];

const zipContents = [
  "brand_assets/logo_primary.svg",
  "brand_assets/logo_dark.png",
  "templates/email_header.html",
  "templates/signature_block.html",
  "fonts/Inter-Regular.woff2",
];

const spreadsheetRows = [
  ["Category", "Q1", "Q2", "Q3", "Q4"],
  ["Marketing", "$42,000", "$48,500", "$51,200", "$55,800"],
  ["Operations", "$31,400", "$33,100", "$34,800", "$36,200"],
  ["R&D", "$28,000", "$29,500", "$31,000", "$33,500"],
  ["Total", "$101,400", "$111,100", "$117,000", "$125,500"],
];

function parseSizeMb(size: string): number {
  const value = parseFloat(size);
  if (size.includes("GB")) return value * 1024;
  return value;
}

function totalSizeLabel(attachments: Attachment[]): string {
  const totalMb = attachments.reduce((sum, file) => sum + parseSizeMb(file.size), 0);
  if (totalMb >= 1024) return `${(totalMb / 1024).toFixed(1)} GB`;
  return `${totalMb.toFixed(1)} MB`;
}

function CardThumbnail({ file }: { file: Attachment }) {
  if (file.category === "image" && file.previewUrl) {
    return (
      <div className="relative h-36 overflow-hidden bg-background">
        <Image
          src={file.previewUrl}
          alt={file.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  if (file.category === "archive") {
    return (
      <div className="flex h-36 items-center justify-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-surface text-xs font-bold text-text-secondary">
          ZIP
        </div>
      </div>
    );
  }

  if (file.category === "spreadsheet") {
    return (
      <div className="flex h-36 items-center justify-center bg-green-50/50 p-4">
        <div className="grid w-full max-w-[180px] grid-cols-4 gap-px overflow-hidden rounded border border-green-200 bg-green-200 text-[8px]">
          {["Cat", "Q1", "Q2", "Q3"].map((cell) => (
            <div key={cell} className="bg-green-600 px-1 py-1 font-semibold text-white">
              {cell}
            </div>
          ))}
          {["Mkt", "42k", "48k", "51k", "Ops", "31k", "33k", "34k"].map((cell, i) => (
            <div key={`${cell}-${i}`} className="bg-white px-1 py-1 text-green-900">
              {cell}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-36 items-center justify-center bg-background p-6">
      <div className="w-full max-w-[200px] rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="mb-2 h-2 w-3/4 rounded bg-border" />
        <div className="mb-1.5 h-1.5 w-full rounded bg-border/80" />
        <div className="mb-1.5 h-1.5 w-full rounded bg-border/80" />
        <div className="mb-1.5 h-1.5 w-5/6 rounded bg-border/80" />
        <div className="h-1.5 w-2/3 rounded bg-border/80" />
        <p className="mt-3 text-center text-[10px] font-medium text-text-muted">
          {file.type === "docx" ? "Word Document" : "Project Proposal"}
        </p>
      </div>
    </div>
  );
}

function DocumentPage({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl rounded-sm bg-white p-10 shadow-lg">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Admin Corp
        </p>
        <h3 className="mt-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">Confidential — Internal Use Only</p>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        <p>
          This document outlines the strategic priorities and key initiatives for the upcoming
          quarter. Please review all sections and provide feedback by the stated deadline.
        </p>
        <p>
          Section 1 covers revenue targets and growth metrics. Section 2 details the marketing
          rollout timeline and associated budget allocations across all departments.
        </p>
        <p>
          Section 3 includes risk assessment and mitigation strategies. Appendix A contains
          supporting data and forecast models referenced throughout this proposal.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-16 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

function AttachmentFullPreview({
  file,
  onClose,
}: {
  file: Attachment;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = file.category === "document" ? 3 : 1;

  return (
    <div className="flex h-full flex-col bg-[#3f4348]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close preview"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{file.name}</p>
            <p className="text-xs text-white/50">
              {file.size} • {file.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(file.category === "document" || file.category === "spreadsheet") && (
            <>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-xs text-white/70">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              {file.category === "document" && (
                <>
                  <div className="mx-2 h-5 w-px bg-white/10" />
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-white/70">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </>
          )}
          <button
            type="button"
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {file.category === "image" && file.previewUrl && (
          <div
            className="mx-auto flex h-full min-h-[400px] items-center justify-center"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <div className="relative h-[70vh] w-full max-w-4xl">
              <Image
                src={file.previewUrl}
                alt={file.name}
                fill
                className="rounded-lg object-contain shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        )}

        {file.category === "image" && !file.previewUrl && (
          <div className="flex h-full items-center justify-center text-white/50">
            <ImageIcon className="h-12 w-12" aria-hidden />
            <span className="ml-2 text-sm">Image preview unavailable</span>
          </div>
        )}

        {file.category === "document" && (
          <div
            className="py-4 transition-transform"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            {page === 1 && (
              <DocumentPage
                title={file.name.replace(/\.(pdf|docx)$/i, "").replace(/_/g, " ")}
              />
            )}
            {page === 2 && <DocumentPage title="Budget & Forecast Summary" />}
            {page === 3 && <DocumentPage title="Appendix — Supporting Data" />}
          </div>
        )}

        {file.category === "spreadsheet" && (
          <div
            className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg transition-transform"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <div className="border-b border-gray-200 bg-green-700 px-4 py-2">
              <p className="text-sm font-medium text-white">{file.name}</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {spreadsheetRows.map((row, rowIndex) => (
                  <tr key={row.join("-")} className={rowIndex === 0 ? "bg-green-600 text-white" : rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    {row.map((cell) => (
                      <td key={cell} className="border border-gray-200 px-4 py-2.5 font-medium">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {file.category === "archive" && (
          <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-bold text-white">
                ZIP
              </div>
              <div>
                <p className="font-semibold text-white">{file.name}</p>
                <p className="text-sm text-white/50">{file.size} • {zipContents.length} files</p>
              </div>
            </div>
            <ul className="space-y-2">
              {zipContents.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80"
                >
                  <FileText className="h-4 w-4 shrink-0 text-white/40" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttachmentsPanel({
  open,
  onClose,
  attachments,
  initialAttachment = null,
  previewOnly = false,
}: AttachmentsPanelProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<Attachment | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!previewOnly && selected) setSelected(null);
        else onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, selected, previewOnly]);

  useEffect(() => {
    if (open) {
      setSelected(initialAttachment);
    } else {
      setSearch("");
      setActiveFilter("all");
      setSelected(null);
    }
  }, [open, initialAttachment]);

  const filtered = useMemo(() => {
    return attachments.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "image" && file.category === "image") ||
        (activeFilter === "document" &&
          (file.category === "document" || file.category === "archive")) ||
        (activeFilter === "spreadsheet" && file.category === "spreadsheet");
      return matchesSearch && matchesFilter;
    });
  }, [attachments, search, activeFilter]);

  if (!open) return null;

  if (previewOnly && initialAttachment) {
    return (
      <div className="fixed inset-0 z-50 flex bg-black/25 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <AttachmentFullPreview file={initialAttachment} onClose={onClose} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Left preview pane */}
      <div className="min-w-0 flex-1">
        {selected ? (
          <AttachmentFullPreview file={selected} onClose={() => setSelected(null)} />
        ) : (
          <button
            type="button"
            className="flex h-full w-full flex-col items-center justify-center gap-3 bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/25"
            onClick={onClose}
          >
            <FileArchive className="h-10 w-10 text-white/40" />
            <p className="text-sm text-white/60">Select an attachment to preview</p>
          </button>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl">
        <div className="shrink-0 border-b border-border px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                <FileArchive className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Attachments</h2>
                <p className="mt-0.5 text-xs font-medium tracking-wide text-text-secondary">
                  {attachments.length} FILES • {totalSizeLabel(attachments)} TOTAL
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-background hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-border px-5 py-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in attachments..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  activeFilter === filter.key
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-surface text-foreground hover:bg-background"
                }`}
              >
                {filter.key === "all" && <Filter className="h-3 w-3" />}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-4">
            {filtered.map((file) => {
              const isSelected = selected?.name === file.name;
              return (
                <div
                  key={file.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(file)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(file);
                    }
                  }}
                  className={`cursor-pointer overflow-hidden rounded-xl border bg-surface transition-colors ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <CardThumbnail file={file} />
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {file.name}
                        </p>
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {file.size} • {file.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 text-text-muted hover:text-foreground"
                        aria-label="More options"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-primary"
                      >
                        <HardDrive className="h-3.5 w-3.5" />
                        Save to Drive
                      </button>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-primary"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Attach
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-text-secondary">
                No attachments match your search.
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 space-y-2 border-t border-border px-5 py-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            <Download className="h-4 w-4" />
            Download All (ZIP)
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            <Share2 className="h-4 w-4" />
            Share Batch
          </button>
        </div>
      </aside>
    </div>
  );
}
