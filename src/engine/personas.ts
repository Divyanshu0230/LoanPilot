import { assess } from "./assess";
import { isAnswered, visibleQuestions } from "./questions";
import { emptyAnswers, type Answers, type Assessment } from "./types";

export interface Persona {
  id: "priya" | "ravi" | "anita";
  name: string;
  city: string;
  tag: string;
  blurb: string;
  ask: string;
  answers: Answers;
}

export const PERSONAS: Persona[] = [
  {
    id: "priya",
    name: "Priya",
    city: "Bengaluru",
    tag: "Salaried · MNC",
    blurb: "29, software, five years at a large MNC. Net ₹1,10,000. Car EMI ₹14,000. Rent ₹28,000. Score 780.",
    ask: "Wants ₹8,00,000 personal loan for a wedding.",
    answers: {
      ...emptyAnswers(),
      purpose: "wedding",
      amountWanted: 800_000,
      preferredProduct: "personal",
      incomeType: "salaried",
      monthlyIncome: 110_000,
      existingEmis: 14_000,
      monthlyExpenses: 50_000,
      age: 29,
      creditBand: "exact",
      creditScore: 780,
      employerType: "mnc",
      employmentYears: 5,
      variableIncomeShare: 0.1,
      dependents: 0,
      pastBounces: 0,
      collateralType: "none",
      collateralValue: 0,
      coApplicantIncome: 0,
      upcomingExpense: 0,
      productiveMonthlyEarn: 0,
      cardUtilisation: 0.3,
    },
  },
  {
    id: "ravi",
    name: "Ravi",
    city: "Mysuru",
    tag: "Self-employed · kirana",
    blurb: "42, kirana 14 years. Cash ₹40–80k, ITR ₹4.2L. Shop ₹45L unencumbered. No score. Wife earns ₹18,000.",
    ask: "Wants ₹15,00,000 for a second stock line and a delivery vehicle.",
    answers: {
      ...emptyAnswers(),
      purpose: "business",
      amountWanted: 1_500_000,
      preferredProduct: "personal",
      incomeType: "self_employed",
      monthlyIncome: 60_000,
      existingEmis: 0,
      monthlyExpenses: 28_000,
      age: 42,
      creditBand: "unknown",
      creditScore: null,
      businessVintageYears: 14,
      documentedAnnualIncome: 420_000,
      cashMonthlyLow: 40_000,
      cashMonthlyHigh: 80_000,
      dependents: 1,
      pastBounces: 0,
      emergencyMonths: 4,
      collateralType: "shop",
      collateralValue: 4_500_000,
      coApplicantIncome: 18_000,
      upcomingExpense: 0,
      productiveMonthlyEarn: 10_000,
    },
  },
  {
    id: "anita",
    name: "Anita",
    city: "Hubballi",
    tag: "Informal · mixed cash",
    blurb: "35, delivery rider plus tailoring. ₹26–30k. Two children. Husband unemployed 8 months. Three app loans, ₹35k at 30%+, one bounce last month.",
    ask: "Wants ₹1,50,000 for an electric scooter to double delivery runs.",
    answers: {
      ...emptyAnswers(),
      purpose: "vehicle",
      amountWanted: 150_000,
      preferredProduct: "two_wheeler",
      incomeType: "informal",
      monthlyIncome: 28_000,
      existingEmis: 5_500,
      monthlyExpenses: 24_000,
      age: 35,
      creditBand: "unknown",
      creditScore: null,
      cashMonthlyLow: 26_000,
      cashMonthlyHigh: 30_000,
      dependents: 2,
      pastBounces: 1,
      emergencyMonths: 0,
      collateralType: "none",
      collateralValue: 0,
      coApplicantIncome: 0,
      upcomingExpense: 0,
      productiveMonthlyEarn: 8_000,
      existingLoanRate: 32,
    },
  },
];

export function personaById(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function runPersona(id: Persona["id"]): {
  persona: Persona;
  asked: string[];
  assessment: Assessment;
} {
  const persona = personaById(id);
  if (!persona) throw new Error(`Unknown persona ${id}`);
  const asked = visibleQuestions(persona.answers)
    .filter((q) => isAnswered(q.id, persona.answers))
    .map((q) => q.prompt);
  return { persona, asked, assessment: assess(persona.answers) };
}
