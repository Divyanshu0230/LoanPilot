import type { ProductType, RuleRow } from "./types";

/** Every number the UI shows comes from here. */

export const FOIR_PERSONAL_PRIME = 0.5;
export const FOIR_PERSONAL_STANDARD = 0.45;
export const FOIR_PERSONAL_RISKY = 0.4;
export const FOIR_SAFE_PERSONAL = 0.4;
export const FOIR_LAP = 0.55;
export const FOIR_SAFE_LAP = 0.45;
export const FOIR_HOME = 0.55;
export const FOIR_SAFE_HOME = 0.45;
export const FOIR_TWO_WHEELER = 0.5;
export const FOIR_SAFE_TWO_WHEELER = 0.35;
export const FOIR_GOLD = 0.55;
export const FOIR_SAFE_GOLD = 0.4;
export const FOIR_BUSINESS = 0.5;
export const FOIR_SAFE_BUSINESS = 0.4;
export const FOIR_INFORMAL_SAFE = 0.3;

export const BUFFER_BASE = 0.15;
export const BUFFER_PER_DEPENDENT = 0.03;
export const CONSUMPTION_SAFE_HAIRCUT = 0.8;
export const CONSUMPTION_INCOME_MONTHS_CAP = 6;
export const UNKNOWN_EMERGENCY_HAIRCUT = 0.85;
export const LOW_EMERGENCY_HAIRCUT = 0.65;
export const EMERGENCY_MONTHS_OK = 3;
export const PRODUCTIVE_EARN_COUNT = 0.4;
export const VARIABLE_INCOME_COUNT = 0.6;
export const DEFAULT_VARIABLE_SHARE = 0.1;
export const SPOUSE_LENDER_HAIRCUT = 0.7;
export const SPOUSE_SAFE_HAIRCUT = 0.8;
export const UNDOCUMENTED_LENDER_HAIRCUT = 0.55;
export const INFORMAL_LENDER_HAIRCUT = 0.5;
export const INFORMAL_SAFE_HAIRCUT = 0.85;
export const CASH_RANGE_LENDER_POINT = 0.55;
export const BOUNCE_SAFE_EMI_CAP_OF_INCOME = 0.08;
export const BOUNCE_LENDER_LOW = 0.4;
export const BOUNCE_LENDER_HIGH = 0.7;
export const SURPLUS_FLOOR_FOR_BORROW = 0.08;
export const CARD_UTIL_RATE_BUMP = 1.0;
export const CARD_UTIL_THRESHOLD = 0.7;
export const BOUNCE_RATE_BUMP = 3.0;
export const HIGH_COST_DEBT_THRESHOLD = 24;
export const MNC_GOVT_RATE_CUT = 0.75;
export const SHORT_TENURE_RATE_BUMP = 1.5;
export const LONG_STABLE_RATE_CUT = 0.35;
export const UNKNOWN_BOUNCE_RATE_BUMP = 0.5;
export const GST_ON_FEE = 0.18;

export const FEE_PERSONAL = 0.02;
export const FEE_HOME = 0.005;
export const FEE_LAP = 0.01;
export const FEE_GOLD = 0.0075;
export const FEE_TWO_WHEELER = 0.015;
export const FEE_BUSINESS = 0.02;

export const LTV_LAP_LOW = 0.5;
export const LTV_LAP_HIGH = 0.6;
export const LTV_HOME_LOW = 0.75;
export const LTV_HOME_HIGH = 0.85;
export const LTV_GOLD_LOW = 0.65;
export const LTV_GOLD_HIGH = 0.75;
export const TWO_WHEELER_CAP = 300_000;
export const MIN_MEANINGFUL_LOAN = 25_000;

export const MAX_AGE_PERSONAL = 60;
export const MAX_AGE_SECURED = 70;
export const MAX_TENURE = {
  personal: 60,
  home: 240,
  lap: 180,
  gold: 36,
  two_wheeler: 48,
  business: 84,
} as const satisfies Record<ProductType, number>;

export const DEFAULT_TENURE = {
  personal: 36,
  home: 180,
  lap: 120,
  gold: 24,
  two_wheeler: 36,
  business: 60,
} as const satisfies Record<ProductType, number>;

