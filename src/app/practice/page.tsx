"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import { assess, formatInr, formatPct, PERSONAS } from "@/engine";
import { useLang } from "@/lib/language";

type Line = { who: "rm" | "you"; text: string };

export default function PracticePage() {
  const { t } = useLang();
  const priya = useMemo(() => assess(PERSONAS[0].answers), []);
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<Line[]>([
    {
      who: "rm",
      text: t(
        `Ma’am, good news. We can sanction ₹8,00,000 personal loan at 14% for 5 years. Shall I print the form?`,
        `Madam, acchi baat. ₹8,00,000 personal loan 14% pe 5 saal. Form nikaalun?`,
      ),
    },
  ]);

  const choices: { label: string; reply: string; rm: string; next: "end-good" | "end-bad" | "mid" }[] = [
    {
      label: t("Show the card — 14% is above fair", "Card dikhao — 14% zyada hai"),
      reply: t(
        `Fair for my file is ${formatPct(priya.headlineRate.low)}–${formatPct(priya.headlineRate.high)}. 14% is yours, not the market. I will take at most ${formatInr(priya.recommendedAmount)} and EMI ${formatInr(priya.emiCeiling)}.`,
        `Mere file pe theek byaj ${formatPct(priya.headlineRate.low)}–${formatPct(priya.headlineRate.high)} hai. 14% aapka target hai. Main ${formatInr(priya.recommendedAmount)} se zyada nahi, EMI ${formatInr(priya.emiCeiling)}.`,
      ),
      rm: t(
        "Ah. Let me check with the desk… we can do 12.25% if the ticket is ₹6.1L. That is closer.",
        "Desk se poochta hoon… ₹6.1L pe 12.25% ho sakta hai. Yeh kareeb hai.",
      ),
      next: "end-good",
    },
    {
      label: t("Ask only for a lower EMI, keep ₹8L", "Sirf EMI kam karo, ₹8L rakho"),
      reply: t("Can we stretch to 5 years so the EMI is smaller? I still want 8 lakh.", "5 saal kar do, EMI kam ho. 8 lakh hi chahiye."),
      rm: t(
        "Yes, 60 months makes the EMI look friendly — and you pay much more interest on a wedding. Your own card warned you about this.",
        "Haan, 60 mahine se EMI pyaari dikhegi — aur shaadi pe byaj zyada. Aapke card ne yahi kaha tha.",
      ),
      next: "end-bad",
    },
    {
      label: t("Say yes and sign", "Haan keh ke sign"),
      reply: t("Okay, print it.", "Theek hai, nikaalo."),
      rm: t(
        "That is how people walk out 4 points over fair. The copilot existed so you would not say this sentence.",
        "Isi tarah log 4 point mehnga nikal jaate hain. Copilot isliye tha ki yeh line na nikle.",
      ),
      next: "end-bad",
    },
  ];

  function pick(c: (typeof choices)[0]) {
    setLines((l) => [
      ...l,
      { who: "you", text: c.reply },
      { who: "rm", text: c.rm },
    ]);
    setStep(c.next === "mid" ? 1 : 2);
  }

  return (
    <Shell>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {t("60 seconds in the branch", "Branch ke 60 second")}
      </p>
      <h1 className="mt-3 text-4xl">{t("Practice on Priya’s desk", "Priya ke desk ki practice")}</h1>
      <p className="mt-3 text-muted">
        {t(
          "The desk will sell the sanction, not the household. Use the card. Wrong answers are allowed — that is how you practise.",
          "Desk sanction bechega, ghar nahi. Card use karo. Galat jawab allowed hai — yahi practice hai.",
        )}
      </p>

      <div className="mt-8 grid gap-3">
        {lines.map((line, i) => (
          <div
            key={`${i}-${line.text.slice(0, 12)}`}
            className={`max-w-[38rem] rounded-2xl px-4 py-3 ${
              line.who === "rm" ? "bg-bg2" : "ml-auto bg-accent-soft"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {line.who === "rm" ? t("Bank desk", "Bank wala") : t("You", "Aap")}
            </p>
            <p className="mt-1">{line.text}</p>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="mt-6 grid gap-2">
          {choices.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => pick(c)}
              className="rounded-xl border border-rule bg-bg px-4 py-3 text-left hover:border-accent"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/result?persona=priya" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink">
            {t("Open Priya’s card", "Priya ka card")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setLines([lines[0]]);
            }}
            className="rounded-full border border-rule px-5 py-2.5 text-sm font-semibold"
          >
            {t("Try again", "Phir se")}
          </button>
        </div>
      )}
    </Shell>
  );
}
