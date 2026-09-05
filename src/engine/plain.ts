import type { ProductType, Verdict } from "./types";

export const TERMS: Record<string, { short: string; simple: string }> = {
  EMI: {
    short: "EMI",
    simple: "The fixed amount you pay the bank every month.",
  },
  APR: {
    short: "real yearly cost",
    simple: "The true yearly cost after adding processing fee and GST. A 12% poster rate is often 14% in real life.",
  },
  FOIR: {
    short: "EMI share of income",
    simple: "How much of your monthly pay already goes to EMIs. Banks like to keep this under about half. We keep yours tighter.",
  },
  CIBIL: {
    short: "credit score",
    simple: "A 3-digit number (usually 300–900) from your loan history. If you do not know it, say so — we will not treat you as 300.",
  },
  LAP: {
    short: "loan on your property",
    simple: "A loan where you pledge your shop or house. Usually cheaper than a personal loan.",
  },
  ITR: {
    short: "tax return",
    simple: "The yearly income you declared to the tax department. Banks trust this more than cash in the till.",
  },
  LTV: {
    short: "how much against the asset",
    simple: "How much of the shop or gold’s value the bank will lend. A ₹45 lakh shop is not a ₹45 lakh loan.",
  },
};

export function productSimple(product: ProductType): string {
  return {
    personal: "personal loan",
    home: "home loan",
    lap: "loan on your shop or house",
    gold: "gold loan",
    two_wheeler: "two-wheeler loan",
    business: "business loan (no property pledged)",
  }[product];
}

export function verdictSimple(verdict: Verdict): { en: string; hi: string } {
  return {
    borrow: { en: "Yes, you can borrow", hi: "Haan, loan le sakte ho" },
    borrow_less: { en: "Take less than you asked", hi: "Jo manga hai usse kam lo" },
    dont_borrow: { en: "Do not take this loan now", hi: "Abhi yeh loan mat lo" },
  }[verdict];
}
