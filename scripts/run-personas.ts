import { formatInr, formatPct } from "../src/engine/money";
import { productLabel } from "../src/engine/assess";
import { PERSONAS, runPersona } from "../src/engine/personas";
import { QUESTIONS, isAnswered, visibleQuestions } from "../src/engine/questions";

for (const p of PERSONAS) {
  const { asked, assessment: a } = runPersona(p.id);
  const extras = visibleQuestions(p.answers).filter(
    (q) => q.tier === "additional" && isAnswered(q.id, p.answers),
  );
  console.log("\n========", p.name, "========");
  console.log(p.city, p.tag);
  console.log("Questions answered:");
  for (const q of visibleQuestions(p.answers).filter((q) => isAnswered(q.id, p.answers))) {
    const meta = QUESTIONS.find((x) => x.id === q.id);
    console.log(`  [${q.tier}] ${q.prompt}`);
    if (meta) console.log(`           moves ${meta.affects.join(", ")}`);
  }
  console.log("Asked count", asked.length, "extras", extras.length);
  console.log("O1", a.verdict, "—", a.verdictReason);
  console.log("Product", productLabel(a.product), "—", a.productReason);
  console.log("O2 lender", formatInr(a.lenderAmount.low), "-", formatInr(a.lenderAmount.high));
  console.log("O2 safe  ", formatInr(a.safeAmount.low), "-", formatInr(a.safeAmount.high));
  console.log("Use", a.useNumber, "recommended", formatInr(a.recommendedAmount));
  console.log("O3 rate", formatPct(a.headlineRate.low), "-", formatPct(a.headlineRate.high));
  console.log("O3 APR ", formatPct(a.apr.low), "-", formatPct(a.apr.high), "fee", formatPct(a.processingFeePct));
  console.log("O4 EMI ceiling", formatInr(a.emiCeiling), "tenure", a.recommendedTenureMonths);
  console.log("Stress", a.stress.title, a.stress.stillFits ? "fits" : "fails", a.stress.stressedFoirPct + "%");
  console.log("Confidence", Math.round(a.confidence * 100) + "%", a.confidenceLabel);
  console.log("CARD", a.card.headline);
  console.log(a.card.compareLine);
}

void PERSONAS;
