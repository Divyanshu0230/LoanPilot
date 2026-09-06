import { describe, expect, it } from "vitest";
import { assess, canAssess, resolvedScore, routeProduct } from "./assess";
import { PERSONAS, runPersona } from "./personas";
import { defaultKnobs } from "./rules";
import { QUESTIONS, isAnswered, visibleQuestions } from "./questions";
import { emptyAnswers } from "./types";

describe("unknown score is never 300", () => {
  it("treats I-don't-know as null, not a stain", () => {
    const a = { ...PERSONAS[1].answers, creditBand: "unknown" as const, creditScore: null };
    expect(resolvedScore(a)).toBeNull();
    const result = assess(a);
    expect(result.headlineRate.low).toBeLessThan(16);
    expect(result.rateWhy.toLowerCase()).toMatch(/not a 300|unknown|shop/);
  });
});

describe("three borrowers", () => {
  it("Priya: lender and safe numbers differ, borrow less on a wedding", () => {
    const { assessment } = runPersona("priya");
    expect(assessment.verdict).toBe("borrow_less");
    expect(assessment.product).toBe("personal");
    expect(assessment.lenderAmount.high).toBeGreaterThan(assessment.safeAmount.high);
    expect(assessment.useNumber).toBe("safe");
    expect(assessment.apr.low).toBeGreaterThan(assessment.headlineRate.low);
    expect(assessment.recommendedAmount).toBeLessThan(800_000);
    expect(assessment.recommendedAmount).toBeGreaterThan(300_000);
  });

  it("Ravi: routed to LAP / secured, not unsecured PL, and can borrow", () => {
    const { assessment } = runPersona("ravi");
    expect(assessment.product).toBe("lap");
    expect(assessment.verdict).toMatch(/borrow/);
    expect(assessment.lenderAmount.high).toBeGreaterThanOrEqual(1_000_000);
    expect(assessment.headlineRate.high).toBeLessThan(16);
    expect(assessment.card.productRefuse.toLowerCase()).toMatch(/personal|unsecured/);
    expect(assessment.recommendedAmount).toBeLessThan(assessment.safeAmount.high);
    expect(assessment.recommendedAmount).toBeGreaterThanOrEqual(1_100_000);
    expect(assessment.recommendedAmount).toBeLessThanOrEqual(1_400_000);
    expect(assessment.stress.stillFits).toBe(true);
  });

  it("Anita: Don't borrow fires", () => {
    const { assessment } = runPersona("anita");
    expect(assessment.verdict).toBe("dont_borrow");
    expect(assessment.recommendedAmount).toBe(0);
    expect(assessment.emiCeiling).toBeLessThanOrEqual(4000);
  });
});

describe("adaptive questions", () => {
  it("does not show ITR to a salaried borrower", () => {
    const ids = visibleQuestions(PERSONAS[0].answers).map((q) => q.id);
    expect(ids).not.toContain("documentedAnnualIncome");
    expect(ids).not.toContain("businessVintageYears");
    expect(ids).toContain("employerType");
  });

  it("does not show MNC employer to a kirana owner", () => {
    const ids = visibleQuestions(PERSONAS[1].answers).map((q) => q.id);
    expect(ids).not.toContain("employerType");
    expect(ids).toContain("documentedAnnualIncome");
    expect(ids).toContain("collateral");
  });
});

describe("every additional question moves a number", () => {
  it("each additional question changes at least one output vs leaving it blank", () => {
    const base = emptyAnswers();
    base.purpose = "business";
    base.amountWanted = 800_000;
    base.preferredProduct = "personal";
    base.incomeType = "self_employed";
    base.monthlyIncome = 50_000;
    base.existingEmis = 0;
    base.monthlyExpenses = 22_000;
    base.age = 40;
    base.creditBand = "unknown";

    const fingerprint = (a: ReturnType<typeof assess>) =>
      [
        a.verdict,
        a.product,
        a.lenderAmount.low,
        a.lenderAmount.high,
        a.safeAmount.low,
        a.safeAmount.high,
        a.headlineRate.low,
        a.headlineRate.high,
        a.agreeToRate,
        a.emiCeiling,
        a.apr.high,
      ].join("|");

    const filled: Record<string, typeof base> = {
      employerType: { ...base, incomeType: "salaried", employerType: "mnc" },
      employmentYears: { ...base, incomeType: "salaried", employmentYears: 6 },
      variableIncomeShare: { ...base, incomeType: "salaried", variableIncomeShare: 0.4 },
      businessVintageYears: { ...base, businessVintageYears: 14 },
      documentedAnnualIncome: { ...base, documentedAnnualIncome: 420_000 },
      cashRange: { ...base, cashMonthlyLow: 30_000, cashMonthlyHigh: 80_000 },
      dependents: { ...base, dependents: 3 },
      pastBounces: { ...base, pastBounces: 1 },
      emergencyMonths: { ...base, emergencyMonths: 0 },
      collateral: { ...base, collateralType: "shop", collateralValue: 4_500_000 },
      coApplicantIncome: { ...base, coApplicantIncome: 20_000 },
      upcomingExpense: { ...base, upcomingExpense: 240_000 },
      productiveMonthlyEarn: { ...base, purpose: "business", productiveMonthlyEarn: 15_000 },
      cardUtilisation: { ...base, incomeType: "salaried", cardUtilisation: 0.85 },
      existingLoanRate: { ...base, existingEmis: 8_000, existingLoanRate: 32, pastBounces: 1 },
      existingOfferRate: { ...base, existingOfferRate: 17 },
    };

    const additional = QUESTIONS.filter((q) => q.tier === "additional");
    for (const q of additional) {
      const withQ = filled[q.id];
      expect(withQ, q.id).toBeTruthy();
      const before = assess(base);
      const after = assess(withQ);
      expect(fingerprint(after), q.id).not.toEqual(fingerprint(before));
    }
  });
});

describe("must-only still works with wide bands", () => {
  it("can assess on the nine must answers", () => {
    const a = emptyAnswers();
    a.purpose = "wedding";
    a.amountWanted = 800_000;
    a.preferredProduct = "personal";
    a.incomeType = "salaried";
    a.monthlyIncome = 110_000;
    a.existingEmis = 14_000;
    a.monthlyExpenses = 50_000;
    a.age = 29;
    a.creditBand = "unknown";
    expect(canAssess(a)).toBe(true);
    const mustOnly = assess(a);
    const full = assess(PERSONAS[0].answers);
    expect(mustOnly.headlineRate.high - mustOnly.headlineRate.low).toBeGreaterThanOrEqual(
      full.headlineRate.high - full.headlineRate.low - 0.2,
    );
    expect(mustOnly.confidence).toBeLessThan(full.confidence);
  });
});

describe("studio knobs move numbers", () => {
  it("tighter salaried self-cap lowers Priya’s safe amount", () => {
    const { assessment: base } = runPersona("priya");
    const tight = assess(PERSONAS[0].answers, {
      ...defaultKnobs(),
      foirSafePersonal: 0.28,
      consumptionHaircut: 0.55,
    });
    expect(tight.safeAmount.high).toBeLessThan(base.safeAmount.high);
  });
});

describe("Ravi preferred PL still becomes LAP", () => {
  it("reroutes on shop collateral", () => {
    expect(routeProduct(PERSONAS[1].answers).product).toBe("lap");
  });
});

describe("answered helper", () => {
  it("marks credit unknown as answered", () => {
    const a = emptyAnswers();
    a.creditBand = "unknown";
    expect(isAnswered("credit", a)).toBe(true);
  });
});
