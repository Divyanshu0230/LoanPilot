import { formatInr, formatPct } from "@/engine";

export function RangeBar({
  low,
  high,
  mark,
  markLabel,
  kind = "inr",
}: {
  low: number;
  high: number;
  mark?: number;
  markLabel?: string;
  kind?: "inr" | "pct";
}) {
  const span = Math.max(high - low, 1);
  const fmt = (n: number) => (kind === "pct" ? formatPct(n) : formatInr(n, true));
  const markPct =
    mark == null ? null : Math.min(100, Math.max(0, ((mark - low) / span) * 100));

  return (
    <div className="grid gap-2">
      <div className="relative h-2 rounded-full bg-accent-soft">
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-accent/30" />
        {markPct != null && (
          <div
            className="absolute -top-1 h-4 w-1 rounded bg-accent"
            style={{ left: `${markPct}%` }}
            title={markLabel}
          />
        )}
      </div>
      <div className="flex justify-between text-sm text-muted">
        <span className="num">{fmt(low)}</span>
        {mark != null && markLabel && (
          <span className="text-accent">{markLabel} {kind === "pct" ? formatPct(mark) : formatInr(mark, true)}</span>
        )}
        <span className="num">{fmt(high)}</span>
      </div>
    </div>
  );
}
