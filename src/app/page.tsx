"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { TermTip } from "@/components/TermTip";
import {
  PERSONAS,
  assess,
  canAssess,
  fileReadiness,
  formatInr,
  formatPct,
  marketBoard,
  productSimple,
  tomorrowPlan,
  verdictSimple,
  type Answers,
  type Assessment,
} from "@/engine";
import { useLang } from "@/lib/language";
import { loadSession } from "@/lib/session";

const SAMPLES = [
  {
    id: "priya",
    need: "Wedding · personal loan",
    line: "Salaried. Wants ₹8L. We will say take less.",
  },
  {
    id: "ravi",
    need: "Shop stock · has a shop",
    line: "No score. Asked for a personal loan — the file should become a shop loan.",
  },
  {
    id: "anita",
    need: "Scooter · existing EMIs",
    line: "A bounce last month. The honest answer is do not borrow.",
  },
] as const;

export default function DashboardPage() {
  const { t } = useLang();
  const [file, setFile] = useState<{
    answers: Answers;
    assessment: Assessment;
    name?: string;
    personaId?: string;
  } | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (!canAssess(session.answers)) return;
    const persona = session.personaId
      ? PERSONAS.find((p) => p.id === session.personaId)
      : undefined;
    setFile({
      answers: session.answers,
      assessment: assess(session.answers),
      name: persona?.name,
      personaId: session.personaId,
    });
  }, []);

  const board = marketBoard();
  const ready = file ? fileReadiness(file.answers) : null;
  const a = file?.assessment;
  const v = a ? verdictSimple(a.verdict) : null;
  const next = file && a ? tomorrowPlan(file.answers, a).slice(0, 3) : [];
  const resultHref = file?.personaId ? `/result?persona=${file.personaId}` : "/result";
  const packHref = file?.personaId ? `/pack?persona=${file.personaId}` : "/pack";

  return (
    <Shell wide>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t("Borrower dashboard", "Borrower dashboard")}
          </p>
          <h1 className="mt-2 text-4xl leading-[1.05] sm:text-5xl">
            {file
              ? t("Your file, at a glance", "Aapki file, ek nazar mein")
              : t("Know your number before they tell you theirs.", "Pehle apna number jaano, phir unka suno.")}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/assess?new=1"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink"
          >
            {file ? t("New check", "Nayi check") : t("Start — 5 minutes", "Shuru — 5 minute")}
          </Link>
          {file && (
            <Link href={resultHref} className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold">
              {t("Open full file", "Poori file")}
            </Link>
          )}
        </div>
      </div>

      {file && a && v && ready ? (
        <section className="mt-8 grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rule bg-bg2 px-5 py-4">
            <div>
              <p className="text-sm text-muted">
                {file.name ? t(`${file.name}’s sample file`, `${file.name} ki sample file`) : t("This tab only — nothing is stored", "Sirf is tab mein — save nahi")}
              </p>
              <p
                className={`mt-1 text-lg font-semibold ${
                  a.verdict === "dont_borrow" ? "text-bad" : "text-accent"
                }`}
              >
                {t(v.en, v.hi)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ReadinessRing score={ready.score} />
              <div className="text-sm">
                <p className="font-semibold">{ready.label}</p>
                <p className="text-muted">
                  {ready.filled}/{ready.total} {t("answers in", "jawab bhari")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label={t("Should you borrow?", "Loan loon?")}
              value={t(v.en, v.hi)}
              hint={productSimple(a.product)}
              alert={a.verdict === "dont_borrow"}
            />
            <Kpi
              label={t("Take this much", "Itna lo")}
              value={formatInr(a.recommendedAmount, true)}
              hint={`${t("Bank may offer", "Bank")} ${formatInr(a.lenderAmount.high, true)}`}
            />
            <Kpi
              label={t("Fair interest", "Theek byaj")}
              value={`${formatPct(a.headlineRate.low)}–${formatPct(a.headlineRate.high)}`}
              hint={`${t("Do not agree above", "Upar mat maanna")} ${formatPct(a.agreeToRate)}`}
            />
            <Kpi
              label={t("Monthly ceiling", "Mahine ki had")}
              value={formatInr(a.emiCeiling)}
              hint={t("Even if they offer a bigger ticket", "Badi ticket pe bhi nahi")}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-rule p-5">
              <h2 className="text-xl">{t("Next three moves", "Agle teen kaam")}</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                {next.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={packHref} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
                  {t("Walk-in pack", "Branch pack")}
                </Link>
                <Link href="/practice" className="rounded-full border border-rule px-4 py-2 text-sm font-semibold">
                  {t("Rehearse the desk", "Desk ki practice")}
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-rule p-5">
              <h2 className="text-xl">{t("Two amounts", "Do raqam")}</h2>
              <p className="mt-3 text-sm text-muted">{t("What they can sell you", "Woh kya bech sakte hain")}</p>
              <p className="font-[family-name:var(--font-display)] text-2xl">
                {formatInr(a.lenderAmount.low, true)}–{formatInr(a.lenderAmount.high, true)}
              </p>
              <p className="mt-3 text-sm text-muted">{t("What you should walk in with", "Yeh number le ke jaao")}</p>
              <p className="font-[family-name:var(--font-display)] text-2xl text-accent">
                {formatInr(a.safeAmount.low, true)}–{formatInr(a.safeAmount.high, true)}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-rule bg-bg2 p-6">
          <p className="max-w-2xl text-lg">
            {t(
              "Answer everyday questions. We tell you four things: should you borrow, how much is safe, what interest is fair, and what monthly payment to agree to. Then you get a one-page card for the branch.",
              "Aam sawaal. Chaar baatein: loan loon, kitna safe, kitna byaj, kitni EMI. Phir ek page ka card.",
            )}
          </p>
          <p className="mt-3 max-w-2xl text-muted">
            {t(
              "No login. We do not save your name or pull a credit report. If you do not know your score, say so.",
              "Login nahi. Naam save nahi. Credit report nahi. Score nahi pata? Wahi keh do.",
            )}
          </p>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl">{t("Today’s fair-rate board", "Aaj ka theek-byaj board")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t(
                "Indicative bands from our rules — not a personal offer. Your file tightens this.",
                "Hamare niyam ki range — aapki offer nahi. File isse tight karti hai.",
              )}
            </p>
          </div>
          <Link href="/studio" className="text-sm text-accent">
            {t("See how a rule moves a number →", "Niyam hilao, number dekho →")}
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {board.map((row) => (
            <article key={row.id} className="rounded-2xl border border-rule p-4">
              <p className="text-sm font-semibold">{row.name}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                {formatPct(row.low)}–{formatPct(row.high)}
              </p>
              <p className="mt-2 text-xs text-muted">{row.tip}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">{t("Tools", "Tools")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["/studio", t("Rate lab", "Rate lab"), t("Move a household rule. Watch three sample files recompute.", "Niyam hilaao. Teen sample files turant badlenge.")],
            ["/compare", t("Side by side", "Saath-saath"), t("Three different lives. Four answers. Same engine.", "Teen alag zindagi. Chaar jawab. Wahi engine.")],
            ["/practice", t("Desk rehearsal", "Desk rehearsal"), t("Someone offers 14% on ₹8L. Practice saying no with the card.", "Koi 14% pe ₹8L de. Card se mana karo.")],
            ["/rules", t("Every rule", "Har niyam"), t("The thresholds behind the numbers, in one table.", "Jo number dikhe, unke peeche yeh table.")],
          ].map(([href, title, body]) => (
            <Link key={href} href={href} className="rounded-2xl border border-rule p-4 hover:border-accent">
              <div className="font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">{t("Open a sample file", "Ek sample file kholo")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t(
            "These are demo borrowers — not your details. Same tool, three honest answers.",
            "Yeh demo files hain — aapki baat nahi. Wahi tool, teen sachche jawab.",
          )}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SAMPLES.map((s) => {
            const p = PERSONAS.find((x) => x.id === s.id)!;
            return (
              <Link
                key={s.id}
                href={`/result?persona=${s.id}`}
                className="rounded-2xl border border-rule bg-bg2 p-4 hover:border-accent"
              >
                <p className="font-[family-name:var(--font-display)] text-2xl">{p.name}</p>
                <p className="text-xs uppercase tracking-wider text-muted">
                  {p.city} · {s.need}
                </p>
                <p className="mt-3 text-sm">{s.line}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-rule p-5">
        <h2 className="text-xl">{t("Words on this dashboard", "Is page ke shabd")}</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <li>
            <TermTip id="EMI" /> — {t("monthly payment", "mahine ki kist")}
          </li>
          <li>
            <TermTip id="APR" /> — {t("real yearly cost after fees", "fees ke baad asli saal ka kharch")}
          </li>
          <li>
            <TermTip id="CIBIL" /> — {t("credit score — unknown is not 300", "score — unknown 300 nahi")}
          </li>
          <li>
            <TermTip id="LAP" /> — {t("loan on your shop or house", "dukan ya ghar par loan")}
          </li>
        </ul>
      </section>
    </Shell>
  );
}

function Kpi({
  label,
  value,
  hint,
  alert = false,
}: {
  label: string;
  value: string;
  hint: string;
  alert?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-rule p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-2 font-[family-name:var(--font-display)] text-2xl leading-tight ${alert ? "text-bad" : ""}`}>
        {value}
      </p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </article>
  );
}

function ReadinessRing({ score }: { score: number }) {
  return (
    <div
      className="grid h-14 w-14 place-items-center rounded-full"
      style={{
        background: `conic-gradient(var(--accent) ${score * 3.6}deg, var(--rule) 0deg)`,
      }}
      aria-label={`${score} percent ready`}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-bg2 text-xs font-semibold">
        {score}
      </span>
    </div>
  );
}
