# Five-minute walkthrough

I would sit with this open on a phone and on a laptop. The product is the phone. The laptop is for `/rules`.

## Minute 0–1 — the gap

Open `/`. You land on a borrower dashboard: rate board, tools, sample files. No interview notes. The thesis is the brief’s thesis: the lender has a model, the borrower walks in blind. Four outputs, a card, no login.

Click **Ravi** (or open `/result?persona=ravi`). This is the file that decides whether I understood the product.

## Minute 1–2 — Ravi, the reroute

He asked for a personal loan. The result page should say **loan against property** in the first screen of O3, and the verdict should be **borrow less**, not don’t, not a blank cheque for ₹15L.

Point at the two amount bands.

- Lender high (~₹23L) is the shop.
- Safe high (~₹14.5L) is a thin month at the till plus 80% of his wife’s ₹18,000.
- The number he should use is the second one.

Say out loud: *unknown score was not priced as 300. We priced the premises.*

Open the printable card. The refuse line is the point of the company: **do not sign an 18% unsecured PL**.

## Minute 2–3 — Priya, consumption

Back, click **Priya**.

A 780 MNC file will get a wedding PL. That is not the question. The question is whether she should.

O1 is **borrow less**. O2 is the whole product: lender ₹17–18L, safe ₹5.3–6.1L. If I only built a sanction estimator I would have told her yes, take eight. The EMI ceiling is ₹20,000 because ₹30,000 is the banker’s FOIR, not the household’s.

If they quote 14%, the card already has the sentence.

## Minute 3–4 — Anita, Don’t borrow

Click **Anita**.

Don’t borrow has to be reachable. Here it is latched by a warm bounce plus 32% app paper, not by moralising about scooters. The scooter is the only productive ask of the three. The household still cannot carry it.

O2 is the honest trick: lender ₹70k–₹1.2L is what a salesman will try. Safe is ₹0. Use the zero.

## Minute 4–5 — change a rule

Open `/studio` (Rate lab). Drag **Safe EMI share — salaried** down. Priya’s safe amount falls; Ravi barely moves (he is on a shop loan). Same thing lives in `src/engine/rules.ts` as `FOIR_SAFE_PERSONAL`.

Then `/compare` for the three files on one page, `/practice` for the 14% desk conversation, and `/pack?persona=priya` for what she carries tomorrow.

Then open `/rules`. Same table as `RULES.md`. The borrower is allowed to see the model.

`npm test` covers the three files, “unknown ≠ 300”, wait-vs-borrow, and “every extra question moves a number”.

---

## What I would build next

1. **Bank-statement optional upload, on-device.** Average credits vs the number they typed. Still no server store. Tightens Ravi’s till vs ITR gap.
2. **Offer-compare on the card.** Paste three sanction letters. We already take one quoted rate; three would make the card a worksheet.
3. **Gold-refinance path as a first-class verdict.** Anita today is “don’t, and a sentence about gold”. Tomorrow it should be a computed gold ticket that retires the 32% stack, with the EMI of that ticket vs the app EMIs.
4. **Vernacular.** The card has to work in Kannada and Hindi in a Hubballi branch. The engine does not care.
5. **A live rate tape, even a stale one.** I said in RULES.md that 2026 bands are my judgement. A monthly public scrape of advertised PL/LAP/gold would make O3 less of a shrug.

## What I would cut

- **Any more loan products.** The brief said the three borrowers are enough. I already have home-loan constants I barely use.
- **A backend database.** It would have violated the brief and slowed the first run.
- **A chatbot wrapper.** The questions are the product. A model that improvises them would hide the rules I need to defend.
- **Pixel decoration.** The type is the brief’s type. I did not add a dashboard of charts that do not change a decision.
- **Must-questions beyond nine.** If the must-set grows, people bounce before O1. Additional questions have to earn the next tap.

## What I would not apologise for

Don’t borrow on Anita. Routing Ravi to LAP. Telling Priya her banker is not her friend. Printing APR with GST on the fee. Leaving unknown as unknown.
