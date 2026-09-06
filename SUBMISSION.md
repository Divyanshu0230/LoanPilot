# Lokta · Borrower Copilot · Submission

**Divyanshu Pratap Singh** · Software Engineering Intern  
**Assignment:** Borrower Copilot Build Challenge v1.0 · issued 2 Sep 2026  
**Time box:** 4 calendar days · expected 12–16 hours

The brief asked for four deliverables **at the repo root**, in a fixed order. This file is the long cover: what I built, why the numbers look like this, and exactly where to click. The four source files are still the ones named in the mail.

---

## Where to open it

| | |
|---|---|
| **Public repo** | https://github.com/Divyanshu0230/LoanPilot |
| **Live app** | https://loanpilot-iota.vercel.app |
| **Local run** | [`README.md`](README.md) — under 5 minutes |

```bash
nvm use          # Node 20 (.nvmrc)
npm install
npm test         # 18 engine tests
npm run dev      # http://localhost:3000
npm run personas # reprint Priya / Ravi / Anita
```

No login. No bureau pull. No database. Answers live in `sessionStorage` on this tab and vanish when the tab does. If the borrower does not know their score, they say so — we never invent a 300.

---

## Deliverable 1 — the working app

A phone-first web product. A borrower answers everyday questions and gets four outputs plus a one-page card they can hold up at a desk.

| Output | What the brief asked | What the app does |
|---|---|---|
| **O1** | Borrow / Don’t / Borrow less | A verdict with a reason. **Don’t** is first-class (Anita). |
| **O2** | Two amounts | Lender sanction vs household-safe, labelled, and which one to use. |
| **O3** | Fair rate as a band | Headline + all-in APR (fee + GST). A 14% quote can be checked. |
| **O4** | EMI ceiling + tenure + stress | Monthly cap, tenure chart, income −20% or rate +200 bps. |
| **Card** | One screen for the branch | Print / PDF, WhatsApp, copy, walk-in pack. |

### What you click (5 minutes)

| Path | What it is |
|---|---|
| `/` | Dashboard — rate board, tools, three **demo** files |
| `/assess?new=1` | Adaptive questions. Type `8L`. Skip extras. Hinglish toggle |
| `/result?persona=priya` | Wedding PL — take less than ₹8L |
| `/result?persona=ravi` | Shop loan. Unknown ≠ 300 |
| `/result?persona=anita` | Don’t borrow. Safe = ₹0 |
| `/pack` | Papers checklist + four numbers + card |
| `/card` | Printable negotiation card |
| `/studio` | Move `FOIR_SAFE_PERSONAL` live — the follow-up, already built |
| `/compare` | Three files, one table |
| `/practice` | Desk offers 14% on ₹8L |
| `/rules` | Same catalog as `RULES.md` |
| `POST /api/assess` | Same `assess()` as the browser |
| `GET /api/rules` | Same knobs |

