"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { QuestionForm } from "@/components/QuestionForm";
import { Shell } from "@/components/Shell";
import {
  canAssess,
  computeConfidence,
  mustComplete,
  nextQuestion,
  progress,
  type Answers,
  type QuestionId,
} from "@/engine";
import { applyAnswer } from "@/lib/applyAnswer";
import { useLang } from "@/lib/language";
import { clearSession, loadSession, saveSession, type SessionState } from "@/lib/session";

export default function AssessPage() {
  return (
    <Suspense fallback={<Shell><p>…</p></Shell>}>
      <AssessInner />
    </Suspense>
  );
}

function AssessInner() {
  const { t, lang } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [skipped, setSkipped] = useState<QuestionId[]>([]);
  const [stack, setStack] = useState<SessionState[]>([]);
  const [personaId, setPersonaId] = useState<string | undefined>();
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    if (params.get("new") === "1") {
      clearSession();
      const fresh = loadSession();
      setAnswers(fresh.answers);
      setSkipped([]);
      setPersonaId(undefined);
      setStack([]);
      return;
    }
    const session = loadSession();
    setAnswers(session.answers);
    setSkipped(session.skipped);
    setPersonaId(session.personaId);
  }, [params]);

  const current = useMemo(
    () => (answers ? nextQuestion(answers, skipped) : null),
    [answers, skipped],
  );
  const stats = answers ? progress(answers, skipped) : null;
  const conf = answers && mustComplete(answers) ? computeConfidence(answers) : null;
  const ready = answers ? canAssess(answers) : false;
  const mustDone = answers ? mustComplete(answers) : false;
  const extrasLeft = Boolean(current && current.tier === "additional");

  function persist(next: Answers, skip: QuestionId[]) {
    setAnswers(next);
    setSkipped(skip);
    saveSession({ answers: next, skipped: skip, personaId });
  }

  function pushUndo() {
    if (!answers) return;
    setStack((s) => [...s, { answers, skipped }]);
  }

  function answer(value: unknown) {
    if (!answers || !current) return;
    pushUndo();
    persist(applyAnswer(answers, current.id, value), skipped);
  }

  function skip() {
    if (!answers || !current || current.tier === "must") return;
    pushUndo();
    persist(answers, [...skipped, current.id]);
  }

  function back() {
    const prev = stack[stack.length - 1];
    if (!prev) {
      router.push("/");
      return;
    }
    setStack((s) => s.slice(0, -1));
    persist(prev.answers, prev.skipped);
  }

  function seeNumbers() {
    if (answers) saveSession({ answers, skipped, personaId });
    router.push("/result");
  }

  if (!answers) {
    return (
      <Shell>
        <p>{t("Loading…", "Lag raha hai…")}</p>
      </Shell>
    );
  }

  if (!current) {
    return (
      <Shell>
        <h1 className="text-3xl">{t("That’s enough.", "Itna kaafi hai.")}</h1>
        <p className="mt-3 text-muted">
          {t("We can work out your numbers now.", "Ab aapke number nikal sakte hain.")}
        </p>
        <button
          onClick={seeNumbers}
          className="mt-6 rounded-full bg-accent px-5 py-3 font-semibold text-accent-ink"
        >
          {t("Show my numbers", "Mere number dikhao")}
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between text-sm text-muted">
        <button type="button" onClick={back} className="hover:text-ink">
          {t("Back", "Peeche")}
        </button>
        <button
          type="button"
          onClick={() => {
            clearSession();
            setAnswers(loadSession().answers);
            setSkipped([]);
            setStack([]);
          }}
          className="hover:text-ink"
        >
          {t("Start over", "Naye se")}
        </button>
      </div>

      {showTip && stats && stats.mustDone === 0 && (
        <div className="mb-6 rounded-2xl border border-rule bg-bg2 p-4">
          <p className="font-semibold">{t("How this works", "Yeh kaise chalta hai")}</p>
          <p className="mt-1 text-sm text-muted">
            {t(
              "About 9 simple questions first. Then a few extra only if they change your number. You can skip extras. “I don’t know” is a valid answer.",
              "Pehle 9 aasaan sawaal. Phir kuch extra, sirf agar number badle. Extra skip kar sakte ho. “Pata nahi” bhi jawab hai.",
            )}
          </p>
          <button type="button" onClick={() => setShowTip(false)} className="mt-2 text-sm text-accent">
            {t("Got it", "Samajh gaya")}
          </button>
        </div>
      )}

      {stats && (
        <p className="text-sm text-muted">
          {current.tier === "must"
            ? t("Needed question", "Zaroori sawaal")
            : t("Extra — makes the number tighter", "Extra — number aur saaf")}{" "}
          · {stats.mustDone}/{stats.mustTotal} {t("done", "ho gaye")}
        </p>
      )}

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-bg2">
        <div
          className="h-full bg-accent"
          style={{
            width: `${stats ? ((stats.mustDone + stats.addDone) / Math.max(1, stats.mustTotal + stats.addTotal)) * 100 : 0}%`,
          }}
        />
      </div>

      <h1 className="mt-5 text-3xl leading-tight">
        {lang === "hi" ? current.promptHi : current.prompt}
      </h1>
      <p className="mt-2 max-w-xl text-muted">
        {lang === "hi" ? current.helpHi : current.help}
      </p>

      <div className="mt-6">
        <QuestionForm key={current.id} question={current} onSubmit={answer} />
      </div>

      {current.tier === "additional" && (
        <button type="button" onClick={skip} className="mt-4 text-sm text-muted underline">
          {t("Skip — I’ll stay with a wider range", "Skip — range thodi khuli rahegi")}
        </button>
      )}

      {mustDone && extrasLeft && (
        <div className="mt-8 rounded-2xl border border-rule bg-bg2 p-4">
          <p className="font-semibold">{t("You can stop here", "Yahin ruk sakte ho")}</p>
          <p className="mt-1 text-sm text-muted">
            {t(
              "The extra questions only tighten the numbers. Skip any you don’t want.",
              "Extra sawaal sirf number saaf karte hain. Jo nahi dena, skip.",
            )}
          </p>
          {conf && (
            <p className="mt-2 text-sm">
              {t("How sure we are", "Kitna pakka")}: {Math.round(conf.confidence * 100)}%
            </p>
          )}
          <button
            type="button"
            onClick={seeNumbers}
            disabled={!ready}
            className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-40"
          >
            {t("See my numbers now", "Ab number dikhao")}
          </button>
        </div>
      )}

      <p className="mt-10 text-sm text-muted">
        <Link href="/rules" className="text-accent underline">
          {t("Want to see the rules behind this?", "Peeche ke niyam dekhne hain?")}
        </Link>
      </p>
    </Shell>
  );
}
