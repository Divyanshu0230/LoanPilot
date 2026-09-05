"use client";

import type { NegotiationCard } from "@/engine";
import { formatInr, formatPct } from "@/engine";
import { useLang } from "@/lib/language";

export function NegotiationCardView({
  card,
  name,
}: {
  card: NegotiationCard;
  name?: string;
}) {
  const { t } = useLang();
  return (
    <article className="print-sheet relative overflow-hidden rounded-2xl border border-ink bg-bg p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-2 top-10 rotate-12 rounded-full border-2 border-accent/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent/70">
        {t("Not a bank letter", "Bank ka letter nahi")}
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {t("Card to hold up at the desk", "Desk pe dikhane wala card")}
      </p>
      <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl leading-tight">
        {card.headline}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {name ? `${name} · ` : ""}
        {card.profileLine}
      </p>

      <dl className="mt-6 grid gap-3 border-t border-rule pt-4 text-sm">
        <Row k={t("I will ask for", "Itna maangunga")} v={formatInr(card.askAmount)} />
        <Row k={t("I will not take more than", "Isse zyada nahi loonga")} v={formatInr(card.walkAwayAmount)} />
        <Row
          k={t("I will not pay more EMI than", "EMI itne se upar nahi")}
          v={`${formatInr(card.walkAwayEmi)} / ${t("month", "mahina")}`}
        />
        <Row
          k={t("Fair interest", "Theek byaj")}
          v={`${formatPct(card.fairRate.low)} – ${formatPct(card.fairRate.high)}`}
        />
        <Row
          k={t("Real yearly cost (fee included)", "Asli saal ka kharch (fee ke saath)")}
          v={`${formatPct(card.fairApr.low)} – ${formatPct(card.fairApr.high)}`}
        />
        <Row k={t("I walk away if they say more than", "Itne se upar bolo toh uth jaunga")} v={formatPct(card.walkAwayRate)} />
      </dl>

      <div className="mt-5 rounded-xl bg-accent-soft px-4 py-3">
        <p className="text-sm font-semibold text-accent">
          {t("If they say 14% and this card says less", "Agar woh 14% bole aur card kam kahe")}
        </p>
        <p className="mt-1 text-sm">{card.compareLine}</p>
      </div>

      <p className="mt-4 text-sm">
        <b>{t("Ask for", "Yeh maango")}:</b> {card.productInsist}
      </p>
      <p className="mt-1 text-sm">
        <b>{t("Say no to", "Isse inkaar")}:</b> {card.productRefuse}
      </p>
      <p className="mt-4 text-sm">{card.because}</p>
      <p className="mt-2 text-sm text-muted">{card.stressLine}</p>
      <p className="mt-6 font-[family-name:var(--font-display)] italic text-muted">
        {t(
          "This is your homework, not a bank letter. No credit report was pulled.",
          "Yeh aapka ghar ka hisaab hai, bank ka letter nahi. Credit report nahi nikali.",
        )}
      </p>
    </article>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="num text-right font-semibold">{v}</dd>
    </div>
  );
}
