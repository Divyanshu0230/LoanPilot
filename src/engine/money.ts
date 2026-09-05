export function monthlyRate(annualPct: number): number {
  return annualPct / 100 / 12;
}

export function emi(principal: number, annualPct: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = monthlyRate(annualPct);
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return (principal * r * pow) / (pow - 1);
}

export function principalFromEmi(
  monthlyEmi: number,
  annualPct: number,
  months: number,
): number {
  if (monthlyEmi <= 0 || months <= 0) return 0;
  const r = monthlyRate(annualPct);
  if (r === 0) return monthlyEmi * months;
  const pow = Math.pow(1 + r, months);
  return (monthlyEmi * (pow - 1)) / (r * pow);
}

/** All-in annual percentage rate: fee is deducted at disbursal, EMIs are on the sanctioned principal. */
export function allInApr(
  principal: number,
  annualPct: number,
  months: number,
  feePct: number,
): number {
  if (principal <= 0 || months <= 0) return annualPct;
  const net = principal * (1 - feePct / 100);
  const payment = emi(principal, annualPct, months);
  return irrToAnnualPct(net, payment, months);
}

function irrToAnnualPct(pv: number, pmt: number, n: number): number {
  if (pv <= 0 || pmt <= 0) return 0;
  let r = 0.015;
  for (let i = 0; i < 50; i++) {
    const pn = Math.pow(1 + r, n);
    const f = (pmt * (1 - 1 / pn)) / r - pv;
    const df =
      pmt * ((1 / pn - 1) / (r * r) + n / (pn * (1 + r) * r));
    const next = r - f / df;
    if (!Number.isFinite(next) || next <= -0.99) break;
    if (Math.abs(next - r) < 1e-9) {
      r = next;
      break;
    }
    r = next;
  }
  return (Math.pow(1 + r, 12) - 1) * 100;
}

export function totalInterest(
  principal: number,
  annualPct: number,
  months: number,
): number {
  return emi(principal, annualPct, months) * months - principal;
}

export function roundTo(n: number, nearest: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / nearest) * nearest;
}

export function roundAmount(n: number): number {
  if (n <= 0) return 0;
  if (n >= 500_000) return roundTo(n, 10_000);
  if (n >= 50_000) return roundTo(n, 5_000);
  return roundTo(n, 1_000);
}

export function roundEmi(n: number): number {
  if (n <= 0) return 0;
  return roundTo(n, 500);
}

/** Accepts 800000, 8L, 8 lakh, 1.5Cr. */
export function parseInrInput(raw: string): number {
  const t = raw.trim().toLowerCase().replace(/₹/g, "").replace(/,/g, "").replace(/\s+/g, "");
  const thousand = t.match(/^([\d.]+)k$/);
  if (thousand) return Number(thousand[1]) * 1_000;
  const lakh = t.match(/^([\d.]+)(l|lac|lakh)s?$/);
  if (lakh) return Number(lakh[1]) * 100_000;
  const cr = t.match(/^([\d.]+)(cr|crore)s?$/);
  if (cr) return Number(cr[1]) * 10_000_000;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

export function formatInr(n: number, compact = false): string {
  if (!Number.isFinite(n)) return "—";
  if (compact && Math.abs(n) >= 100_000) {
    const lakhs = n / 100_000;
    const digits = lakhs >= 10 ? 1 : 2;
    return `₹${lakhs.toFixed(digits)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function midpoint(low: number, high: number): number {
  return (low + high) / 2;
}

/** First year of a reducing-balance EMI: how much is interest vs principal. */
export function yearOneSplit(
  principal: number,
  annualPct: number,
  months: number,
): {
  interest: number;
  principalPaid: number;
  leftoverBalance: number;
  monthly: number;
} {
  if (principal <= 0 || months <= 0) {
    return { interest: 0, principalPaid: 0, leftoverBalance: 0, monthly: 0 };
  }
  const monthly = emi(principal, annualPct, months);
  const r = monthlyRate(annualPct);
  let bal = principal;
  let interest = 0;
  const n = Math.min(12, months);
  for (let i = 0; i < n; i++) {
    const int = bal * r;
    const prin = Math.min(bal, monthly - int);
    interest += int;
    bal -= prin;
  }
  return {
    interest: Math.round(interest),
    principalPaid: Math.round(principal - bal),
    leftoverBalance: Math.round(Math.max(0, bal)),
    monthly: roundEmi(monthly),
  };
}
