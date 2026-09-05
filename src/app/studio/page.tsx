"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Shell } from "@/components/Shell";
import {
  PERSONAS,
  assess,
  defaultKnobs,
  formatInr,
  formatPct,
  productSimple,
  verdictSimple,
  type StudioKnobs,
} from "@/engine";
import { useLang } from "@/lib/language";

export default function StudioPage() {
  const { t } = useLang();
  const defaults = defaultKnobs();
  const [knobs, setKnobs] = useState<StudioKnobs>(defaults);

  const rows = useMemo(
    () => PERSONAS.map((p) => ({ persona: p, a: assess(p.answers, knobs) })),
    [knobs],
  );

  function set<K extends keyof StudioKnobs>(key: K, value: number) {
    setKnobs((k) => ({ ...k, [key]: value }));
  }

  return (
    <Shell wide>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {t("Rate lab", "Rate lab")}
      </p>
      <h1 className="mt-3 text-4xl">{t("See a rule move a number", "Niyam hilaao, number dekho")}</h1>
      <p className="mt-3 max-w-2xl text-muted">
        {t(
          "These sliders are the same household rules the dashboard uses. Move one. Three sample files recompute instantly — no reload.",
          "Yahi niyam dashboard chalaate hain. Slider hilaao. Teen sample files turant badlenge.",
        )}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <aside className="grid gap-5 rounded-2xl border border-rule bg-bg2 p-4">
          <Knob
            label={t("Safe EMI share — salaried", "Safe EMI hissa — salaried")}
            hint="FOIR_SAFE_PERSONAL"
            value={knobs.foirSafePersonal}
            min={0.25}
            max={0.55}
            step={0.01}
            print={`${Math.round(knobs.foirSafePersonal * 100)}%`}
            onChange={(n) => set("foirSafePersonal", n)}
          />
          <Knob
            label={t("Safe EMI share — informal", "Safe EMI hissa — informal")}
            hint="FOIR_INFORMAL_SAFE"
            value={knobs.foirInformalSafe}
            min={0.15}
            max={0.45}
            step={0.01}
            print={`${Math.round(knobs.foirInformalSafe * 100)}%`}
            onChange={(n) => set("foirInformalSafe", n)}
          />
          <Knob
            label={t("Wedding / spending haircut", "Shaadi wale loan ki katoti")}
            hint="CONSUMPTION_SAFE_HAIRCUT"
            value={knobs.consumptionHaircut}
            min={0.5}
            max={1}
            step={0.05}
            print={`${Math.round(knobs.consumptionHaircut * 100)}% kept`}
            onChange={(n) => set("consumptionHaircut", n)}
          />
          <Knob
            label={t("Shop loan — high LTV", "Dukan loan — zyada LTV")}
            hint="LTV_LAP_HIGH"
            value={knobs.ltvLapHigh}
            min={0.4}
            max={0.75}
            step={0.05}
            print={`${Math.round(knobs.ltvLapHigh * 100)}%`}
            onChange={(n) => set("ltvLapHigh", n)}
          />
          <Knob
            label={t("Bounce rate bump", "Bounce par extra byaj")}
            hint="BOUNCE_RATE_BUMP"
            value={knobs.bounceRateBump}
            min={0}
            max={8}
            step={0.5}
            print={`+${knobs.bounceRateBump} pp`}
            onChange={(n) => set("bounceRateBump", n)}
          />
          <button
            type="button"
            onClick={() => setKnobs(defaultKnobs())}
            className="rounded-full border border-rule px-4 py-2 text-sm"
          >
            {t("Reset defaults", "Default wapas")}
          </button>
        </aside>

        <div className="grid gap-3 sm:grid-cols-3">
          {rows.map(({ persona, a }) => {
            const v = verdictSimple(a.verdict);
            return (
              <article key={persona.id} className="rounded-2xl border border-rule p-4">
                <p className="font-[family-name:var(--font-display)] text-2xl">{persona.name}</p>
                <p className="text-xs uppercase tracking-wider text-muted">{persona.city}</p>
                <p className="mt-3 text-sm font-semibold text-accent">{t(v.en, v.hi)}</p>
                <p className="mt-2 text-sm">
                  {t("Bank may offer", "Bank")} {formatInr(a.lenderAmount.low, true)}–{formatInr(a.lenderAmount.high, true)}
                </p>
                <p className="text-sm">
                  {t("Should take", "Lena chahiye")} {formatInr(a.safeAmount.low, true)}–{formatInr(a.safeAmount.high, true)}
                </p>
                <p className="text-sm">
                  {t("Fair rate", "Byaj")} {formatPct(a.headlineRate.low)}–{formatPct(a.headlineRate.high)}
                </p>
                <p className="mt-2 text-sm text-muted">{productSimple(a.product)}</p>
                <p className="mt-2 text-xs text-muted">{a.verdictReason}</p>
                <Link href={`/result?persona=${persona.id}`} className="mt-3 inline-block text-sm text-accent">
                  {t("Open full result", "Poora result")}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}

function Knob({
  label,
  hint,
  value,
  min,
  max,
  step,
  print,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  print: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-semibold">{label}</span>
      <span className="font-[family-name:var(--font-mono)] text-xs text-accent">{hint} · {print}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
