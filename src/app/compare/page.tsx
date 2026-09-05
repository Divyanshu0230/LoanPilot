"use client";

import Link from "next/link";
import { Shell } from "@/components/Shell";
import {
  PERSONAS,
  assess,
  formatInr,
  formatPct,
  productSimple,
  verdictSimple,
} from "@/engine";
import { useLang } from "@/lib/language";

export default function ComparePage() {
  const { t } = useLang();
  const rows = PERSONAS.map((p) => ({ p, a: assess(p.answers) }));

  return (
    <Shell wide>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {t("Sample files, side by side", "Sample files, saath-saath")}
      </p>
      <h1 className="mt-3 text-4xl">{t("Three lives. One engine.", "Teen zindagi. Ek engine.")}</h1>
      <p className="mt-3 max-w-2xl text-muted">
        {t(
          "Same questions, different households. Watch the two amounts, the Don’t-borrow call, and a shop loan instead of a costlier personal loan.",
          "Wahi sawaal, alag ghar. Do raqam, mat-lo, aur dukan loan — mehnga personal loan nahi.",
        )}
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-ink text-xs uppercase tracking-wider text-muted">
              <th className="py-3 pr-3">{t("Question", "Sawaal")}</th>
              {rows.map(({ p }) => (
                <th key={p.id} className="py-3 pr-3">
                  <Link href={`/result?persona=${p.id}`} className="text-accent">
                    {p.name}
                  </Link>
                  <div className="font-normal normal-case tracking-normal text-muted">{p.city}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              [t("Should they borrow?", "Loan lein?"), ...rows.map(({ a }) => t(verdictSimple(a.verdict).en, verdictSimple(a.verdict).hi))],
              [t("Kind of loan", "Kaunsa loan"), ...rows.map(({ a }) => productSimple(a.product))],
              [t("Bank may offer", "Bank de"), ...rows.map(({ a }) => `${formatInr(a.lenderAmount.low)} – ${formatInr(a.lenderAmount.high)}`)],
              [t("They should take", "Lena chahiye"), ...rows.map(({ a }) => `${formatInr(a.safeAmount.low)} – ${formatInr(a.safeAmount.high)}`)],
              [t("Fair interest", "Theek byaj"), ...rows.map(({ a }) => `${formatPct(a.headlineRate.low)}–${formatPct(a.headlineRate.high)}`)],
              [t("Monthly ceiling", "Mahine ki had"), ...rows.map(({ a }) => formatInr(a.emiCeiling))],
              [t("Score known?", "Score pata?"), "780", t("Unknown — not 300", "Unknown — 300 nahi"), t("Unknown — not 300", "Unknown — 300 nahi")],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-rule align-top">
                {row.map((cell, i) => (
                  <td key={`${row[0]}-${i}`} className={`py-3 pr-3 ${i === 0 ? "font-semibold" : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
