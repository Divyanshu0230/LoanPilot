"use client";

import { useMemo, useState } from "react";
import type { CollateralType, CreditBand, Question } from "@/engine";
import { formatInr, parseInrInput } from "@/engine";
import { useLang } from "@/lib/language";

type CreditValue = { band: CreditBand; score?: number };
type CashValue = { low: number; high: number };
type CollateralValue = { type: CollateralType; value: number };

export function QuestionForm({
  question,
  onSubmit,
}: {
  question: Question;
  onSubmit: (value: unknown) => void;
}) {
  const { lang, t } = useLang();

  if (question.kind === "choice") {
    return (
      <div className="grid gap-2">
        {question.options?.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSubmit(opt.value)}
            className="rounded-xl border border-rule bg-bg2 px-4 py-3 text-left text-lg hover:border-accent hover:bg-accent-soft"
          >
            {lang === "hi" && opt.labelHi ? opt.labelHi : opt.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.kind === "credit") return <CreditField onSubmit={onSubmit} />;
  if (question.kind === "cashRange") return <CashRangeField onSubmit={onSubmit} />;
  if (question.kind === "collateral") return <CollateralField onSubmit={onSubmit} />;

  return (
    <NumberField
      kind={question.kind}
      min={question.min}
      max={question.max}
      step={question.step}
      unitLabel={question.unitLabel}
      onSubmit={onSubmit}
      continueLabel={t("Continue", "Aage")}
    />
  );
}

function NumberField({
  kind,
  min = 0,
  max,
  step = 1,
  unitLabel,
  onSubmit,
  continueLabel,
}: {
  kind: Question["kind"];
  min?: number;
  max?: number;
  step?: number;
  unitLabel?: string;
  onSubmit: (value: number) => void;
  continueLabel: string;
}) {
  const { t } = useLang();
  const [raw, setRaw] = useState("");
  const parsed = kind === "inr" ? parseInrInput(raw) : Number(raw.replace(/,/g, ""));
  const ok = raw !== "" && Number.isFinite(parsed) && parsed >= min && (max == null || parsed <= max);
  const chips =
    kind === "inr"
      ? [
          [50_000, "₹50k"],
          [100_000, "₹1L"],
          [200_000, "₹2L"],
          [500_000, "₹5L"],
          [800_000, "₹8L"],
          [1_500_000, "₹15L"],
        ]
      : [];

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onSubmit(parsed);
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm text-muted">
          {kind === "inr"
            ? t("Amount — you can type 8L for ₹8 lakh", "Raqam — 8L likho toh ₹8 lakh")
            : kind === "percent"
              ? t("Percent", "Percent")
              : unitLabel ?? t("Number", "Number")}
        </span>
        <input
          autoFocus
          inputMode="decimal"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-xl border border-rule bg-bg px-4 py-3 font-[family-name:var(--font-mono)] text-xl"
          placeholder={kind === "inr" ? "8L or 800000" : kind === "percent" ? "12" : "0"}
        />
      </label>
      {kind === "inr" && (
        <div className="flex flex-wrap gap-2">
          {chips.map(([n, label]) => (
            <button
              key={String(n)}
              type="button"
              onClick={() => setRaw(String(n))}
              className="rounded-full border border-rule px-3 py-1 text-sm hover:border-accent"
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {ok && kind === "inr" && <p className="text-sm text-accent">{formatInr(parsed)}</p>}
      {ok && kind === "percent" && <p className="text-sm text-accent">{parsed}%</p>}
      <button
        disabled={!ok}
        className="rounded-full bg-accent px-5 py-3 font-semibold text-accent-ink disabled:opacity-40"
      >
        {continueLabel}
      </button>
    </form>
  );
}

function CreditField({ onSubmit }: { onSubmit: (value: CreditValue) => void }) {
  const { t } = useLang();
  const [mode, setMode] = useState<"unknown" | "band" | "exact">("unknown");
  const [band, setBand] = useState<CreditBand>("750_799");
  const [score, setScore] = useState("780");

  const bands: { id: CreditBand; label: string }[] = [
    { id: "below_650", label: "Below 650" },
    { id: "650_699", label: "650–699" },
    { id: "700_749", label: "700–749" },
    { id: "750_799", label: "750–799" },
    { id: "800_plus", label: "800+" },
  ];

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        {(
          [
            ["unknown", t("I don’t know — that’s okay", "Pata nahi — koi baat nahi")],
            ["band", t("I know the range", "Range pata hai")],
            ["exact", t("I know the exact number", "Exact number pata hai")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`rounded-xl border px-4 py-3 text-left ${
              mode === id ? "border-accent bg-accent-soft" : "border-rule bg-bg2"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "band" && (
        <div className="flex flex-wrap gap-2">
          {bands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBand(b.id)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                band === b.id ? "border-accent bg-accent text-accent-ink" : "border-rule"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}
      {mode === "exact" && (
        <input
          inputMode="numeric"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="rounded-xl border border-rule bg-bg px-4 py-3 font-[family-name:var(--font-mono)]"
          placeholder="780"
        />
      )}
      <button
        type="button"
        className="rounded-full bg-accent px-5 py-3 font-semibold text-accent-ink"
        onClick={() => {
          if (mode === "unknown") onSubmit({ band: "unknown" });
          else if (mode === "band") onSubmit({ band });
          else onSubmit({ band: "exact", score: Number(score) });
        }}
      >
        {t("Continue", "Aage")}
      </button>
    </div>
  );
}

function CashRangeField({ onSubmit }: { onSubmit: (value: CashValue) => void }) {
  const { t } = useLang();
  const [low, setLow] = useState("");
  const [high, setHigh] = useState("");
  const l = parseInrInput(low);
  const h = parseInrInput(high);
  const ok = l > 0 && h >= l;
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onSubmit({ low: l, high: h });
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm text-muted">{t("Weak month", "Kamzor mahina")}</span>
        <input
          inputMode="decimal"
          value={low}
          onChange={(e) => setLow(e.target.value)}
          placeholder="40000 or 40k"
          className="rounded-xl border border-rule bg-bg px-4 py-3 font-[family-name:var(--font-mono)]"
        />
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-muted">{t("Strong month", "Accha mahina")}</span>
        <input
          inputMode="decimal"
          value={high}
          onChange={(e) => setHigh(e.target.value)}
          placeholder="80000 or 80k"
          className="rounded-xl border border-rule bg-bg px-4 py-3 font-[family-name:var(--font-mono)]"
        />
      </label>
      {ok && (
        <p className="text-sm text-accent">
          {t(
            `We will plan your EMI on ${formatInr(l)}, not the strong month.`,
            `EMI ${formatInr(l)} wale mahine pe. Accha mahina nahi.`,
          )}
        </p>
      )}
      <button disabled={!ok} className="rounded-full bg-accent px-5 py-3 font-semibold text-accent-ink disabled:opacity-40">
        {t("Continue", "Aage")}
      </button>
    </form>
  );
}

function CollateralField({ onSubmit }: { onSubmit: (value: CollateralValue) => void }) {
  const { t } = useLang();
  const [type, setType] = useState<CollateralType>("none");
  const [value, setValue] = useState("");
  const types: { id: CollateralType; label: string }[] = [
    { id: "none", label: t("Nothing I will pledge", "Kuch girvi nahi rakhna") },
    { id: "shop", label: t("My shop", "Meri dukan") },
    { id: "residential", label: t("A house or flat", "Ghar ya flat") },
    { id: "commercial", label: t("Other property", "Aur koi property") },
    { id: "gold", label: t("Gold jewellery", "Sone ke zewar") },
    { id: "vehicle", label: t("A vehicle", "Gaadi") },
  ];
  const amount = parseInrInput(value);
  const ok = type === "none" || (Number.isFinite(amount) && amount > 0);
  const preview = useMemo(
    () => (Number.isFinite(amount) && amount > 0 ? formatInr(amount) : null),
    [amount],
  );

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        {types.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setType(item.id)}
            className={`rounded-xl border px-4 py-3 text-left ${
              type === item.id ? "border-accent bg-accent-soft" : "border-rule bg-bg2"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {type !== "none" && (
        <label className="grid gap-1">
          <span className="text-sm text-muted">
            {t("Rough value today — 45L is fine", "Aaj ki keemat — 45L chalega")}
          </span>
          <input
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-xl border border-rule bg-bg px-4 py-3 font-[family-name:var(--font-mono)]"
          />
          {preview && <span className="text-sm text-accent">{preview}</span>}
        </label>
      )}
      <button
        type="button"
        disabled={!ok}
        onClick={() => onSubmit({ type, value: type === "none" ? 0 : amount })}
        className="rounded-full bg-accent px-5 py-3 font-semibold text-accent-ink disabled:opacity-40"
      >
        {t("Continue", "Aage")}
      </button>
    </div>
  );
}
