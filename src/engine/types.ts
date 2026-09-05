export type IncomeType = "salaried" | "self_employed" | "informal";

export type LoanPurpose =
  | "wedding"
  | "education"
  | "medical"
  | "home"
  | "renovation"
  | "vehicle"
  | "business"
  | "refinance"
  | "consumption"
  | "other";

export type ProductType =
  | "personal"
  | "home"
  | "lap"
  | "gold"
  | "two_wheeler"
  | "business";

export type Verdict = "borrow" | "borrow_less" | "dont_borrow";

export type EmployerType = "mnc" | "govt" | "listed" | "pvt" | "other";

export type CollateralType =
  | "none"
  | "residential"
  | "shop"
  | "commercial"
  | "gold"
  | "vehicle";

export type CityTier = 1 | 2 | 3;

export type CreditBand =
  | "unknown"
  | "below_650"
  | "650_699"
  | "700_749"
  | "750_799"
  | "800_plus"
  | "exact";

export type QuestionId =
  | "purpose"
  | "amountWanted"
  | "preferredProduct"
  | "incomeType"
  | "monthlyIncome"
  | "existingEmis"
  | "monthlyExpenses"
  | "age"
  | "credit"
  | "employerType"
  | "employmentYears"
  | "variableIncomeShare"
  | "businessVintageYears"
  | "documentedAnnualIncome"
  | "cashRange"
  | "dependents"
  | "pastBounces"
  | "emergencyMonths"
  | "collateral"
  | "coApplicantIncome"
  | "upcomingExpense"
  | "productiveMonthlyEarn"
  | "cardUtilisation"
  | "existingOfferRate"
  | "existingLoanRate";

export type OutputKey =
  | "verdict"
  | "lenderAmount"
  | "safeAmount"
  | "rate"
  | "emi"
  | "product"
  | "confidence";

export interface Answers {
  purpose: LoanPurpose | null;
  amountWanted: number | null;
  preferredProduct: ProductType | "recommend" | null;
  incomeType: IncomeType | null;
  monthlyIncome: number | null;
  existingEmis: number | null;
  monthlyExpenses: number | null;
  age: number | null;
  creditBand: CreditBand | null;
  creditScore: number | null;

  employerType: EmployerType | null;
  employmentYears: number | null;
  variableIncomeShare: number | null;
  businessVintageYears: number | null;
  documentedAnnualIncome: number | null;
  cashMonthlyLow: number | null;
  cashMonthlyHigh: number | null;
  dependents: number | null;
  pastBounces: number | null;
  emergencyMonths: number | null;
  collateralType: CollateralType | null;
  collateralValue: number | null;
  coApplicantIncome: number | null;
  upcomingExpense: number | null;
  productiveMonthlyEarn: number | null;
  cardUtilisation: number | null;
  existingOfferRate: number | null;
  existingLoanRate: number | null;
}

export interface Range {
  low: number;
  high: number;
}

export interface Assessment {
  verdict: Verdict;
  verdictReason: string;
  product: ProductType;
  productReason: string;
  lenderAmount: Range;
  lenderWhy: string;
  safeAmount: Range;
  safeWhy: string;
  useNumber: "safe" | "lender";
  useNumberWhy: string;
  headlineRate: Range;
  apr: Range;
  processingFeePct: number;
  agreeToRate: number;
  rateWhy: string;
  emiCeiling: number;
  emiWhy: string;
  recommendedAmount: number;
  recommendedTenureMonths: number;
  tenureOptions: TenureOption[];
  stress: StressCase;
  confidence: number;
  confidenceLabel: "low" | "medium" | "high";
  confidenceWhy: string;
  unansweredCost: string[];
  assumptions: string[];
  card: NegotiationCard;
  traces: TraceLine[];
}

export interface TenureOption {
  months: number;
  emiForRecommended: number;
  emiForWanted: number;
  totalInterestRecommended: number;
}

export interface StressCase {
  title: string;
  detail: string;
  stressedEmi: number;
  stressedFoirPct: number;
  stillFits: boolean;
}

export interface NegotiationCard {
  headline: string;
  profileLine: string;
  askAmount: number;
  walkAwayAmount: number;
  walkAwayEmi: number;
  walkAwayRate: number;
  fairRate: Range;
  fairApr: Range;
  productInsist: string;
  productRefuse: string;
  because: string;
  compareLine: string;
  stressLine: string;
}

export interface TraceLine {
  output: OutputKey;
  sentence: string;
}

export interface RuleRow {
  id: string;
  what: string;
  value: string;
  why: string;
  source: string;
}

export const emptyAnswers = (): Answers => ({
  purpose: null,
  amountWanted: null,
  preferredProduct: null,
  incomeType: null,
  monthlyIncome: null,
  existingEmis: null,
  monthlyExpenses: null,
  age: null,
  creditBand: null,
  creditScore: null,
  employerType: null,
  employmentYears: null,
  variableIncomeShare: null,
  businessVintageYears: null,
  documentedAnnualIncome: null,
  cashMonthlyLow: null,
  cashMonthlyHigh: null,
  dependents: null,
  pastBounces: null,
  emergencyMonths: null,
  collateralType: null,
  collateralValue: null,
  coApplicantIncome: null,
  upcomingExpense: null,
  productiveMonthlyEarn: null,
  cardUtilisation: null,
  existingOfferRate: null,
  existingLoanRate: null,
});
