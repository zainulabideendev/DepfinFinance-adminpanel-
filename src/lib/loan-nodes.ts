// Firestore collection names (exactly as stored in Firebase).
export const LOAN_NODES = {
  personal: ["Personal loan"],
  business: ["Business loan"],
  consolidate: ["Consolidation loan"],
  general: ["General loan"],
  mortage: ["Mortage loan", "Mortgage loan"],
  approved: ["Approved loans"],
  declined: ["Declined loans"],
} as const;

export const DASHBOARD_NODES = [
  "Personal loan",
  "Business loan",
  "Consolidation loan",
  "General loan",
  "Mortage loan",
  "Mortgage loan",
  "Approved loans",
  "Declined loans",
] as const;
