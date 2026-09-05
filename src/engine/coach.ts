import { emi, formatInr, formatPct, midpoint, roundEmi, roundTo, totalInterest, yearOneSplit } from "./money";
import { isAnswered, visibleQuestions } from "./questions";
import {
  RATE_GOLD,
  RATE_HOME,
  RATE_LAP,
  RATE_PERSONAL,
  RATE_TWO_WHEELER,
} from "./rules";
import { productSimple } from "./plain";
import type { Answers, Assessment, ProductType } from "./types";

export function moneyPicture(answers: Answers, assessment: Assessment) {
  const income = answers.monthlyIncome ?? 0;
  const emis = answers.existingEmis ?? 0;
  const spend = answers.monthlyExpenses ?? 0;
  const newEmi =
    assessment.recommendedAmount > 0
      ? emi(
          assessment.recommendedAmount,
          midpoint(assessment.headlineRate.low, assessment.headlineRate.high),
          assessment.recommendedTenureMonths,
        )
      : 0;
  const leftover = income - emis - spend - newEmi;
  return {
    income,
    emis,
    spend,
    newEmi: roundEmi(newEmi),
    leftover,
    slices: [
      { id: "emis", label: "Old EMIs", amount: emis },
      { id: "spend", label: "House + living", amount: spend },
      { id: "new", label: "This new EMI", amount: Math.max(0, newEmi) },
      { id: "left", label: "Left for you", amount: Math.max(0, leftover) },
    ],
  };
}

export function whatIfEmi(
  amount: number,
  annualPct: number,
  months: number,
  ceiling: number,
) {
  const monthly = emi(amount, annualPct, months);
  return {
    monthly: roundEmi(monthly),
    over: ceiling > 0 && monthly > ceiling + 250,
    years: months / 12,
  };
}

export function checkQuote(quotedRate: number, assessment: Assessment) {
  const fairHigh = assessment.headlineRate.high;
  const fairLow = assessment.headlineRate.low;
  const aprHigh = assessment.apr.high;
  if (quotedRate < fairLow) {
    return {
      tone: "good" as const,
      title: "This quote looks cheaper than our band",
      body: `They said ${formatPct(quotedRate)}. Fair for your file is ${formatPct(fairLow)}–${formatPct(fairHigh)}. Still ask for the real yearly cost after fee — that should stay under ${formatPct(aprHigh)}.`,
    };
  }
  if (quotedRate <= fairHigh) {
    return {
      tone: "ok" as const,
      title: "This quote is inside the fair band",
      body: `${formatPct(quotedRate)} sits in ${formatPct(fairLow)}–${formatPct(fairHigh)}. Agree only if the EMI stays under ${formatInr(assessment.emiCeiling)} and they show the fee in writing.`,
    };
  }
  return {
    tone: "bad" as const,
    title: "This quote is above fair — walk away or push back",
    body: `They said ${formatPct(quotedRate)}. Fair is ${formatPct(fairLow)}–${formatPct(fairHigh)}. The extra points are theirs, not the market. Show them the card.`,
  };
}

export function tomorrowPlan(answers: Answers, a: Assessment): string[] {
  const steps: string[] = [];
  if (a.verdict === "dont_borrow") {
    steps.push("Do not sign any new loan form today — including a scooter or app loan.");
    if ((answers.existingLoanRate ?? 0) >= 24) {
      steps.push(
        `First job: close or replace the ${formatPct(answers.existingLoanRate ?? 0)} loan. A gold loan is usually cheaper than another app loan.`,
      );
    }
    if ((answers.pastBounces ?? 0) >= 1) {
      steps.push("Wait until 6 months have passed with no bounce before you apply again.");
    }
    steps.push("If you have gold at home, ask a gold-loan desk only to clear the costly loans — not for a new purchase.");
    return steps;
  }
  steps.push(
    `Walk in asking for ${formatInr(a.recommendedAmount)}, not ${formatInr(answers.amountWanted ?? 0)}.`,
  );
  steps.push(
    `Say you will not pay more than ${formatInr(a.emiCeiling)} a month, and not more than ${formatPct(a.agreeToRate)}.`,
  );
  steps.push(`Ask for a ${productSimple(a.product)} — not a costlier product they find easier to sell.`);
  if (a.product === "lap") {
    steps.push("Carry shop papers. Do not let them open a personal-loan form instead.");
  }
  if (a.verdict === "borrow_less") {
    steps.push("If they offer more than your safe number, smile and say no. Extra sanction is their target, not your need.");
  }
  steps.push("Before you sign, make them write the fee and the real yearly cost — not only the poster rate.");
  return steps;
}