export const RATE_PERSONAL = {
  super: [10.5, 12.0],
  prime: [11.0, 13.0],
  good: [13.0, 16.0],
  fair: [16.0, 20.0],
  sub: [20.0, 26.0],
  unknown_salaried: [12.5, 18.0],
  unknown_self: [15.0, 22.0],
  unknown_informal: [18.0, 28.0],
} as const;

export const RATE_LAP = {
  super: [9.75, 11.5],
  prime: [10.0, 12.0],
  good: [10.5, 12.75],
  fair: [11.5, 14.0],
  sub: [13.0, 16.0],
  unknown: [10.5, 13.5],
} as const;

export const RATE_HOME = {
  super: [8.15, 8.75],
  prime: [8.25, 9.1],
  good: [8.6, 9.5],
  fair: [9.1, 10.25],
  sub: [10.0, 11.5],
  unknown: [8.5, 10.0],
} as const;

export const RATE_GOLD = {
  any: [9.5, 14.0],
} as const;

export const RATE_TWO_WHEELER = {
  prime: [11.0, 14.5],
  standard: [13.0, 17.0],
  informal: [15.0, 20.0],
  unknown: [13.0, 18.5],
} as const;

export const RATE_BUSINESS_UNSECURED = {
  documented: [14.0, 18.0],
  thin: [16.0, 22.0],
  unknown: [16.0, 22.0],
} as const;

/** Monthly income multiples the lender side uses, before FOIR and LTV bind. */
export const MULTIPLE_PERSONAL = {
  super: [18, 24],
  prime: [16, 22],
  good: [12, 18],
  fair: [8, 14],
  sub: [4, 8],
  unknown_salaried: [10, 18],
  unknown_self: [6, 12],
  unknown_informal: [4, 8],
} as const;

export const MULTIPLE_BUSINESS = {
  documented: [12, 24],
  thin: [6, 12],
} as const;

export const CONFIDENCE_MUST_WEIGHT = 0.62;
export const CONFIDENCE_ADD_WEIGHT = 0.38;
export const CONFIDENCE_UNKNOWN_SCORE_CAP = 0.58;
export const CONFIDENCE_UNKNOWN_EXPENSE_CAP = 0.62;
export const BAND_WIDEN_PER_MISSING = 0.12;

export const CREDIT_BAND_MIDPOINT: Record<string, number | null> = {
  unknown: null,
  below_650: 620,
  "650_699": 675,
  "700_749": 725,
  "750_799": 775,
  "800_plus": 820,
  exact: null,
};

export type StudioKnobs = {
  foirSafePersonal: number;
  foirInformalSafe: number;
  consumptionHaircut: number;
  ltvLapLow: number;
  ltvLapHigh: number;
  bounceRateBump: number;
};

export function defaultKnobs(): StudioKnobs {
  return {
    foirSafePersonal: FOIR_SAFE_PERSONAL,
    foirInformalSafe: FOIR_INFORMAL_SAFE,
    consumptionHaircut: CONSUMPTION_SAFE_HAIRCUT,
    ltvLapLow: LTV_LAP_LOW,
    ltvLapHigh: LTV_LAP_HIGH,
    bounceRateBump: BOUNCE_RATE_BUMP,
  };
}

export function feePctFor(product: ProductType): number {
  const base = {
    personal: FEE_PERSONAL,
    home: FEE_HOME,
    lap: FEE_LAP,
    gold: FEE_GOLD,
    two_wheeler: FEE_TWO_WHEELER,
    business: FEE_BUSINESS,
  }[product];
  return (base * (1 + GST_ON_FEE)) * 100;
}

