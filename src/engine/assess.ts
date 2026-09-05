import {
  allInApr,
  clamp,
  emi,
  formatInr,
  formatPct,
  midpoint,
  principalFromEmi,
  roundAmount,
  roundEmi,
  totalInterest,
} from "./money";
import { isAnswered, progress, visibleQuestions } from "./questions";
import {
  BAND_WIDEN_PER_MISSING,
  BOUNCE_LENDER_HIGH,
  BOUNCE_LENDER_LOW,
  BOUNCE_SAFE_EMI_CAP_OF_INCOME,
  BUFFER_BASE,
  BUFFER_PER_DEPENDENT,
  CARD_UTIL_RATE_BUMP,
  CARD_UTIL_THRESHOLD,
  CASH_RANGE_LENDER_POINT,
  CONSUMPTION_INCOME_MONTHS_CAP,
  CREDIT_BAND_MIDPOINT,
  CONFIDENCE_ADD_WEIGHT,
  CONFIDENCE_MUST_WEIGHT,
  CONFIDENCE_UNKNOWN_EXPENSE_CAP,
  CONFIDENCE_UNKNOWN_SCORE_CAP,
  DEFAULT_TENURE,
  DEFAULT_VARIABLE_SHARE,
  EMERGENCY_MONTHS_OK,
  HIGH_COST_DEBT_THRESHOLD,
  INFORMAL_LENDER_HAIRCUT,
  INFORMAL_SAFE_HAIRCUT,
  LONG_STABLE_RATE_CUT,
  LOW_EMERGENCY_HAIRCUT,
  LTV_GOLD_HIGH,
  LTV_GOLD_LOW,
  LTV_HOME_HIGH,
  LTV_HOME_LOW,
  MAX_AGE_PERSONAL,
  MAX_AGE_SECURED,
  MAX_TENURE,
  MIN_MEANINGFUL_LOAN,
  MNC_GOVT_RATE_CUT,
  MULTIPLE_BUSINESS,
  MULTIPLE_PERSONAL,
  PRODUCTIVE_EARN_COUNT,
  RATE_BUSINESS_UNSECURED,
  RATE_GOLD,
  RATE_HOME,
  RATE_LAP,
  RATE_PERSONAL,
  RATE_TWO_WHEELER,
  SHORT_TENURE_RATE_BUMP,
  SPOUSE_LENDER_HAIRCUT,
  SPOUSE_SAFE_HAIRCUT,
  SURPLUS_FLOOR_FOR_BORROW,
  TWO_WHEELER_CAP,
  UNDOCUMENTED_LENDER_HAIRCUT,
  UNKNOWN_BOUNCE_RATE_BUMP,
  UNKNOWN_EMERGENCY_HAIRCUT,
  VARIABLE_INCOME_COUNT,
  defaultKnobs,
  feePctFor,
  foirPair,
  type StudioKnobs,
} from "./rules";
import type {
  Answers,
  Assessment,
  IncomeType,
  LoanPurpose,
  NegotiationCard,
  ProductType,
  Range,
  StressCase,
  TenureOption,
  Verdict,
} from "./types";

export type ScoreBucket = "super" | "prime" | "good" | "fair" | "sub" | "unknown";

export function resolvedScore(a: Answers): number | null {
  if (a.creditBand === "exact") return a.creditScore;
  if (a.creditBand == null || a.creditBand === "unknown") return null;
  return CREDIT_BAND_MIDPOINT[a.creditBand] ?? null;
}

export function scoreBucket(score: number | null): ScoreBucket {
  if (score == null) return "unknown";
  if (score >= 800) return "super";
  if (score >= 750) return "prime";
  if (score >= 700) return "good";
  if (score >= 650) return "fair";
  return "sub";
}

export function isConsumption(purpose: LoanPurpose | null): boolean {
  return purpose === "wedding" || purpose === "consumption" || purpose === "other";
}

export function maxTenureMonths(product: ProductType, age: number | null): number {
  const capAge = product === "personal" || product === "two_wheeler" || product === "business"
    ? MAX_AGE_PERSONAL
    : MAX_AGE_SECURED;
  const byAge = age != null ? Math.max(12, (capAge - age) * 12) : MAX_TENURE[product];
  return Math.min(MAX_TENURE[product], byAge);
}

