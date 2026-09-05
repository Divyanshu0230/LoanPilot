import { NextResponse } from "next/server";
import { QUESTIONS } from "@/engine/questions";
import { RULE_CATALOG } from "@/engine/rules";

export async function GET() {
  return NextResponse.json({
    rules: RULE_CATALOG,
    questions: QUESTIONS.map((q) => ({
      id: q.id,
      tier: q.tier,
      prompt: q.prompt,
      affects: q.affects,
      tighten: q.tighten,
    })),
  });
}
