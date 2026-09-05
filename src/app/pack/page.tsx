"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { NegotiationCardView } from "@/components/NegotiationCardView";
import { Shell } from "@/components/Shell";
import {
  assess,
  canAssess,
  familyLine,
  formatInr,
  formatPct,
  papersToCarry,
  tomorrowPlan,
  type Answers,
  type Assessment,
} from "@/engine";
import { personaById } from "@/engine/personas";
import { useLang } from "@/lib/language";
import { loadSession } from "@/lib/session";

export default function PackPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <p>…</p>
        </Shell>
      }
    >
      <PackInner />
    </Suspense>
  );
}

function PackInner() {
  const { t } = useLang();
  const params = useSearchParams();
  const [view, setView] = useState<{
    assessment: Assessment;
    answers: Answers;
    name?: string;
  } | null>(null);
  const [ticked, setTicked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const personaId = params.get("persona");
    if (personaId) {
      const persona = personaById(personaId);
      if (persona) {
        setView({
          assessment: assess(persona.answers),
          answers: persona.answers,
          name: persona.name,
        });
        return;
      }
    }
    const session = loadSession();
    if (canAssess(session.answers)) {
      const persona = session.personaId ? personaById(session.personaId) : undefined;
      setView({
        assessment: assess(session.answers),
        answers: session.answers,
        name: persona?.name,
      });
    }
  }, [params]);

  if (!view) {
    return (
      <Shell>
        <h1 className="text-4xl">{t("Walk-in pack", "Branch pack")}</h1>
        <p className="mt-3 text-muted">
          {t("Finish a check first. Then this page is what you carry tomorrow.", "Pehle check khatam karo. Kal yahi le ke jaana.")}
        </p>
        <Link href="/assess?new=1" className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink">
          {t("Start a check", "Check shuru")}
        </Link>
      </Shell>
    );
  }

  const { assessment: a, answers, name } = view;
  const family = familyLine(a);
  const steps = tomorrowPlan(answers, a);
  const papers = papersToCarry(a.product, answers);
  const packed = papers.filter((p) => ticked[p]).length;

  return (
    <Shell>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {t("What you carry tomorrow", "Kal kya le ke jaana")}
      </p>
      <h1 className="mt-3 text-4xl">
        {name
          ? t(`${name}’s walk-in pack`, `${name} ka branch pack`)
          : t("Walk-in pack", "Branch pack")}
      </h1>
      <p className="mt-3 text-muted">
        {t(
          "Four numbers, the papers, and the card. Show this page or print it. We never stored your name.",
          "Chaar number, kaagaz, card. Dikhao ya print. Naam save nahi kiya.",
        )}
      </p>

      <blockquote className="mt-6 border-l-4 border-accent bg-accent-soft px-4 py-3 font-[family-name:var(--font-display)] text-xl italic">
        {t(family.en, family.hi)}
      </blockquote>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <PackNum
          label={t("Ask for", "Maango")}
          value={formatInr(a.recommendedAmount)}
        />
        <PackNum
          label={t("Walk away above", "Isse upar hato")}
          value={formatInr(a.card.walkAwayAmount)}
        />
        <PackNum
          label={t("EMI ceiling", "EMI had")}
          value={formatInr(a.emiCeiling)}
        />
        <PackNum
          label={t("Fair rate", "Theek byaj")}
          value={`${formatPct(a.headlineRate.low)}–${formatPct(a.headlineRate.high)}`}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-rule p-5">
        <h2 className="text-xl">{t("Say this at the desk", "Desk pe yeh bolo")}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-2xl border border-rule p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl">{t("Papers in the bag", "Bag mein kaagaz")}</h2>
          <p className="text-sm text-muted">
            {packed}/{papers.length} {t("packed", "pack ho gaye")}
          </p>
        </div>
        <ul className="mt-3 grid gap-2">
          {papers.map((p) => (
            <li key={p}>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={!!ticked[p]}
                  onChange={() => setTicked((prev) => ({ ...prev, [p]: !prev[p] }))}
                />
                <span>{p}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl">{t("Hold this up", "Yeh dikhao")}</h2>
        <NegotiationCardView card={a.card} name={name} />
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={name ? `/card?persona=${params.get("persona")}` : "/card"} className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink">
          {t("Print / PDF", "Print / PDF")}
        </Link>
        <Link href={name ? `/result?persona=${params.get("persona")}` : "/result"} className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold">
          {t("Back to full file", "Poori file")}
        </Link>
      </div>
    </Shell>
  );
}

function PackNum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-rule p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">{value}</p>
    </div>
  );
}