export function routeProduct(a: Answers): { product: ProductType; reason: string } {
  const amount = a.amountWanted ?? 0;
  const coll = a.collateralType ?? "none";
  const collVal = a.collateralValue ?? 0;
  const preferred = a.preferredProduct === "recommend" ? null : a.preferredProduct;

  const securedEnough = collVal >= Math.max(amount * 1.4, 400_000);
  const shopLike = coll === "shop" || coll === "commercial";
  const houseLike = coll === "residential";

  if (a.purpose === "home" || preferred === "home") {
    return {
      product: "home",
      reason: "Purpose is a house. Home-loan grids, not personal-loan grids.",
    };
  }

  if (coll === "gold" && (a.incomeType === "informal" || (a.pastBounces ?? 0) >= 1 || preferred === "gold")) {
    return {
      product: "gold",
      reason: "Gold is the cleanest way for a thin or bruised file to borrow small and cheap.",
    };
  }

  if (
    (shopLike || houseLike) &&
    securedEnough &&
    (a.purpose === "business" || a.incomeType === "self_employed" || preferred === "lap" || preferred === "business")
  ) {
    return {
      product: "lap",
      reason: `Unencumbered ${coll} of ${formatInr(collVal)} should be pledged. Do not walk in for an unsecured personal loan.`,
    };
  }

  if (preferred === "gold" && collVal > 0) {
    return { product: "gold", reason: "You have gold and asked for a gold loan. That is the cheaper ticket." };
  }

  if (a.purpose === "vehicle" && amount <= TWO_WHEELER_CAP) {
    return {
      product: "two_wheeler",
      reason: "Ticket size and purpose fit a two-wheeler loan, not a personal loan.",
    };
  }

  if (preferred === "two_wheeler") {
    return { product: "two_wheeler", reason: "You asked for a two-wheeler product." };
  }

  if (a.purpose === "business" && !securedEnough) {
    return {
      product: "business",
      reason: "Business purpose without enough pledgeable asset — unsecured MSME, which is priced as thin-file credit.",
    };
  }

  if (preferred === "lap" || preferred === "business" || preferred === "personal") {
    return { product: preferred, reason: "We kept the product you walked in with. Collateral did not justify a reroute." };
  }

  return { product: "personal", reason: "Default Indian unsecured ticket when no asset or home purpose is in the file." };
}

function pair(low: number, high: number): Range {
  return { low: Math.min(low, high), high: Math.max(low, high) };
}

function widen(range: Range, confidence: number): Range {
  const extra = (1 - confidence) * 2.4;
  return pair(
    Math.max(6, range.low - extra * 0.45),
    range.high + extra * 0.7,
  );
}

