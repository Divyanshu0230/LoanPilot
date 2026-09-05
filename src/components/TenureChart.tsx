import type { TenureOption } from "@/engine";
import { formatInr } from "@/engine";

export function TenureChart({
  options,
  ceiling,
}: {
  options: TenureOption[];
  ceiling: number;
}) {
  const max = Math.max(ceiling, ...options.map((o) => o.emiForRecommended), 1);
  return (
    <div className="grid gap-3">
      {options.map((o) => {
        const over = o.emiForRecommended > ceiling && o.emiForRecommended > 0;
        return (
          <div key={o.months} className="grid gap-1">
            <div className="flex justify-between text-sm">
              <span>{o.months / 12 >= 1 ? `${o.months / 12} yr` : `${o.months} mo`}</span>
              <span className={`num ${over ? "text-bad" : "text-ink"}`}>
                {o.emiForRecommended ? formatInr(o.emiForRecommended) : "—"}
                {over ? " · over ceiling" : ""}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg2">
              <div
                className={`h-full ${over ? "bg-bad" : "bg-accent"}`}
                style={{ width: `${(o.emiForRecommended / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-sm text-muted">
        Ceiling {formatInr(ceiling)}. Longer tenure shrinks EMI and grows interest — that trade is on purpose.
      </p>
    </div>
  );
}
