import LoansView from "../components/LoansView";
import { LOAN_NODES } from "@/lib/loan-nodes";

export default function Page() {
  return (
    <LoansView title="Declined Loans" nodes={LOAN_NODES.declined} showActions={false} />
  );
}