export function papersToCarry(product: ProductType, answers: Answers): string[] {
  const common = [
    "Aadhaar and PAN",
    "Last 6 months bank statement (the account salary or till money comes into)",
    "A cancelled cheque or passbook first page",
  ];
  const extra: Record<ProductType, string[]> = {
    personal: ["Last 3 months payslips", "Form 16 or latest ITR if you have it"],
    home: ["Sale agreement / allotment letter", "Own-contribution proof"],
    lap: [
      "Property papers of the shop or house",
      "Latest property tax / electricity bill on that address",
      "ITR of last 2 years if you have it",
    ],
    gold: ["The jewellery you will pledge (do not buy new gold for this)", "ID matching the name on the packet"],
    two_wheeler: ["Quotation of the scooter / bike", "Driving licence if you have one"],
    business: ["GST returns if registered", "ITR of last 2 years", "A simple note of what the money will buy"],
  };
  if (answers.incomeType === "self_employed") {
    extra.lap.push("Shop photos and a one-page stock list help");
  }
  return [...common, ...extra[product]];
}

export function refinanceHint(answers: Answers): {
  title: string;
  body: string;
} | null {
  const rate = answers.existingLoanRate;
  const emis = answers.existingEmis ?? 0;
  if (rate == null || rate < 24 || emis <= 0) return null;
  const waste = Math.round(emis * (rate - 14) / rate);
  return {
    title: "Your current loan is the expensive one",
    body: `You are already paying about ${formatPct(rate)}. If even ₹${emis.toLocaleString("en-IN")} of EMI is at that rate, moving it to a gold loan or a bank loan near 12–14% can free roughly ${formatInr(Math.max(500, waste))} a month — often more useful than a new scooter loan.`,
  };
}

export function cardShareText(name: string | undefined, a: Assessment): string {
  const n = name ? `${name} · ` : "";
  return [
    `Loan talk card — ${n}${a.card.profileLine}`,
    a.card.headline,
    `I will ask for ${formatInr(a.card.askAmount)}`,
    `I will not take more than ${formatInr(a.card.walkAwayAmount)}`,
    `I will not agree EMI above ${formatInr(a.card.walkAwayEmi)} / month`,
    `Fair rate ${formatPct(a.card.fairRate.low)}–${formatPct(a.card.fairRate.high)}`,
    `Real yearly cost (fee included) ${formatPct(a.card.fairApr.low)}–${formatPct(a.card.fairApr.high)}`,
    `Walk away above ${formatPct(a.card.walkAwayRate)}`,
    `Need: ${a.card.productInsist}`,
    `Refuse: ${a.card.productRefuse}`,
    a.card.because,
  ].join("\n");
}

export function familyLine(a: Assessment): { en: string; hi: string } {
  if (a.verdict === "dont_borrow") {
    return {
      en: "Tell the family: we are not signing a new loan this month. First we clean the costly one.",
      hi: "Ghar walon se kehna: is mahine naya loan nahi. Pehle mehnga wala utarna hai.",
    };
  }
  if (a.verdict === "borrow_less") {
    return {
      en: `Tell the family: we can take about ${formatInr(a.recommendedAmount)}, not the full ask. Monthly stay under ${formatInr(a.emiCeiling)}.`,
      hi: `Ghar walon se: ${formatInr(a.recommendedAmount)} tak theek hai, poora nahi. EMI ${formatInr(a.emiCeiling)} se upar nahi.`,
    };
  }
  return {
    en: `Tell the family: this loan fits if we stay at ${formatInr(a.recommendedAmount)} and EMI ${formatInr(a.emiCeiling)}.`,
    hi: `Ghar walon se: ${formatInr(a.recommendedAmount)} aur EMI ${formatInr(a.emiCeiling)} par yeh loan chalega.`,
  };
}

export function tillVsPaper(answers: Answers): {
  till: number;
  paper: number;
  gap: number;
} | null {
  if (answers.incomeType !== "self_employed") return null;
  const paper = answers.documentedAnnualIncome ? answers.documentedAnnualIncome / 12 : 0;
  const till = answers.cashMonthlyLow ?? answers.monthlyIncome ?? 0;
  if (till <= 0 && paper <= 0) return null;
  return { till, paper, gap: till - paper };
}

