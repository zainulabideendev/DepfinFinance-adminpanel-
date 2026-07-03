"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { firestore } from "./firebase";
import type { LoanStatus, PersonalLoan } from "@/app/personal-loans/data";

type RawLoan = Record<string, unknown>;

const str = (v: unknown): string => (v == null ? "" : String(v).trim());
const num = (v: unknown): number => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const yes = (v: unknown): boolean => /^(yes|true|1)$/i.test(str(v));

// Records store dates like "02/07/2026, 10:37:02" (dd/mm/yyyy, hh:mm:ss).
function dateValue(value?: string): number {
  if (!value) return 0;
  const m = value.match(
    /(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (!m) {
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
  }
  const [, d, mo, y, hh = "0", mm = "0", ss = "0"] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(hh),
    Number(mm),
    Number(ss)
  ).getTime();
}

function toStatus(v: unknown): LoanStatus {
  const s = str(v).toLowerCase();
  if (s.startsWith("approv")) return "Approved";
  if (s.startsWith("declin") || s.startsWith("reject")) return "Declined";
  return "Pending";
}

// Records in dedicated collections define their status by the collection
// itself, regardless of any (possibly stale) status field on the document.
function statusForNode(node: string, raw: RawLoan): LoanStatus {
  const n = node.toLowerCase();
  if (n.includes("approved")) return "Approved";
  if (n.includes("declined")) return "Declined";
  return toStatus(raw.status);
}

function mapRecord(id: string, node: string, raw: RawLoan): PersonalLoan {
  const fullName = `${str(raw.first_name)} ${str(raw.last_name)}`.trim();
  return {
    id,
    node,
    fullName: fullName || str(raw.full_name) || str(raw.name) || "—",
    refNo: str(raw.ref_no),
    idNumber: str(raw.ID_number ?? raw.id_number),
    phoneNumber: str(raw.phone_number),
    email: str(raw.email),
    employmentStatus: str(raw.employment_status),
    blackListed: yes(raw.is_black_listed),
    inDebt: yes(raw.is_in_debt),
    grossIncome: num(raw.gross_income),
    loanAmount: num(raw.loan_amount),
    loanTerm: num(raw.terms),
    rate: num(raw.rate),
    monthlyRepayment: num(raw.monthly_repayment_amount),
    repaymentMethod: str(raw.repayment_method),
    status: statusForNode(node, raw),
    loanType: str(raw.loan_type),
    dateCreated: str(raw.date_created ?? raw.date),
  };
}

async function fetchNode(node: string): Promise<PersonalLoan[]> {
  const snap = await getDocs(collection(firestore, node));
  return snap.docs.map((d) => mapRecord(d.id, node, (d.data() as RawLoan) ?? {}));
}

export async function fetchLoans(nodes: readonly string[]): Promise<PersonalLoan[]> {
  const results = await Promise.all(
    nodes.map(async (node) => {
      try {
        return await fetchNode(node);
      } catch {
        // A missing collection just yields no rows.
        return [] as PersonalLoan[];
      }
    })
  );
  return results
    .flat()
    .sort((a, b) => dateValue(b.dateCreated) - dateValue(a.dateCreated));
}

// Firestore fields we run prefix searches against.
const SEARCH_FIELDS = [
  "ref_no",
  "email",
  "ID_number",
  "phone_number",
  "first_name",
  "last_name",
] as const;

// Firestore is case-sensitive; try a few casings of the term.
function termVariants(term: string): string[] {
  const t = term.trim();
  if (!t) return [];
  const capitalized = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  return Array.from(new Set([t, t.toLowerCase(), t.toUpperCase(), capitalized]));
}

// Prefix search across the given collections. Firestore can only match the
// START of a field (no substring search), so this matches values beginning
// with the search term.
export async function searchLoans(
  nodes: readonly string[],
  term: string,
  perQueryLimit = 20
): Promise<PersonalLoan[]> {
  const variants = termVariants(term);
  if (variants.length === 0) return [];

  const seen = new Map<string, PersonalLoan>();
  const tasks: Promise<void>[] = [];

  for (const node of nodes) {
    for (const field of SEARCH_FIELDS) {
      for (const v of variants) {
        tasks.push(
          (async () => {
            try {
              const qy = query(
                collection(firestore, node),
                orderBy(field),
                where(field, ">=", v),
                where(field, "<=", `${v}\uf8ff`),
                limit(perQueryLimit)
              );
              const snap = await getDocs(qy);
              snap.docs.forEach((d) => {
                const key = `${node}/${d.id}`;
                if (!seen.has(key)) {
                  seen.set(key, mapRecord(d.id, node, (d.data() as RawLoan) ?? {}));
                }
              });
            } catch {
              // Ignore fields that don't exist / missing indexes for this node.
            }
          })()
        );
      }
    }
  }

  await Promise.all(tasks);
  return Array.from(seen.values()).sort(
    (a, b) => dateValue(b.dateCreated) - dateValue(a.dateCreated)
  );
}

export async function updateLoanStatus(
  loan: PersonalLoan,
  status: LoanStatus
): Promise<void> {
  if (!loan.node || !loan.id) return;
  await updateDoc(doc(firestore, loan.node, loan.id), {
    status: status.toLowerCase(),
  });
}

export function useLoans(nodes: readonly string[] = []) {
  const [loans, setLoans] = useState<PersonalLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const safeNodes = nodes ?? [];
  const key = safeNodes.join("|");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLoans(await fetchLoans(safeNodes.length ? safeNodes : key.split("|")));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load loans");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { loans, loading, error, reload };
}