export function foirPair(
  product: ProductType,
  risky: boolean,
  prime: boolean,
  informal: boolean,
  knobs: StudioKnobs = defaultKnobs(),
): { lender: number; safe: number } {
  if (informal && product !== "gold" && product !== "lap") {
    return { lender: FOIR_PERSONAL_RISKY, safe: knobs.foirInformalSafe };
  }
  switch (product) {
    case "lap":
      return { lender: FOIR_LAP, safe: FOIR_SAFE_LAP };
    case "home":
      return { lender: FOIR_HOME, safe: FOIR_SAFE_HOME };
    case "gold":
      return { lender: FOIR_GOLD, safe: FOIR_SAFE_GOLD };
    case "two_wheeler":
      return { lender: FOIR_TWO_WHEELER, safe: FOIR_SAFE_TWO_WHEELER };
    case "business":
      return { lender: FOIR_BUSINESS, safe: FOIR_SAFE_BUSINESS };
    default:
      return {
        lender: prime
          ? FOIR_PERSONAL_PRIME
          : risky
            ? FOIR_PERSONAL_RISKY
            : FOIR_PERSONAL_STANDARD,
        safe: knobs.foirSafePersonal,
      };
  }
}

export const RULE_CATALOG: RuleRow[] = [
  {
    id: "FOIR_PERSONAL_PRIME",
    what: "FOIR cap — personal loan, prime salaried",
    value: "50%",
    why: "Private banks often sanction PL up to ~50% of net for 750+ MNC/govt. That is the lender's number, not a safe household number.",
    source: "My judgement. Banks do not publish a statutory FOIR",
  },
  {
    id: "FOIR_SAFE_PERSONAL",
    what: "FOIR self-cap — personal loan, borrower-safe",
    value: "40%",
    why: "The extra 10 points is how people discover they are house-poor. We keep the borrower's ceiling tighter than the sanction letter.",
    source: "My judgement",
  },
  {
    id: "FOIR_LAP",
    what: "FOIR cap — LAP / shop-secured",
    value: "55%",
    why: "Secured MSME / LAP underwriting is looser on FOIR because the property is the second way out. Still not 65%.",
    source: "My judgement, typical NBFC LAP",
  },
  {
    id: "FOIR_INFORMAL_SAFE",
    what: "FOIR self-cap — informal income",
    value: "30%",
    why: "Cash weeks vanish. A 40% FOIR that a salaried MNC can service will bounce a rider in a slow month.",
    source: "My judgement",
  },
  {
    id: "UNKNOWN_SCORE",
    what: "Unknown credit score",
    value: "Not 300. A wide band.",
    why: "No file is not a defaulted file. Thin-file pricing is its own band; treating 'I don't know' as 300 would invent a stain.",
    source: "My judgement — no file is not a defaulted file",
  },
  {
    id: "UNDOCUMENTED_LENDER_HAIRCUT",
    what: "Lender-recognised income if no ITR",
    value: "55% of stated cash",
    why: "A branch will underwrite documents, not the till. Cash talk without ITR is not bankable rupee-for-rupee.",
    source: "My judgement",
  },
  {
    id: "INFORMAL_LENDER_HAIRCUT",
    what: "Lender-recognised informal income",
    value: "50% of stated",
    why: "Platform payouts plus cash tailoring rarely survive a banker's spreadsheet at face value.",
    source: "My judgement",
  },
  {
    id: "SPOUSE_LENDER_HAIRCUT",
    what: "Co-applicant / spouse income counted by lender",
    value: "70%",
    why: "Most grids haircut the second income unless it is formally added. We do not pretend it is 100%.",
    source: "My judgement",
  },
  {
    id: "VARIABLE_INCOME_COUNT",
    what: "Variable pay counted",
    value: "60% of the variable slice",
    why: "Bonus and incentives are real until the year they are not. Lenders already do this; we copy the conservatism.",
    source: "My judgement, typical salaried grids",
  },
  {
    id: "LTV_LAP",
    what: "LTV on shop / commercial premises",
    value: "50–60%",
    why: "A kirana premises is not a Bandra flat. Commercial / mixed-use LAP is haircut harder than home LTV.",
    source: "My judgement. RBI home LTV ([5] in RULES.md) does not apply to a shop",
  },
  {
    id: "LTV_GOLD",
    what: "LTV on gold",
    value: "65–75%",
    why: "RBI-linked gold-loan practice sits around three-quarters of appraised value; we stay inside that.",
    source: "RBI gold-loan LTV ceiling 75% — RULES.md [3]",
  },
  {
    id: "CONSUMPTION_SAFE_HAIRCUT",
    what: "Safe EMI haircut when the loan buys a party",
    value: "20%",
    why: "A wedding does not earn. The same EMI that is fine on a shop line is a gift to the lender on a mandap.",
    source: "My judgement",
  },
  {
    id: "CONSUMPTION_INCOME_MONTHS_CAP",
    what: "Hard cap on consumption principal",
    value: "6× monthly take-home",
    why: "Beyond six months of pay, the borrower is financing a lifestyle spike with years of interest.",
    source: "My judgement",
  },
  {
    id: "LOW_EMERGENCY_HAIRCUT",
    what: "Safe EMI if emergency savings < 3 months",
    value: "× 0.65",
    why: "The first shock becomes a second loan. Thin savings means the new EMI has no airbag.",
    source: "My judgement",
  },
  {
    id: "UNKNOWN_EMERGENCY",
    what: "Safe EMI if savings months unanswered",
    value: "× 0.85, band widened",
    why: "We do not invent six months of FD. Silence makes the safe number smaller and wider.",
    source: "My judgement",
  },
  {
    id: "PRODUCTIVE_EARN_COUNT",
    what: "Stated extra monthly earn from the loan",
    value: "40% counted",
    why: "Everyone over-forecasts the second stock line. We believe less than half.",
    source: "My judgement",
  },
  {
    id: "BOUNCE",
    what: "A bounce in the last 12 months",
    value: "+3pp rate, lender amount ×0.4–0.7, safe EMI capped at 8% of income; Don't borrow if high-cost debt also sits there",
    why: "A recent bounce is the file talking. Adding another EMI is how people go from late to default.",
    source: "My judgement",
  },
  {
    id: "HIGH_COST_DEBT",
    what: "Existing loan rate at or above",
    value: "24%",
    why: "App / payday paper at 30% is the fire. A new scooter loan is more fuel. Refinance or stop.",
    source: "My judgement",
  },
  {
    id: "FEE_AND_GST",
    what: "Processing fee used for APR",
    value: "Product fee + 18% GST",
    why: "RBI-style all-in cost. A 12% headline with 2% fee is not 12%. We show the IRR on net disbursal.",
    source: "RBI KFS / APR [1]; GST 18% on banking services [2] — see RULES.md",
  },
  {
    id: "STRESS",
    what: "Stress case",
    value: "Income −20% or rate +200 bps (worse of the two for FOIR)",
    why: "India's informal and bonus-linked pay already moves 20%. Rate resets happen. If the first ticket fails stress, I cut the walk-in ask. Safe high stays the normal-month ceiling.",
    source: "My judgement",
  },
  {
    id: "AGE_TENURE",
    what: "Max age at maturity",
    value: "60 unsecured / 70 secured",
    why: "Most Indian grids stop unsecured before retirement and let secured run longer against the asset.",
    source: "Typical bank grids + my judgement",
  },
  {
    id: "TWO_WHEELER_CAP",
    what: "Two-wheeler sanction ceiling",
    value: "₹3,00,000",
    why: "E-scooters cluster at ₹1–1.5L; we do not let a 2W ticket pretend to be a car loan.",
    source: "My judgement",
  },
  {
    id: "PL_FLOOR",
    what: "Personal-loan headline floor",
    value: "10.5%",
    why: "MNC notches can over-cut a 11–13% prime band into home-loan territory. Unsecured Indian PL does not price like a home loan in 2026.",
    source: "My judgement",
  },
  {
    id: "ANITA_SALES_BAND",
    what: "Informal 2W 'Don't borrow' lender band",
    value: "₹70,000–₹1,20,000 sales pitch, ₹0 safe",
    why: "A prudent FOIR on haircut informal income is ~₹0 after existing app EMIs. A scooter counter may still try to book a ticket. Showing ₹0–₹0 would hide the thing she has to refuse tomorrow.",
    source: "My judgement",
  },
  {
    id: "RATES_2026",
    what: "Headline rate bands",
    value: "See RATE_* tables in this file",
    why: "Not a live market feed. Anchored to late-2025 / 2026 public PL, LAP, gold, 2W and home ranges I have seen advertised, then widened for thin files.",
    source: "Anchored to advertised pages in RULES.md [4][6][7], then widened. Not a live feed",
  },
];