export function marketBoard(): {
  id: string;
  name: string;
  low: number;
  high: number;
  tip: string;
}[] {
  return [
    {
      id: "personal",
      name: "Personal loan",
      low: RATE_PERSONAL.super[0],
      high: RATE_PERSONAL.good[1],
      tip: "Unsecured. Price moves with your score and job.",
    },
    {
      id: "lap",
      name: "Shop / house loan",
      low: RATE_LAP.super[0],
      high: RATE_LAP.unknown[1],
      tip: "You pledge the property. Usually cheaper than a personal loan.",
    },
    {
      id: "gold",
      name: "Gold loan",
      low: RATE_GOLD.any[0],
      high: RATE_GOLD.any[1],
      tip: "Fastest desk. Useful to clear costly app loans.",
    },
    {
      id: "home",
      name: "Home loan",
      low: RATE_HOME.super[0],
      high: RATE_HOME.fair[1],
      tip: "Buying a house — not a wedding or a scooter.",
    },
    {
      id: "two_wheeler",
      name: "Two-wheeler",
      low: RATE_TWO_WHEELER.prime[0],
      high: RATE_TWO_WHEELER.informal[1],
      tip: "Scooter or bike. Informal income sits at the top of the band.",
    },
  ];
}

export function fileReadiness(answers: Answers): {
  score: number;
  filled: number;
  total: number;
  label: string;
} {
  const vis = visibleQuestions(answers);
  const filled = vis.filter((q) => isAnswered(q.id, answers)).length;
  const score = vis.length ? Math.round((filled / vis.length) * 100) : 0;
  const label =
    score >= 80 ? "Ready for the branch" : score >= 50 ? "Almost ready" : "Still filling";
  return { score, filled, total: vis.length, label };
}

export function waitVsBorrow(answers: Answers, a: Assessment) {
  const income = answers.monthlyIncome ?? 0;
  const emis = answers.existingEmis ?? 0;
  const spend = answers.monthlyExpenses ?? 0;
  const room = Math.max(0, income - emis - spend);
  const monthlySave = room > 2_000 ? roundTo(room * 0.35, 500) : 0;
  const rate = midpoint(a.headlineRate.low, a.headlineRate.high);
  const take = a.recommendedAmount;
  const wanted = answers.amountWanted ?? 0;

  return {
    monthlySave,
    room,
    rows: ([3, 6] as const).map((months) => {
      const saved = monthlySave * months;
      if (a.verdict === "dont_borrow") {
        return {
          months,
          saved,
          newTake: 0,
          newAsk: Math.max(0, wanted - saved),
          interestSaved: 0,
        };
      }
      const newTake = Math.max(0, take - saved);
      const interestNow = take > 0 ? totalInterest(take, rate, a.recommendedTenureMonths) : 0;
      const interestLater =
        newTake > 0 ? totalInterest(newTake, rate, a.recommendedTenureMonths) : 0;
      return {
        months,
        saved,
        newTake,
        newAsk: Math.max(0, wanted - saved),
        interestSaved: Math.max(0, interestNow - interestLater),
      };
    }),
  };
}

export function firstYearCost(a: Assessment) {
  if (a.recommendedAmount <= 0) return null;
  const rate = midpoint(a.headlineRate.low, a.headlineRate.high);
  return yearOneSplit(a.recommendedAmount, rate, a.recommendedTenureMonths);
}

export function altPath(answers: Answers, a: Assessment): {
  title: string;
  body: string;
  options: { name: string; why: string }[];
} | null {
  if (a.verdict !== "dont_borrow") return null;
  const costly = (answers.existingLoanRate ?? 0) >= 24;
  return {
    title: "A cheaper door than a new loan",
    body: "A new EMI on top of a bounce or 24%+ paper is how a squeeze becomes a default. These are the doors that still make sense.",
    options: [
      {
        name: costly ? "Gold loan to clear the costly EMI" : "Pause any new purchase loan",
        why: costly
          ? "Gold is usually 9.5–14%. Use it only to close the 24%+ app loan — not to buy something new."
          : "Give the household one clean quarter before you add a ticket.",
      },
      {
        name: "Wait six months with no bounce",
        why: "A warm bounce is the first thing a lender will price. Time is cheaper than another scooter EMI.",
      },
      {
        name: "Do not sign a two-wheeler form this week",
        why: "The vehicle can wait. A default on your file cannot be undone by a delivery run.",
      },
    ],
  };
}

export function quoteCost(rate: number, a: Assessment) {
  const amount = a.recommendedAmount;
  const months = a.recommendedTenureMonths;
  const monthly = amount > 0 ? emi(amount, rate, months) : 0;
  const interest = amount > 0 ? totalInterest(amount, rate, months) : 0;
  return {
    monthly: roundEmi(monthly),
    interest: Math.round(interest),
    check: checkQuote(rate, a),
  };
}
