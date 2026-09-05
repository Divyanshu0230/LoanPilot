import { describe, expect, it } from "vitest";
import { checkQuote, firstYearCost, marketBoard, papersToCarry, refinanceHint, tomorrowPlan, waitVsBorrow } from "./coach";
import { parseInrInput, yearOneSplit } from "./money";
import { runPersona } from "./personas";

describe("plain money typing", () => {
  it("reads 8L and 40k", () => {
    expect(parseInrInput("8L")).toBe(800_000);
    expect(parseInrInput("1.5Cr")).toBe(15_000_000);
    expect(parseInrInput("40k")).toBe(40_000);
  });
});

describe("coach helpers", () => {
  it("flags a 14% quote as high for Priya", () => {
    const { assessment } = runPersona("priya");
    const r = checkQuote(14, assessment);
    expect(r.tone).toBe("bad");
  });

  it("gives Anita a do-not-sign first step", () => {
    const { persona, assessment } = runPersona("anita");
    const steps = tomorrowPlan(persona.answers, assessment);
    expect(steps[0].toLowerCase()).toMatch(/do not sign/);
    expect(refinanceHint(persona.answers)?.title).toMatch(/expensive/i);
  });

  it("tells Ravi to carry shop papers", () => {
    const { assessment, persona } = runPersona("ravi");
    const papers = papersToCarry(assessment.product, persona.answers);
    expect(papers.join(" ")).toMatch(/Property papers|shop/i);
  });

  it("lets Priya shrink the ticket by waiting", () => {
    const { persona, assessment } = runPersona("priya");
    const wait = waitVsBorrow(persona.answers, assessment);
    expect(wait.monthlySave).toBeGreaterThan(0);
    expect(wait.rows[1].newTake).toBeLessThan(assessment.recommendedAmount);
  });

  it("splits year one into interest and principal", () => {
    const { assessment } = runPersona("priya");
    const y = firstYearCost(assessment);
    expect(y).not.toBeNull();
    expect(y!.interest + y!.principalPaid).toBeGreaterThan(assessment.recommendedAmount * 0.1);
    const raw = yearOneSplit(600_000, 12, 36);
    expect(raw.interest + raw.principalPaid).toBeGreaterThan(0);
    expect(raw.leftoverBalance).toBeLessThan(600_000);
  });

  it("lists a gold and personal band on the market board", () => {
    const ids = marketBoard().map((r) => r.id);
    expect(ids).toContain("personal");
    expect(ids).toContain("gold");
  });
});
