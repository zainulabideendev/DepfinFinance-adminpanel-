import LoansView from "../components/LoansView";
import { LOAN_NODES } from "@/lib/loan-nodes";

export default function Page() {
  return (
    <LoansView title="Approved Loans" nodes={LOAN_NODES.approved} showActions={false} />
  );
}
