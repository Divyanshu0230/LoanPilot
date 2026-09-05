import { NextResponse } from "next/server";
import { z } from "zod";
import { assess, emptyAnswers, type Answers } from "@/engine";

const AnswersSchema = z.object({
  purpose: z.string().nullable(),
  amountWanted: z.number().nullable(),
  preferredProduct: z.string().nullable(),
  incomeType: z.string().nullable(),
  monthlyIncome: z.number().nullable(),
  existingEmis: z.number().nullable(),
  monthlyExpenses: z.number().nullable(),
  age: z.number().nullable(),
  creditBand: z.string().nullable(),
  creditScore: z.number().nullable(),
}).passthrough();

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = AnswersSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Answers failed validation." }, { status: 400 });
  }
  const answers = { ...emptyAnswers(), ...parsed.data } as Answers;
  return NextResponse.json(assess(answers));
}
