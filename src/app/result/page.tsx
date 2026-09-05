"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { NegotiationCardView } from "@/components/NegotiationCardView";
import { RangeBar } from "@/components/RangeBar";
import { Shell } from "@/components/Shell";
import { TenureChart } from "@/components/TenureChart";
import { TermTip } from "@/components/TermTip";
import {
  altPath,
  assess,
  canAssess,
  cardShareText,
  checkQuote,
  familyLine,
  firstYearCost,
  formatInr,
  formatPct,
  midpoint,
  moneyPicture,
  papersToCarry,
  productSimple,
  quoteCost,
  refinanceHint,
  tillVsPaper,
  tomorrowPlan,
  verdictSimple,
  waitVsBorrow,
  whatIfEmi,
  type Answers,
  type Assessment,
} from "@/engine";
import { personaById } from "@/engine/personas";
import { useLang } from "@/lib/language";
import { decodePack, encodePack, speakText, stopSpeak } from "@/lib/share";
import { loadSession, saveSession } from "@/lib/session";

export default function ResultPage() {
  return (
    <Suspense fallback={<Shell><p>…</p></Shell>}>
      <ResultInner />
    </Suspense>
  );
}

function ResultInner() {
  const { t, lang } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [view, setView] = useState<{
    assessment: Assessment;
    answers: Answers;
    name?: string;
  } | null>(null);
  const [quote, setQuote] = useState("");
  const [quoteB, setQuoteB] = useState("");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const pack = params.get("pack");
    if (pack) {
      const answers = decodePack(pack);
      if (answers && canAssess(answers)) {
        saveSession({ answers, skipped: [] });
        setView({ assessment: assess(answers), answers });
        return;
      }
    }
    const personaId = params.get("persona");
    if (personaId) {
      const persona = personaById(personaId);
      if (persona) {
        saveSession({ answers: persona.answers, skipped: [], personaId });
        setView({
          assessment: assess(persona.answers),
          answers: persona.answers,
          name: persona.name,
        });
        return;
      }
    }
    const session = loadSession();
    if (!canAssess(session.answers)) {
      router.replace("/assess");
      return;
    }
    const persona = session.personaId ? personaById(session.personaId) : undefined;
    setView({
      assessment: assess(session.answers),
      answers: session.answers,
      name: persona?.name,
    });
  }, [router, params]);

  if (!view) {
    return (
      <Shell>
        <p>{t("Working it out…", "Hisab lag raha hai…")}</p>
      </Shell>
    );
  }

  const a = view.assessment;
  const v = verdictSimple(a.verdict);
  const picture = moneyPicture(view.answers, a);
  const steps = tomorrowPlan(view.answers, a);
  const papers = papersToCarry(a.product, view.answers);
  const refinance = refinanceHint(view.answers);
  const quoted = Number(quote);
  const quoteResult =
    quote !== "" && Number.isFinite(quoted) ? checkQuote(quoted, a) : null;
  const wait = waitVsBorrow(view.answers, a);
  const year1 = firstYearCost(a);
  const alt = altPath(view.answers, a);
  const costA =
    quote !== "" && Number.isFinite(quoted) && quoted > 0 ? quoteCost(quoted, a) : null;
  const quotedB = Number(quoteB);
  const costB =
    quoteB !== "" && Number.isFinite(quotedB) && quotedB > 0 ? quoteCost(quotedB, a) : null;
  const packHref = params.get("persona") ? `/pack?persona=${params.get("persona")}` : "/pack";

  const share = cardShareText(view.name, a);
  const family = familyLine(a);
  const till = tillVsPaper(view.answers);
  const cardHref = params.get("persona") ? `/card?persona=${params.get("persona")}` : "/card";
  const packUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/result?pack=${encodePack(view.answers)}`
      : "";

  return (
    <Shell>
      <p className="text-sm text-muted">
        {t("How sure we are", "Kitna pakka")}: {Math.round(a.confidence * 100)}% ·{" "}
        {a.confidenceLabel === "high"
          ? t("quite sure", "kaafi pakka")
          : a.confidenceLabel === "medium"
            ? t("medium", "beech ka")
            : t("wide range — you skipped some things", "range khuli hai — kuch chhod diya")}
      </p>
      <div
        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
          a.verdict === "dont_borrow"
            ? "bg-accent-soft text-bad"
            : "bg-accent-soft text-accent"
        }`}
      >
        {t(v.en, v.hi)}
      </div>
      <h1 className="mt-3 text-3xl leading-tight">{a.verdictReason}</h1>
      <p className="mt-3 text-muted">{a.confidenceWhy}</p>

      <blockquote className="mt-6 border-l-4 border-accent bg-accent-soft px-4 py-3 font-[family-name:var(--font-display)] text-xl italic">
        {t(family.en, family.hi)}
      </blockquote>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => speakText(t(family.en, family.hi), lang === "hi")}
          className="rounded-full border border-rule px-3 py-1.5 text-sm"
        >
          {t("Hear this line", "Yeh line suno")}
        </button>
        <button
          type="button"
          onClick={() => stopSpeak()}
          className="rounded-full border border-rule px-3 py-1.5 text-sm"
        >
          {t("Stop", "Ruko")}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (packUrl) {
              await navigator.clipboard.writeText(packUrl);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            }
          }}
          className="rounded-full border border-rule px-3 py-1.5 text-sm"
        >
          {linkCopied ? t("Link copied", "Link copy") : t("Copy share link", "Share link copy")}
        </button>
        <Link href={packHref} className="rounded-full border border-rule px-3 py-1.5 text-sm">
          {t("Walk-in pack", "Branch pack")}
        </Link>
        <Link href="/practice" className="rounded-full border border-rule px-3 py-1.5 text-sm">
          {t("Practice the desk", "Desk practice")}
        </Link>
      </div>

      {till && (
        <section className="mt-6 rounded-2xl border border-rule p-5">
          <h2 className="text-xl">{t("Till cash vs tax paper", "Galle ka cash vs ITR")}</h2>
          <p className="mt-2 text-sm text-muted">
            {t(
              "The bank will underwrite the tax return. You have to live on the weak month. That gap is why the two amounts differ.",
              "Bank ITR maanta hai. Ghar kamzor mahine pe chalta hai. Isliye do number alag hain.",
            )}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">{t("Weak month at the till", "Kamzor mahina, galla")}</p>
              <p className="text-2xl">{formatInr(till.till)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">{t("ITR ÷ 12 (what the bank sees)", "ITR ÷ 12 (bank yeh dekhta hai)")}</p>
              <p className="text-2xl">{formatInr(till.paper)}</p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-rule bg-bg2 p-5">
        <h2 className="text-xl">{t("What to do tomorrow", "Kal kya karna hai")}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      {refinance && (
        <section className="mt-4 rounded-2xl border border-rule p-5">
          <h2 className="text-xl">{refinance.title}</h2>
          <p className="mt-2 text-sm">{refinance.body}</p>
        </section>
      )}

      {alt && (
        <section className="mt-4 rounded-2xl border border-rule p-5">
          <h2 className="text-xl">{t(alt.title, "Naye loan se sasta rasta")}</h2>
          <p className="mt-2 text-sm text-muted">{alt.body}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {alt.options.map((o) => (
              <article key={o.name} className="rounded-xl border border-rule bg-bg2 p-3">
                <p className="font-semibold">{o.name}</p>
                <p className="mt-1 text-sm text-muted">{o.why}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {wait.monthlySave > 0 && a.verdict !== "dont_borrow" && (
        <section className="mt-4 rounded-2xl border border-rule p-5">
          <h2 className="text-xl">{t("Wait a few months vs borrow now", "Kuch mahine wait vs abhi lo")}</h2>
          <p className="mt-2 text-sm text-muted">
            {t(
              `If you can put aside ${formatInr(wait.monthlySave)} a month from leftover money, the ticket you need shrinks — and so does the interest.`,
              `Agar mahine ${formatInr(wait.monthlySave)} bacha sako, loan chhota padega — byaj bhi.`,
            )}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {wait.rows.map((row) => (
              <article key={row.months} className="rounded-xl border border-rule bg-bg2 p-4">
                <p className="text-sm text-muted">
                  {t(`After ${row.months} months`, `${row.months} mahine baad`)}
                </p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                  {formatInr(row.newTake)}
                </p>
                <p className="mt-1 text-sm">
                  {t("Saved toward the ask", "Ask ke liye bacha")} {formatInr(row.saved)}
                </p>
                <p className="text-sm text-good">
                  {t("Interest you never pay", "Jo byaj nahi dena")} {formatInr(row.interestSaved)}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {year1 && (
        <section className="mt-4 rounded-2xl border border-rule p-5">
          <h2 className="text-xl">{t("First year — interest vs principal", "Pehla saal — byaj vs asli")}</h2>
          <p className="mt-2 text-sm text-muted">
            {t(
              "On a reducing EMI, year one is mostly interest. That is why a wedding loan is expensive even when the monthly number looks friendly.",
              "EMI mein pehla saal zyada byaj. Isliye shaadi wala loan mehnga padta hai.",
            )}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted">{t("Interest in year 1", "Pehle saal ka byaj")}</p>
              <p className="text-2xl">{formatInr(year1.interest)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">{t("Principal you actually clear", "Jo asli utrega")}</p>
              <p className="text-2xl">{formatInr(year1.principalPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">{t("Still owed after 12 months", "12 mahine baad baki")}</p>
              <p className="text-2xl">{formatInr(year1.leftoverBalance)}</p>
            </div>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-bg2">
            <div
              className="h-full bg-accent"
              style={{
                width: `${Math.min(100, (year1.interest / (year1.interest + year1.principalPaid || 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            {t("Filled bar is interest. The rest is principal.", "Bhari hui line byaj hai. Baaki asli.")}
          </p>
        </section>
      )}

      <div className="mt-6 grid gap-4">
        <Output code="2" title={t("Two amounts — they are not the same", "Do raqam — yeh ek nahi")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted">{t("Bank may offer", "Bank de sakta hai")}</p>
              <p className="font-[family-name:var(--font-display)] text-2xl">
                {formatInr(a.lenderAmount.low)} – {formatInr(a.lenderAmount.high)}
              </p>
              <RangeBar low={a.lenderAmount.low} high={a.lenderAmount.high} />
            </div>
            <div>
              <p className="text-sm text-muted">{t("You should take", "Tumhe itna lena chahiye")}</p>
              <p className="font-[family-name:var(--font-display)] text-2xl">
                {formatInr(a.safeAmount.low)} – {formatInr(a.safeAmount.high)}
              </p>
              <RangeBar
                low={a.safeAmount.low}
                high={Math.max(a.safeAmount.high, a.recommendedAmount)}
                mark={a.recommendedAmount}
                markLabel={t("Use", "Yeh lo")}
              />
            </div>
          </div>
          <p className="mt-3 text-sm">{a.useNumberWhy}</p>
          <details className="mt-2 text-sm text-muted">
            <summary className="cursor-pointer text-accent">
              {t("Why these two numbers?", "Yeh do number kyun?")}
            </summary>
            <p className="mt-2">{a.lenderWhy}</p>
            <p className="mt-2">{a.safeWhy}</p>
          </details>
        </Output>

        <Output code="3" title={t("Fair interest — a range, not one number", "Theek byaj — ek range")}>
          <p className="font-[family-name:var(--font-display)] text-2xl">
            {formatPct(a.headlineRate.low)} – {formatPct(a.headlineRate.high)}
          </p>
          <p className="text-sm text-muted">
            {t("Real yearly cost after fee", "Fee ke baad asli saal ka kharch")} (<TermTip id="APR" />
            ): {formatPct(a.apr.low)} – {formatPct(a.apr.high)}
          </p>
          <p className="mt-2 text-sm">
            {t("Kind of loan", "Loan ki tarah")}: <b>{productSimple(a.product)}</b>.{" "}
            {t("Do not agree above", "Isse upar mat maanna")} <b>{formatPct(a.agreeToRate)}</b>.
          </p>
          <RangeBar
            low={a.headlineRate.low}
            high={a.headlineRate.high}
            mark={a.agreeToRate}
            markLabel={t("Max", "Had")}
            kind="pct"
          />
          <details className="mt-3 text-sm text-muted">
            <summary className="cursor-pointer text-accent">{t("Why this rate?", "Yeh rate kyun?")}</summary>
            <p className="mt-2">{a.rateWhy}</p>
            <p className="mt-2">{a.productReason}</p>
          </details>
        </Output>

        <Output code="4" title={t("Monthly payment you should not cross", "Mahine ki had")}>
          <p className="font-[family-name:var(--font-display)] text-2xl">
            {t("At most", "Zyada se zyada")} {formatInr(a.emiCeiling)} / {t("month", "mahina")}
          </p>
          <p className="text-sm text-muted">
            {t("Suggested amount", "Salah")} {formatInr(a.recommendedAmount)} ·{" "}
            {a.recommendedTenureMonths} {t("months", "mahine")}
          </p>
          <div className="mt-4">
            <TenureChart options={a.tenureOptions} ceiling={a.emiCeiling} />
          </div>
          <WhatIf a={a} />
          <div className="mt-4 rounded-xl border border-rule bg-bg2 p-4">
            <p className="text-sm font-semibold">
              {t("If things go a bit wrong", "Agar thoda bigad jaye")} · {a.stress.title}
            </p>
            <p className="mt-1 text-sm">{a.stress.detail}</p>
            <p className="mt-1 text-sm">
              {t("Then EMI", "Tab EMI")} {formatInr(a.stress.stressedEmi)} ·{" "}
              {t("EMI share of income", "Income ka EMI hissa")} {a.stress.stressedFoirPct}% ·{" "}
              {a.stress.stillFits
                ? t("still okay.", "ab bhi theek.")
                : t("too tight — take less.", "zyada tight — kam lo.")}
            </p>
          </div>
        </Output>
      </div>

      <section className="mt-6 rounded-2xl border border-rule p-5">
        <h2 className="text-xl">{t("Where a month’s money goes", "Mahine ka paisa kahan jaata hai")}</h2>
        <BudgetBars picture={picture} />
      </section>

      <section className="mt-6 rounded-2xl border border-rule p-5">
        <h2 className="text-xl">{t("Two desks, two quotes", "Do desk, do quote")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t(
            "Type the % each desk said. We compare EMI and total interest on your safe ticket — then say fair, okay, or walk away.",
            "Har desk ka % likho. Safe ticket pe EMI aur byaj dikhenge — theek, chalega, ya hato.",
          )}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <QuoteBox
            label={t("Desk A", "Desk A")}
            value={quote}
            onChange={setQuote}
            cost={costA}
            fallback={quoteResult}
          />
          <QuoteBox
            label={t("Desk B", "Desk B")}
            value={quoteB}
            onChange={setQuoteB}
            cost={costB}
          />
        </div>
        {costA && costB && (
          <p className="mt-4 text-sm">
            {costA.interest === costB.interest
              ? t("Same interest on both desks.", "Dono desk pe same byaj.")
              : costA.interest < costB.interest
                ? t(
                    `Desk A is cheaper by ${formatInr(costB.interest - costA.interest)} over the tenure.`,
                    `Desk A ${formatInr(costB.interest - costA.interest)} sasta hai poori tenure pe.`,
                  )
                : t(
                    `Desk B is cheaper by ${formatInr(costA.interest - costB.interest)} over the tenure.`,
                    `Desk B ${formatInr(costA.interest - costB.interest)} sasta hai poori tenure pe.`,
                  )}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-rule p-5">
        <h2 className="text-xl">{t("Papers to take to the branch", "Branch mein kaunse kaagaz le jaana")}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          {papers.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      {a.unansweredCost.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl">{t("What you skipped, and what it cost", "Jo chhoda, uska asar")}</h2>
          <ul className="mt-3 list-disc pl-5 text-sm">
            {a.unansweredCost.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {a.assumptions.length > 0 && (
        <section className="mt-6">
          <h2 className="text-2xl">{t("Where we guessed", "Jahan andaza kiya")}</h2>
          <ul className="mt-3 list-disc pl-5 text-sm text-muted">
            {a.assumptions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">{t("Card to hold up", "Dikhane wala card")}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(share);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="rounded-full border border-rule px-4 py-2 text-sm font-semibold"
            >
              {copied ? t("Copied", "Copy ho gaya") : t("Copy text", "Text copy")}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(share)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-rule px-4 py-2 text-sm font-semibold"
            >
              WhatsApp
            </a>
            <Link
              href={cardHref}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
            >
              {t("Print / save PDF", "Print / PDF")}
            </Link>
          </div>
        </div>
        <NegotiationCardView card={a.card} name={view.name} />
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/assess" className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold">
          {t("Change an answer", "Koi jawab badlo")}
        </Link>
        <Link href="/rules" className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold">
          {t("See the rules", "Niyam dekho")}
        </Link>
      </div>
    </Shell>
  );
}

function WhatIf({ a }: { a: Assessment }) {
  const { t } = useLang();
  const rate = midpoint(a.headlineRate.low, a.headlineRate.high);
  const [amount, setAmount] = useState(Math.max(a.recommendedAmount, 50_000));
  const [months, setMonths] = useState(a.recommendedTenureMonths);
  const preview = useMemo(
    () => whatIfEmi(amount, rate, months, a.emiCeiling),
    [amount, rate, months, a.emiCeiling],
  );
  const maxAmt = Math.max(a.lenderAmount.high, a.safeAmount.high, amount, 100_000);

  return (
    <div className="mt-5 rounded-xl border border-rule p-4">
      <p className="font-semibold">{t("Play with the number", "Number ke saath khelo")}</p>
      <p className="mt-1 text-sm text-muted">
        {t("Move the sliders. Red means you crossed your monthly ceiling.", "Slider hilaao. Laal matlab had paar.")}
      </p>
      <label className="mt-3 grid gap-1 text-sm">
        {t("Loan amount", "Loan ki raqam")} · {formatInr(amount)}
        <input
          type="range"
          min={50_000}
          max={maxAmt}
          step={10_000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </label>
      <label className="mt-3 grid gap-1 text-sm">
        {t("Years", "Saal")} · {preview.years}
        <input
          type="range"
          min={12}
          max={Math.max(12, ...a.tenureOptions.map((o) => o.months))}
          step={12}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
        />
      </label>
      <p className={`mt-3 text-lg ${preview.over ? "text-bad" : "text-ink"}`}>
        <TermTip id="EMI" /> {formatInr(preview.monthly)} / {t("month", "mahina")}
        {preview.over ? t(" — over your ceiling", " — had se zyada") : ""}
      </p>
    </div>
  );
}

function BudgetBars({
  picture,
}: {
  picture: ReturnType<typeof moneyPicture>;
}) {
  const { t } = useLang();
  const total = Math.max(picture.income, 1);
  return (
    <div className="mt-4 grid gap-3">
      {picture.slices.map((s) => (
        <div key={s.id}>
          <div className="flex justify-between text-sm">
            <span>{s.label}</span>
            <span className="num">{formatInr(s.amount)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg2">
            <div
              className={`h-full ${s.id === "left" ? "bg-good" : s.id === "new" ? "bg-accent" : "bg-muted"}`}
              style={{ width: `${Math.min(100, (s.amount / total) * 100)}%` }}
            />
          </div>
        </div>
      ))}
      {picture.leftover < 0 && (
        <p className="text-sm text-bad">
          {t(
            "This month already does not add up. A new loan would come from food or school.",
            "Mahina pehle se minus hai. Naya loan khane ya school se kateega.",
          )}
        </p>
      )}
    </div>
  );
}

function QuoteBox({
  label,
  value,
  onChange,
  cost,
  fallback,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  cost: ReturnType<typeof quoteCost> | null;
  fallback?: ReturnType<typeof checkQuote> | null;
}) {
  const tone = cost?.check.tone ?? fallback?.tone;
  const title = cost?.check.title ?? fallback?.title;
  const body = cost?.check.body ?? fallback?.body;
  return (
    <div className="rounded-xl border border-rule bg-bg2 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="14"
        className="mt-3 w-full rounded-xl border border-rule bg-bg px-3 py-2 font-[family-name:var(--font-mono)]"
      />
      {cost && (
        <p className="mt-2 text-sm">
          EMI {formatInr(cost.monthly)} · {formatInr(cost.interest)} interest
        </p>
      )}
      {title && (
        <p
          className={`mt-2 text-sm ${
            tone === "bad" ? "text-bad" : tone === "good" ? "text-good" : "text-ink"
          }`}
        >
          <b>{title}.</b> {body}
        </p>
      )}
    </div>
  );
}

function Output({
  code,
  title,
  children,
}: {
  code: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-rule p-5">
      <p className="text-xs uppercase tracking-wider text-accent">{code}</p>
      <h2 className="mt-1 text-xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
