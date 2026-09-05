import type { Answers, CollateralType, CreditBand, QuestionId } from "@/engine";

export function applyAnswer(
  answers: Answers,
  id: QuestionId,
  value: unknown,
): Answers {
  const next = { ...answers };
  switch (id) {
    case "purpose":
      next.purpose = value as Answers["purpose"];
      break;
    case "amountWanted":
      next.amountWanted = num(value);
      break;
    case "preferredProduct":
      next.preferredProduct = value as Answers["preferredProduct"];
      break;
    case "incomeType":
      next.incomeType = value as Answers["incomeType"];
      break;
    case "monthlyIncome":
      next.monthlyIncome = num(value);
      break;
    case "existingEmis":
      next.existingEmis = num(value);
      break;
    case "monthlyExpenses":
      next.monthlyExpenses = num(value);
      break;
    case "age":
      next.age = num(value);
      break;
    case "credit": {
      const v = value as { band: CreditBand; score?: number };
      next.creditBand = v.band;
      next.creditScore = v.band === "exact" ? (v.score ?? null) : null;
      break;
    }
    case "employerType":
      next.employerType = value as Answers["employerType"];
      break;
    case "employmentYears":
      next.employmentYears = num(value);
      break;
    case "variableIncomeShare":
      next.variableIncomeShare = num(value) / 100;
      break;
    case "businessVintageYears":
      next.businessVintageYears = num(value);
      break;
    case "documentedAnnualIncome":
      next.documentedAnnualIncome = num(value);
      break;
    case "cashRange": {
      const v = value as { low: number; high: number };
      next.cashMonthlyLow = v.low;
      next.cashMonthlyHigh = v.high;
      break;
    }
    case "dependents":
      next.dependents = num(value);
      break;
    case "pastBounces":
      next.pastBounces = num(value);
      break;
    case "emergencyMonths":
      next.emergencyMonths = num(value);
      break;
    case "collateral": {
      const v = value as { type: CollateralType; value: number };
      next.collateralType = v.type;
      next.collateralValue = v.type === "none" ? 0 : v.value;
      break;
    }
    case "coApplicantIncome":
      next.coApplicantIncome = num(value);
      break;
    case "upcomingExpense":
      next.upcomingExpense = num(value);
      break;
    case "productiveMonthlyEarn":
      next.productiveMonthlyEarn = num(value);
      break;
    case "cardUtilisation":
      next.cardUtilisation = num(value) / 100;
      break;
    case "existingOfferRate":
      next.existingOfferRate = num(value);
      break;
    case "existingLoanRate":
      next.existingLoanRate = num(value);
      break;
  }
  return next;
}

function num(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace(/,/g, ""));
  return 0;
}
