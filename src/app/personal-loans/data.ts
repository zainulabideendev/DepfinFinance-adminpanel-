export type LoanStatus = "Pending" | "Approved" | "Declined";

export type PersonalLoan = {
  fullName: string;
  refNo: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  employmentStatus: string;
  blackListed: boolean;
  inDebt: boolean;
  grossIncome: number;
  loanAmount: number;
  loanTerm: number;
  rate: number;
  monthlyRepayment: number;
  repaymentMethod: string;
  status: LoanStatus;
  // Present when the record comes from Firebase (used to persist updates).
  id?: string;
  node?: string;
  loanType?: string;
  dateCreated?: string;
};

const firstNames = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph",
  "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Daniel", "Nancy", "Matthew",
  "Lisa", "Anthony", "Betty", "Mark", "Sandra", "Donald", "Ashley",
];

const lastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
];

const employmentStatuses = ["Employed", "Self-Employed", "Unemployed", "Contract"];
const repaymentMethods = ["Debit Order", "EFT", "Bank Transfer", "Cash"];
const statuses: LoanStatus[] = ["Pending", "Approved", "Declined"];

function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function generateLoans(
  count = 47,
  refPrefix = "PL",
  seed = 42
): PersonalLoan[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[Math.floor(rand() * firstNames.length)];
    const last = lastNames[Math.floor(rand() * lastNames.length)];
    const grossIncome = Math.round((15000 + rand() * 60000) / 100) * 100;
    const loanAmount = Math.round((20000 + rand() * 480000) / 1000) * 1000;
    const loanTerm = [12, 24, 36, 48, 60, 72][Math.floor(rand() * 6)];
    const rate = Math.round((8 + rand() * 20) * 10) / 10;
    const monthlyRepayment = Math.round(
      (loanAmount * (1 + rate / 100)) / loanTerm
    );

    return {
      fullName: `${first} ${last}`,
      refNo: `${refPrefix}-${(1000 + i).toString()}`,
      idNumber: `${8000000000000 + Math.floor(rand() * 1999999999999)}`,
      phoneNumber: `+27 ${Math.floor(600000000 + rand() * 399999999)}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      employmentStatus:
        employmentStatuses[Math.floor(rand() * employmentStatuses.length)],
      blackListed: rand() > 0.8,
      inDebt: rand() > 0.6,
      grossIncome,
      loanAmount,
      loanTerm,
      rate,
      monthlyRepayment,
      repaymentMethod:
        repaymentMethods[Math.floor(rand() * repaymentMethods.length)],
      status: statuses[Math.floor(rand() * statuses.length)],
    };
  });
}

export const personalLoans = generateLoans();
