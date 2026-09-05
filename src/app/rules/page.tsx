import { RULE_CATALOG } from "@/engine/rules";
import { QUESTIONS } from "@/engine/questions";
import { Shell } from "@/components/Shell";

export default function RulesPage() {
  return (
    <Shell wide>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        Same file the machine runs
      </p>
      <h1 className="mt-3 text-4xl">Every rule, threshold and guess</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Numbers live in <span className="font-[family-name:var(--font-mono)] text-sm text-ink">src/engine/rules.ts</span>.
        Change a constant there — or use the rate lab sliders — and both the dashboard and{" "}
        <span className="font-[family-name:var(--font-mono)] text-sm">/api/assess</span> move.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-ink text-xs uppercase tracking-[0.12em] text-muted">
              <th className="py-3 pr-3">What</th>
              <th className="py-3 pr-3">Value</th>
              <th className="py-3 pr-3">Why</th>
              <th className="py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {RULE_CATALOG.map((row) => (
              <tr key={row.id} className="border-b border-rule align-top">
                <td className="py-3 pr-3 font-semibold">{row.what}</td>
                <td className="py-3 pr-3 font-[family-name:var(--font-mono)] text-accent whitespace-nowrap">
                  {row.value}
                </td>
                <td className="py-3 pr-3">{row.why}</td>
                <td className="py-3 text-muted">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-2xl">Questions and what each one moves</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead>
            <tr className="border-b border-ink text-xs uppercase tracking-[0.12em] text-muted">
              <th className="py-3 pr-3">Tier</th>
              <th className="py-3 pr-3">Question</th>
              <th className="py-3 pr-3">Moves</th>
              <th className="py-3">How</th>
            </tr>
          </thead>
          <tbody>
            {QUESTIONS.map((q) => (
              <tr key={q.id} className="border-b border-rule align-top">
                <td className="py-3 pr-3 font-[family-name:var(--font-mono)] text-xs uppercase text-accent">
                  {q.tier}
                </td>
                <td className="py-3 pr-3">{q.prompt}</td>
                <td className="py-3 pr-3 font-[family-name:var(--font-mono)] text-xs">
                  {q.affects.join(", ")}
                </td>
                <td className="py-3 text-muted">{q.tighten}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