Screenshots of each surface, in click order, are in [`README.md`](README.md#product-tour) and `docs/screenshots/`.

### How the machine is built

```
src/engine/     rules.ts · questions.ts · assess() · coach — zero React
src/app/        dashboard, assess, result, pack, card, studio, compare, practice, rules
src/app/api/    POST /api/assess · GET /api/rules
src/lib/        sessionStorage, language, share pack
```

One function. Two doors (UI and API). Change a named export in `src/engine/rules.ts` — or a slider on `/studio` — and every number moves.

Pipeline: **normalise income → route product → fair rate + APR → lender amount vs safe amount → verdict → EMI ceiling + stress → widen bands if they skipped answers.**

I did not add auth, Postgres, Redis, Docker, a bureau SDK, or an ML model. The brief forbids stored personal data and scores a first-time local run. Extra infrastructure would have been theatre.

### Question design (the 20 points)

- **Must set = 9.** Purpose, amount, product they were told, income type, take-home, existing EMIs, household spend, age, credit (including “I don’t know”).
- **Additional questions each move a number.** Employer, vintage, ITR, till range, dependents, bounce, emergency months, collateral, co-applicant, productive earn, card utilisation, costliest existing rate. If a question never moves an output, it is not in the file.
- **Adaptive.** Priya never sees ITR or till cash. Ravi never sees “MNC / govt”. Anita sees bounce and 32% paper.
- **Unknown is never zero.** `resolvedScore()` returns `null`. Ravi and Anita use the unknown rate table, not 300.

---

## Deliverable 2 — RULES.md

[`RULES.md`](RULES.md) is the human copy of `src/engine/rules.ts`. Every row is **what · value · why · source or “my judgement”**.

I am not a credit officer and I did not pull a live bank grid. Where I guessed, the last column says so. The app also lists assumptions on the result page.

Examples you are likely to turn in the follow-up:

| Knob | File | What moves |
|---|---|---|
| `FOIR_SAFE_PERSONAL` | `rules.ts` / `/studio` | Priya’s **safe** amount and EMI ceiling. Lender barely moves. |
| `LTV_LAP_LOW` / `LTV_LAP_HIGH` | same | Ravi’s lender high (the shop). |
| `BOUNCE_RATE_BUMP` | same | Anita’s rate if you ever let her through. |
| `CONSUMPTION_SAFE_HAIRCUT` | same | Wedding / spending tickets. |
| `resolvedScore()` | `assess.ts` | Do **not** invent 300. |

The `/rules` page is the same table. The borrower is allowed to see the model.

---

## Deliverable 3 — three run-throughs

Full questions, four outputs and cards: [`RUNTHROUGHS.md`](RUNTHROUGHS.md).  
Reprint: `npm run personas`.

Facts the brief did not give (and that I therefore had to assume) are listed at the top of that file — Priya’s living spend besides rent, Anita’s EMI on the ₹35k stack, and so on. Silence is modelled as silence, not as a convenient number.

### Side by side (what I will defend)

| | Priya | Ravi | Anita |
|---|---|---|---|
| **O1** | Borrow less | Borrow less, **right product** | **Don’t borrow** |
| Product | Personal loan | **LAP — not the PL he asked for** | Two-wheeler (refuse it) |
| Lender vs safe | ₹17.1–18.2L vs **₹5.3–6.1L** | ₹10.9–23.4L vs **₹11.6–14.5L** | ₹70k–1.2L sales vs **₹0** |
| Use | The second number | The second number | The zero |
| Fair headline | 10.5–12.3% PL | 9.7–13.9% LAP | 17.5–24.7% 2W |
| APR (fee + GST) | ~12.7–14.9% | ~10.5–15.2% | ~20.5–29.4% |
| EMI ceiling | ₹20,000 | ₹20,500 | **₹0** |
| Score | 780 | Unknown — **not 300** | Unknown — **not 300** |

**Priya.** A 780 MNC file will get a wedding PL. That is not the question. The question is whether she should. ₹8L at ~11% for 36 months is already ~₹26k EMI. After the car and Bengaluru living, the household ceiling is ₹20k. A 14% desk quote is already above fair.

**Ravi.** He walks in asking for a personal loan. An unencumbered ₹45L shop reroutes him to LAP. The lender’s high number is the premises. The safe number is a thin month at the till plus most of his wife’s ₹18,000. If a banker says “we can do 22 lakh against the shop”, that is a sales sentence.

**Anita.** Don’t-borrow is latched by a warm bounce plus 32% app paper, not by moralising about scooters. The scooter is the only productive ask of the three. The household still cannot carry it. O2 shows a salesman band so she knows what to refuse; safe is ₹0.

---

## Deliverable 4 — five-minute walkthrough

Written walkthrough, what I would build next, and what I would cut: [`WALKTHROUGH.md`](WALKTHROUGH.md).

| Minute | Open | Say |
|---|---|---|
| 0–1 | `/` then **Ravi** | The gap: lender has a model, borrower walks in blind. |
| 1–2 | Ravi result + card | LAP, two amounts, unknown ≠ 300, refuse 18% PL. |
| 2–3 | **Priya** | Banker will fund ₹8L. She should take ~₹6.1L. EMI ₹20k not ₹30k. |
| 3–4 | **Anita** | Don’t borrow. Sales ₹70k–1.2L vs safe ₹0. |
| 4–5 | `/studio` | Drag salaried safe-EMI share. Priya moves; Ravi barely does. |

**Build next (if this were a product, not a take-home):** on-device bank-statement check; three-offer compare on the card; a computed gold ticket to retire Anita’s 32% stack; Kannada on the card; a stale public rate tape so O3 is less of a shrug.

**Cut:** more loan products, a database, a chatbot that improvises questions, charts that do not change a decision, a must-set longer than nine.

---

## How this maps to the score sheet

| Area | Pts | Where it lives |
|---|---|---|
| Domain reasoning | 30 | Two amounts. Don’t-borrow on Anita. Ravi → LAP. APR includes fee + GST. |
| Question design | 20 | 9 must. Extra questions each move a number. Adaptive paths. Unknown ≠ 0. |
| Explainability + card | 20 | One-sentence why. Printable card. Walk-in pack. 14% quote check. |
| Product craft | 15 | Phone flow, ranges as ranges, confidence, Hinglish, `8L` chips. |
| Engineering | 10 | Rules separated from UI. `npm test`. First-run README. Live Vercel. |
| Honesty about limits | 5 | `RULES.md` last column. Result page lists guesses and skipped cost. |

Not scored, and therefore not built: pixel theatre, a real bureau, an ML model, product breadth beyond these three files.

---

## Follow-up (60 minutes)

I would start on **Ravi**, then **Anita**, then change a rule.

Open `/studio` or `src/engine/rules.ts` and lower `FOIR_SAFE_PERSONAL` from `0.40` to `0.35`. Priya’s safe band and EMI ceiling fall. The lender band barely moves. That sentence is the company: **the bank’s number is what they can sell; the second number is what the household can carry.**

Eighteen Vitest tests lock the three files, unknown ≠ 300, wait-vs-borrow, and “every extra question moves a number”.

---

## What I would not apologise for

Don’t borrow on Anita. Routing Ravi to LAP. Telling Priya her banker is not her friend. Printing APR with GST on the fee. Leaving unknown as unknown.