export function fairRate(
  a: Answers,
  product: ProductType,
  confidence: number,
  knobs: StudioKnobs = defaultKnobs(),
): {
  headline: Range;
  why: string;
} {
  const bucket = scoreBucket(resolvedScore(a));
  const notes: string[] = [];
  let low = 12;
  let high = 18;

  if (product === "gold") {
    [low, high] = RATE_GOLD.any;
    notes.push("Gold is pledged-metal pricing, not bureau pricing.");
  } else if (product === "home") {
    const row = bucket === "unknown" ? RATE_HOME.unknown : RATE_HOME[bucket];
    [low, high] = row;
  } else if (product === "lap") {
    const row = bucket === "unknown" ? RATE_LAP.unknown : RATE_LAP[bucket];
    [low, high] = row;
    if (bucket === "unknown") notes.push("No score: we priced the shop, not a 300 CIBIL.");
  } else if (product === "two_wheeler") {
    if (a.incomeType === "informal") [low, high] = RATE_TWO_WHEELER.informal;
    else if (bucket === "prime" || bucket === "super") [low, high] = RATE_TWO_WHEELER.prime;
    else if (bucket === "unknown") [low, high] = RATE_TWO_WHEELER.unknown;
    else [low, high] = RATE_TWO_WHEELER.standard;
  } else if (product === "business") {
    const documented = (a.documentedAnnualIncome ?? 0) > 0;
    [low, high] = documented ? RATE_BUSINESS_UNSECURED.documented : RATE_BUSINESS_UNSECURED.thin;
    if (bucket === "unknown") notes.push("Thin or missing bureau: unsecured business paper stays expensive.");
  } else {
    if (bucket === "unknown") {
      const key =
        a.incomeType === "informal"
          ? "unknown_informal"
          : a.incomeType === "self_employed"
            ? "unknown_self"
            : "unknown_salaried";
      [low, high] = RATE_PERSONAL[key];
      notes.push("Score unknown — wide personal-loan band, not a sub-prime stain.");
    } else {
      [low, high] = RATE_PERSONAL[bucket];
      notes.push(`${bucket} bureau band on a personal loan.`);
    }
  }

  if (a.employerType === "mnc" || a.employerType === "govt") {
    low -= MNC_GOVT_RATE_CUT;
    high -= MNC_GOVT_RATE_CUT * 0.7;
    notes.push("MNC/govt employer notch.");
  }
  if (a.employmentYears != null && a.employmentYears < 1) {
    low += SHORT_TENURE_RATE_BUMP;
    high += SHORT_TENURE_RATE_BUMP;
    notes.push("Job tenure under a year.");
  }
  if (
    (a.employmentYears != null && a.employmentYears >= 5) ||
    (a.businessVintageYears != null && a.businessVintageYears >= 10)
  ) {
    low -= LONG_STABLE_RATE_CUT;
    high -= LONG_STABLE_RATE_CUT;
    notes.push("Long stability (job ≥5y or business ≥10y).");
  }
  if (a.businessVintageYears != null && a.businessVintageYears < 3 && product !== "gold") {
    low += 1;
    high += 1.5;
    notes.push("Business younger than 3 years.");
  }
  if ((a.cardUtilisation ?? 0) >= CARD_UTIL_THRESHOLD) {
    low += CARD_UTIL_RATE_BUMP * 0.6;
    high += CARD_UTIL_RATE_BUMP;
    notes.push("Card utilisation ≥70%.");
  }
  if ((a.pastBounces ?? 0) >= 1) {
    low += knobs.bounceRateBump;
    high += knobs.bounceRateBump + 1;
    notes.push("Recent bounce — this file is already talking.");
  } else if (a.pastBounces == null) {
    low += UNKNOWN_BOUNCE_RATE_BUMP * 0.4;
    high += UNKNOWN_BOUNCE_RATE_BUMP;
    notes.push("Bounce history unanswered: small surcharge, no Don't-borrow fire.");
  }

  if (a.existingOfferRate != null) {
    notes.push(`A quote of ${formatPct(a.existingOfferRate)} is already on the table.`);
  }

  if (product === "personal") {
    low = Math.max(low, 10.5);
    notes.push("Unsecured personal paper is floored at 10.5% — this is not a home loan.");
  }

  const band = widen(pair(low, high), confidence);
  if (product === "personal") {
    band.low = Math.max(band.low, 10.5);
  }
  return {
    headline: { low: round1(band.low), high: round1(band.high) },
    why: notes.join(" "),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function resolveIncome(a: Answers): {
  lenderIncome: number;
  borrowerIncome: number;
  why: string;
  assumptions: string[];
} {
  const assumptions: string[] = [];
  const stated = a.monthlyIncome ?? 0;
  const spouse = a.coApplicantIncome ?? 0;
  const type: IncomeType = a.incomeType ?? "salaried";
  let lender = stated;
  let borrower = stated;

  if (type === "salaried") {
    const variable = a.variableIncomeShare ?? DEFAULT_VARIABLE_SHARE;
    if (a.variableIncomeShare == null) {
      assumptions.push(`Variable share unanswered — assumed ${DEFAULT_VARIABLE_SHARE * 100}% and counted 60% of it.`);
    }
    const recognised = stated * (1 - variable + variable * VARIABLE_INCOME_COUNT);
    lender = recognised + spouse * SPOUSE_LENDER_HAIRCUT;
    borrower = stated + spouse * SPOUSE_SAFE_HAIRCUT;
  } else if (type === "self_employed") {
    const cashLow = a.cashMonthlyLow ?? stated * 0.75;
    const cashHigh = a.cashMonthlyHigh ?? stated;
    const cashMid = midpoint(cashLow, cashHigh);
    if (a.documentedAnnualIncome && a.documentedAnnualIncome > 0) {
      lender = a.documentedAnnualIncome / 12 + spouse * SPOUSE_LENDER_HAIRCUT;
      assumptions.push("Lender income is ITR ÷ 12, not till cash.");
    } else {
      lender = cashMid * UNDOCUMENTED_LENDER_HAIRCUT + spouse * SPOUSE_LENDER_HAIRCUT;
      assumptions.push(`No ITR — lender side counts ${UNDOCUMENTED_LENDER_HAIRCUT * 100}% of cash.`);
    }
    borrower = cashLow + spouse * SPOUSE_SAFE_HAIRCUT;
    if (a.cashMonthlyLow == null) {
      assumptions.push("Cash range unanswered — safe side uses 75% of the typical month you typed.");
    }
    void cashHigh;
    void CASH_RANGE_LENDER_POINT;
  } else {
    const cashLow = a.cashMonthlyLow ?? stated * INFORMAL_SAFE_HAIRCUT;
    lender = stated * INFORMAL_LENDER_HAIRCUT + spouse * 0.5;
    borrower = cashLow + spouse * SPOUSE_SAFE_HAIRCUT;
    assumptions.push("Informal income: lender counts 50% of stated; safe side uses the thin month.");
  }

  const why =
    type === "self_employed"
      ? `Lender sees ${formatInr(lender)}/mo (documents + 70% of co-applicant). You can only plan on ${formatInr(borrower)}/mo (thin cash month).`
      : type === "informal"
        ? `Lender may recognise ~${formatInr(lender)}/mo. Your house actually runs on about ${formatInr(borrower)}/mo.`
        : `Recognised monthly capacity ${formatInr(lender)} for a lender, ${formatInr(borrower)} for the household.`;

  return { lenderIncome: lender, borrowerIncome: borrower, why, assumptions };
}

function incomeMultiple(a: Answers, product: ProductType, bucket: ScoreBucket): Range {
  if (product === "lap" || product === "home") return { low: 24, high: 48 };
  if (product === "gold") return { low: 6, high: 18 };
  if (product === "two_wheeler") return { low: 6, high: 12 };
  if (product === "business") {
    return (a.documentedAnnualIncome ?? 0) > 0
      ? { low: MULTIPLE_BUSINESS.documented[0], high: MULTIPLE_BUSINESS.documented[1] }
      : { low: MULTIPLE_BUSINESS.thin[0], high: MULTIPLE_BUSINESS.thin[1] };
  }
  if (bucket === "unknown") {
    const key =
      a.incomeType === "informal"
        ? "unknown_informal"
        : a.incomeType === "self_employed"
          ? "unknown_self"
          : "unknown_salaried";
    return { low: MULTIPLE_PERSONAL[key][0], high: MULTIPLE_PERSONAL[key][1] };
  }
  const row = MULTIPLE_PERSONAL[bucket];
  let low = row[0];
  let high = row[1];
  if (a.employerType === "mnc" || a.employerType === "govt") {
    low += 2;
    high += 2;
  }
  if (a.employmentYears != null && a.employmentYears < 1) {
    low -= 4;
    high -= 4;
  }
  return { low: Math.max(3, low), high: Math.max(low + 2, high) };
}

export function computeConfidence(a: Answers): {
  confidence: number;
  label: "low" | "medium" | "high";
  why: string;
  unansweredCost: string[];
} {
  const vis = visibleQuestions(a);
  const must = vis.filter((q) => q.tier === "must");
  const add = vis.filter((q) => q.tier === "additional");
  const mustDone = must.filter((q) => isAnswered(q.id, a)).length;
  const addDone = add.filter((q) => isAnswered(q.id, a)).length;
  let c =
    (must.length ? mustDone / must.length : 1) * CONFIDENCE_MUST_WEIGHT +
    (add.length ? addDone / add.length : 1) * CONFIDENCE_ADD_WEIGHT;

  const unansweredCost: string[] = [];
  if (resolvedScore(a) == null) {
    c = Math.min(c, CONFIDENCE_UNKNOWN_SCORE_CAP);
    unansweredCost.push("No credit score — rate and sanction stay a band, not a point.");
  }
  if (a.monthlyExpenses == null) {
    c = Math.min(c, CONFIDENCE_UNKNOWN_EXPENSE_CAP);
    unansweredCost.push("Expenses missing — we will not pretend we know your surplus.");
  }
  if (a.incomeType === "self_employed" && a.documentedAnnualIncome == null) {
    unansweredCost.push("No ITR — lender amount is guessed from haircut cash, so the gap vs your number is wide.");
  }
  if (a.emergencyMonths == null) {
    unansweredCost.push("Savings months unanswered — safe EMI already cut 15%. Three months of cash would raise it.");
  }
  if (a.pastBounces == null) {
    unansweredCost.push("Bounce history unanswered — we did not fire Don't borrow on a bounce we have not seen.");
  }
  if (a.collateralType == null && a.incomeType !== "salaried") {
    unansweredCost.push("No collateral answer — we could not reroute you to a cheaper secured product.");
  }

  c = clamp(c, 0.18, 0.92);
  const label = c < 0.45 ? "low" : c < 0.7 ? "medium" : "high";
  const { answeredAdditional, addTotal } = progress(a, []);
  const why = `Must ${mustDone}/${must.length}, extra ${answeredAdditional}/${addTotal}. ${label} confidence — fewer answers keep every band wide.`;
  return { confidence: c, label, why, unansweredCost };
}

function applyLtv(
  product: ProductType,
  collType: Answers["collateralType"],
  collVal: number,
  amount: Range,
  knobs: StudioKnobs,
): Range {
  if (collVal <= 0) return amount;
  let ltv: Range | null = null;
  if (product === "lap" && (collType === "shop" || collType === "commercial" || collType === "residential")) {
    ltv = { low: collVal * knobs.ltvLapLow, high: collVal * knobs.ltvLapHigh };
  } else if (product === "home" && collType === "residential") {
    ltv = { low: collVal * LTV_HOME_LOW, high: collVal * LTV_HOME_HIGH };
  } else if (product === "gold" && collType === "gold") {
    ltv = { low: collVal * LTV_GOLD_LOW, high: collVal * LTV_GOLD_HIGH };
  }
  if (!ltv) return amount;
  return pair(Math.min(amount.low, ltv.low), Math.min(amount.high, ltv.high));
}

export function assess(answers: Answers, knobs: StudioKnobs = defaultKnobs()): Assessment {
  const assumptions: string[] = [];
  const { confidence, label, why: confidenceWhy, unansweredCost } = computeConfidence(answers);
  const { product, reason: productReason } = routeProduct(answers);
  const { lenderIncome, borrowerIncome, why: incomeWhy, assumptions: incomeAssumptions } =
    resolveIncome(answers);
  assumptions.push(...incomeAssumptions);

  const bucket = scoreBucket(resolvedScore(answers));
  const prime = bucket === "prime" || bucket === "super";
  const risky =
    bucket === "sub" ||
    answers.incomeType === "informal" ||
    (answers.pastBounces ?? 0) >= 1;
  const { lender: foirLender, safe: foirSafe } = foirPair(
    product,
    risky,
    prime,
    answers.incomeType === "informal",
    knobs,
  );

  const existing = answers.existingEmis ?? 0;
  const expenses = answers.monthlyExpenses ?? borrowerIncome * 0.55;
  if (answers.monthlyExpenses == null) {
    assumptions.push("Expenses unanswered — assumed 55% of borrower income. That is a guess and the safe band is wide.");
  }

  const { headline, why: rateWhy } = fairRate(answers, product, confidence, knobs);
  const agreeToRate =
    answers.existingOfferRate != null
      ? round1(
          clamp(answers.existingOfferRate, headline.low, headline.high),
        )
      : headline.high;
  const feePct = feePctFor(product);
  if (answers.age == null) assumptions.push("Age unanswered — assumed 35 for tenure caps.");
  const tenureMax = maxTenureMonths(product, answers.age);
  const tenureRec = Math.min(DEFAULT_TENURE[product], tenureMax);

  const maxEmiLender = Math.max(0, foirLender * lenderIncome - existing);
  const multiple = incomeMultiple(answers, product, bucket);
  let lenderLow = Math.min(
    principalFromEmi(maxEmiLender, headline.high, tenureMax),
    lenderIncome * multiple.low,
  );
  let lenderHigh = Math.min(
    principalFromEmi(maxEmiLender, headline.low, tenureMax),
    lenderIncome * multiple.high,
  );

  const ltvApplied = applyLtv(
    product,
    answers.collateralType,
    answers.collateralValue ?? 0,
    { low: lenderLow, high: lenderHigh },
    knobs,
  );
  lenderLow = ltvApplied.low;
  lenderHigh = ltvApplied.high;

  if (product === "two_wheeler") {
    lenderLow = Math.min(lenderLow, TWO_WHEELER_CAP * 0.7);
    lenderHigh = Math.min(lenderHigh, TWO_WHEELER_CAP);
  }

  if ((answers.pastBounces ?? 0) >= 1) {
    lenderLow *= BOUNCE_LENDER_LOW;
    lenderHigh *= BOUNCE_LENDER_HIGH;
  }

  const widenAmt = 1 + (1 - confidence) * BAND_WIDEN_PER_MISSING;
  lenderLow = lenderLow / widenAmt;
  lenderHigh = lenderHigh * (1 + (widenAmt - 1) * 0.5);

  if (lenderHigh < MIN_MEANINGFUL_LOAN) {
    lenderLow = 0;
    lenderHigh = 0;
  }

  const lenderAmount = {
    low: roundAmount(Math.max(0, lenderLow)),
    high: roundAmount(Math.max(0, lenderHigh)),
  };

  const dependents = answers.dependents ?? 0;
  if (answers.dependents == null) {
    assumptions.push("Dependents unanswered — buffer stays at 15% of income, no extra mouths.");
  }
  const buffer = (BUFFER_BASE + BUFFER_PER_DEPENDENT * dependents) * borrowerIncome;
  const upcomingMonthly = (answers.upcomingExpense ?? 0) / 12;
  const residual = borrowerIncome - existing - expenses - buffer - upcomingMonthly;
  const foirSafeEmi = foirSafe * borrowerIncome - existing;
  let safeEmi = Math.min(residual, foirSafeEmi);

  if (answers.emergencyMonths != null && answers.emergencyMonths < EMERGENCY_MONTHS_OK) {
    safeEmi *= LOW_EMERGENCY_HAIRCUT;
  } else if (answers.emergencyMonths == null) {
    safeEmi *= UNKNOWN_EMERGENCY_HAIRCUT;
  }

  if (isConsumption(answers.purpose) && (answers.productiveMonthlyEarn ?? 0) <= 0) {
    safeEmi *= knobs.consumptionHaircut;
  }

  if ((answers.productiveMonthlyEarn ?? 0) > 0) {
    safeEmi += PRODUCTIVE_EARN_COUNT * answers.productiveMonthlyEarn!;
  }

  if ((answers.pastBounces ?? 0) >= 1) {
    safeEmi = Math.min(safeEmi, borrowerIncome * BOUNCE_SAFE_EMI_CAP_OF_INCOME);
  }

  safeEmi = Math.max(0, safeEmi);
  const rateMid = midpoint(headline.low, headline.high);
  let safeHighAmt = principalFromEmi(safeEmi, rateMid, tenureRec);
  if (isConsumption(answers.purpose)) {
    safeHighAmt = Math.min(safeHighAmt, borrowerIncome * CONSUMPTION_INCOME_MONTHS_CAP);
  }

  const spread = 0.12 + (1 - confidence) * 0.18;
  const safeAmount = {
    low: roundAmount(safeHighAmt * (1 - spread)),
    high: roundAmount(safeHighAmt),
  };
  const emiCeiling = roundEmi(safeEmi);

  const wanted = answers.amountWanted ?? 0;
  const surplusRatio =
    borrowerIncome > 0 ? (borrowerIncome - existing - expenses) / borrowerIncome : 0;
  const distressed =
    (answers.pastBounces ?? 0) >= 1 ||
    (answers.existingLoanRate ?? 0) >= HIGH_COST_DEBT_THRESHOLD ||
    (borrowerIncome > 0 && existing / borrowerIncome >= foirSafe);

  let verdict: Verdict = "borrow";
  let verdictReason = "";

  const alreadyMaxed = borrowerIncome > 0 && existing / borrowerIncome >= foirLender;
  const bounceAndHighCost =
    (answers.pastBounces ?? 0) >= 1 &&
    (answers.existingLoanRate ?? 0) >= HIGH_COST_DEBT_THRESHOLD;
  const noAir =
    surplusRatio < SURPLUS_FLOOR_FOR_BORROW &&
    (distressed || dependents >= 2 || answers.incomeType === "informal");

  if (alreadyMaxed) {
    verdict = "dont_borrow";
    verdictReason = `Existing EMIs already use ${formatPct((existing / borrowerIncome) * 100, 0)} of income. There is no honest FOIR left for a new loan.`;
  } else if (bounceAndHighCost) {
    verdict = "dont_borrow";
    verdictReason =
      "A bounce is still warm and you are already on 24%+ paper. The next EMI is how a squeeze becomes a default. Clean the app loans first — gold if you have it — do not add a new ticket.";
  } else if (noAir && safeAmount.high < Math.max(wanted * 0.4, MIN_MEANINGFUL_LOAN)) {
    verdict = "dont_borrow";
    verdictReason = `After EMIs and the house, surplus is ${formatPct(surplusRatio * 100, 0)} of income. A new loan would be taken from food and school, not from slack.`;
  } else if (safeAmount.high < MIN_MEANINGFUL_LOAN && wanted > MIN_MEANINGFUL_LOAN) {
    verdict = "dont_borrow";
    verdictReason = "The amount you can safely carry rounds to nothing. Walking in anyway is how sanction letters become bounce letters.";
  } else if (
    wanted > safeAmount.high * 1.02 ||
    (isConsumption(answers.purpose) && wanted > safeAmount.high * 0.92)
  ) {
    verdict = "borrow_less";
    verdictReason = isConsumption(answers.purpose)
      ? `Lenders will likely fund a wedding ticket. You should not take ${formatInr(wanted)} — it earns nothing and your safe carry is ${formatInr(safeAmount.low)}–${formatInr(safeAmount.high)}.`
      : `You can borrow, but ${formatInr(wanted)} sits above the ${formatInr(safeAmount.low)}–${formatInr(safeAmount.high)} you can carry if income dips.`;
  } else if (wanted > lenderAmount.high && lenderAmount.high > 0) {
    verdict = "borrow_less";
    verdictReason = `Even a friendly lender is unlikely to sanction ${formatInr(wanted)}. Ask inside ${formatInr(lenderAmount.low)}–${formatInr(lenderAmount.high)}, and still stay inside your safe number.`;
  } else {
    verdict = "borrow";
    verdictReason =
      answers.purpose === "business" || answers.purpose === "refinance"
        ? `The use is productive, the EMI fits a ${formatPct(foirSafe * 100, 0)} self-cap, and the product is ${productLabel(product)}.`
        : `The ask fits both a lender FOIR of ${formatPct(foirLender * 100, 0)} and your household ceiling.`;
  }

  const recommendedAmount = roundAmount(
    verdict === "dont_borrow"
      ? 0
      : clamp(
          Math.min(wanted || safeAmount.high, safeAmount.high, lenderAmount.high || safeAmount.high),
          0,
          safeAmount.high,
        ),
  );

  const apr = pair(
    round1(allInApr(Math.max(recommendedAmount, 100_000), headline.low, tenureRec, feePct)),
    round1(allInApr(Math.max(recommendedAmount, 100_000), headline.high, tenureRec, feePct)),
  );

  const tenures = uniqueTenures(product, tenureMax);
  const tenureOptions: TenureOption[] = tenures.map((months) => {
    const rec = recommendedAmount > 0 ? emi(recommendedAmount, rateMid, months) : 0;
    const want = wanted > 0 ? emi(wanted, rateMid, months) : 0;
    return {
      months,
      emiForRecommended: roundEmi(rec),
      emiForWanted: roundEmi(want),
      totalInterestRecommended: roundAmount(totalInterest(recommendedAmount, rateMid, months)),
    };
  });

  const recEmi = recommendedAmount > 0 ? emi(recommendedAmount, rateMid, tenureRec) : 0;
  const incomeShockEmi = recEmi;
  const incomeShockFoir =
    borrowerIncome * 0.8 > 0 ? ((existing + incomeShockEmi) / (borrowerIncome * 0.8)) * 100 : 99;
  const rateShockEmi = recommendedAmount > 0 ? emi(recommendedAmount, headline.high + 2, tenureRec) : 0;
  const rateShockFoir =
    borrowerIncome > 0 ? ((existing + rateShockEmi) / borrowerIncome) * 100 : 99;
  const stressOnIncome = incomeShockFoir >= rateShockFoir;
  const stressedFoir = stressOnIncome ? incomeShockFoir : rateShockFoir;
  const stressedEmi = roundEmi(stressOnIncome ? incomeShockEmi : rateShockEmi);
  const stillFits = stressedFoir <= foirSafe * 100 + 1 && stressedEmi <= emiCeiling * 1.05;

  const stress: StressCase = {
    title: stressOnIncome ? "Income drops 20%" : "Rate rises 2 points",
    detail: stressOnIncome
      ? `If take-home falls to ${formatInr(borrowerIncome * 0.8)}, existing + new EMI is ${formatPct(incomeShockFoir, 0)} FOIR.`
      : `If the reset lands at ${formatPct(headline.high + 2)}, EMI becomes ${formatInr(rateShockEmi)} and FOIR ${formatPct(rateShockFoir, 0)}.`,
    stressedEmi,
    stressedFoirPct: Math.round(stressedFoir),
    stillFits,
  };

  if (
    verdict === "dont_borrow" &&
    product === "two_wheeler" &&
    answers.incomeType === "informal"
  ) {
    lenderAmount.low = 70_000;
    lenderAmount.high = 120_000;
  }

  const lenderWhy =
    verdict === "dont_borrow" && product === "two_wheeler"
      ? `A two-wheeler counter may still try to book ${formatInr(lenderAmount.low)}–${formatInr(lenderAmount.high)}. That is a sales number, not a prudent sanction. Your safe carry is ₹0 until the bounce is old and the 30% paper is gone.`
      : product === "lap"
        ? `Sanction is the lower of FOIR on documented income (${formatInr(lenderIncome)}/mo, cap ${formatPct(foirLender * 100, 0)}) and ${formatPct(knobs.ltvLapLow * 100, 0)}–${formatPct(knobs.ltvLapHigh * 100, 0)} of the pledged premises. That is why this number is not your till cash.`
        : `A lender will try to bind you at ${formatPct(foirLender * 100, 0)} FOIR on ${formatInr(lenderIncome)}/mo, times a ${multiple.low}–${multiple.high}× multiple, over ${tenureMax} months. ${incomeWhy}`;

  const safeWhy = `The ceiling is ${formatInr(emiCeiling)} because that is what is left after EMIs, household spend, a ${formatPct((BUFFER_BASE + BUFFER_PER_DEPENDENT * dependents) * 100, 0)} buffer and ${isConsumption(answers.purpose) ? "a 20% consumption haircut" : "no party-loan haircut"}. ${formatInr(emiCeiling + 8000)} would eat the buffer we refused to lend against.`;

  const emiWhy = `Agree at most ${formatInr(emiCeiling)} a month. That is the residual after the house is fed — not the EMI a banker can mathematically extract from ${formatPct(foirLender * 100, 0)} FOIR.`;

  const useNumberWhy =
    "Walk in with the borrower's number. The lender's number is what they can sell you, not what you should take.";

  const card = buildCard({
    answers,
    product,
    verdict,
    headline,
    apr,
    feePct,
    recommendedAmount,
    safeAmount,
    lenderAmount,
    emiCeiling,
    rateMid,
    stress,
    verdictReason,
    productReason,
  });

  return {
    verdict,
    verdictReason,
    product,
    productReason,
    lenderAmount,
    lenderWhy,
    safeAmount,
    safeWhy,
    useNumber: "safe",
    useNumberWhy,
    headlineRate: headline,
    apr,
    processingFeePct: round1(feePct),
    agreeToRate,
    rateWhy,
    emiCeiling,
    emiWhy,
    recommendedAmount,
    recommendedTenureMonths: tenureRec,
    tenureOptions,
    stress,
    confidence,
    confidenceLabel: label,
    confidenceWhy,
    unansweredCost,
    assumptions,
    card,
    traces: [
      { output: "verdict", sentence: verdictReason },
      { output: "product", sentence: productReason },
      { output: "lenderAmount", sentence: lenderWhy },
      { output: "safeAmount", sentence: safeWhy },
      { output: "rate", sentence: rateWhy },
      { output: "emi", sentence: emiWhy },
      { output: "confidence", sentence: confidenceWhy },
    ],
  };
}

function uniqueTenures(product: ProductType, cap: number): number[] {
  const pool = [12, 24, 36, 48, 60, 84, 120, 180];
  const allowed = pool.filter((m) => m <= cap && m <= MAX_TENURE[product]);
  return allowed.length ? allowed : [Math.min(12, cap)];
}

export function productLabel(product: ProductType): string {
  return {
    personal: "personal loan",
    home: "home loan",
    lap: "loan against property",
    gold: "gold loan",
    two_wheeler: "two-wheeler loan",
    business: "unsecured business loan",
  }[product];
}

function buildCard(input: {
  answers: Answers;
  product: ProductType;
  verdict: Verdict;
  headline: Range;
  apr: Range;
  feePct: number;
  recommendedAmount: number;
  safeAmount: Range;
  lenderAmount: Range;
  emiCeiling: number;
  rateMid: number;
  stress: StressCase;
  verdictReason: string;
  productReason: string;
}): NegotiationCard {
  const {
    answers,
    product,
    verdict,
    headline,
    apr,
    feePct,
    recommendedAmount,
    safeAmount,
    lenderAmount,
    emiCeiling,
    stress,
    verdictReason,
    productReason,
  } = input;

  const refuse =
    product === "lap"
      ? "Unsecured personal loan or merchant cash at 18%+"
      : product === "gold"
        ? "App loan or payday paper at 24%+"
        : answers.incomeType === "informal"
          ? "Any app loan, top-up or 30% 'instant' offer"
          : "A top-up that pushes EMI above the ceiling on this card";

  const insist =
    verdict === "dont_borrow"
      ? "Do not sign a new loan today. If anything, a gold loan only to retire 24%+ paper."
      : `A ${productLabel(product)}. ${productReason}`;

  const walkAwayRate =
    answers.existingOfferRate != null
      ? round1(clamp(answers.existingOfferRate, headline.low, headline.high))
      : headline.high;

  const compareLine =
    answers.existingOfferRate != null
      ? answers.existingOfferRate > headline.high
        ? `They already quoted ${formatPct(answers.existingOfferRate)}. Fair for this file is ${formatPct(headline.low)}–${formatPct(headline.high)}. The extra points are theirs, not the market.`
        : `They quoted ${formatPct(answers.existingOfferRate)}, which sits inside or under our ${formatPct(headline.low)}–${formatPct(headline.high)} band — still compare all-in APR, not the sticker.`
      : `If they quote 14% and this card says ${formatPct(headline.low)}–${formatPct(headline.high)}, the difference is negotiation, not destiny.`;

  const headlineCard =
    verdict === "dont_borrow"
      ? "Do not sign today"
      : verdict === "borrow_less"
        ? `Borrow less than ${formatInr(answers.amountWanted ?? 0)}`
        : `You can walk in for ${formatInr(recommendedAmount)}`;

  return {
    headline: headlineCard,
    profileLine: profileLine(answers),
    askAmount: recommendedAmount,
    walkAwayAmount: safeAmount.high,
    walkAwayEmi: emiCeiling,
    walkAwayRate,
    fairRate: headline,
    fairApr: apr,
    productInsist: insist,
    productRefuse: refuse,
    because: verdictReason,
    compareLine: `${compareLine} All-in APR including ~${formatPct(feePct)} fee is ${formatPct(apr.low)}–${formatPct(apr.high)}. Lender sanction they may wave is ${formatInr(lenderAmount.low)}–${formatInr(lenderAmount.high)} — ignore it if it is above ${formatInr(safeAmount.high)}.`,
    stressLine: `${stress.title}. ${stress.detail} ${stress.stillFits ? "The ceiling on this card still holds." : "This ask already fails stress — walk away or cut the ticket."}`,
  };
}

function profileLine(a: Answers): string {
  const bits = [
    a.age != null ? `${a.age} yrs` : null,
    a.incomeType?.replace("_", "-"),
    a.monthlyIncome != null ? `${formatInr(a.monthlyIncome)}/mo` : null,
    resolvedScore(a) != null ? `score ${resolvedScore(a)}` : "score unknown",
  ].filter(Boolean);
  return bits.join(" · ");
}

export function canAssess(a: Answers): boolean {
  return (
    a.purpose != null &&
    a.amountWanted != null &&
    a.incomeType != null &&
    a.monthlyIncome != null &&
    a.existingEmis != null &&
    a.monthlyExpenses != null &&
    a.age != null &&
    a.creditBand != null
  );
}
