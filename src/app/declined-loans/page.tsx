import LoansTable from "../personal-loans/LoansTable";
import { generateLoans } from "../personal-loans/data";

const loans = generateLoans(47, "DL", 606).map((loan) => ({
  ...loan,
  status: "Declined" as const,
}));

export default function Page() {
  return (
    <div className="min-h-screen">
      <section className="flex items-center justify-between bg-slate-800 px-8 py-6">
        <h1 className="text-sm font-semibold uppercase tracking-widest text-white">
          Declined Loans
        </h1>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-xs font-bold text-white">
          <span>DF</span>
        </div>
      </section>

      <section className="px-8 py-8">
        <LoansTable loans={loans} showActions={false} />
      </section>
    </div>
  );
}
