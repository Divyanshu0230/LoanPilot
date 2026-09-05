# RULES.md

Every number the app shows is a named constant in `src/engine/rules.ts`. This file is the human copy of that file: **what · value · why · source**.

I am not a credit officer and I did not pull a live bank grid. Where I am guessing, the last column says so.

## How the machine thinks

1. **Normalise income.** A lender and a household do not see the same rupee. Payslips, ITR and till cash are three different numbers.
2. **Route the product.** Collateral and purpose can override what the borrower walked in asking for. Ravi’s “personal loan” becomes a shop-secured LAP.
3. **Price a band, not a point.** Unknown score is a wide band. It is never 300.
4. **Build two amounts.** Lender sanction (FOIR × documented income, LTV, multiples). Borrower-safe (residual after the house is fed, then haircuts).
5. **Decide the verdict.** Don’t borrow is a first-class result.
6. **Emit an EMI ceiling and one stress case.** Income −20% or rate +200 bps, whichever is nastier.
7. **Widen every band as answers go missing.** Silence does not invent a thin, confident number.

## Thresholds

| What | Value | Why | Source |
|---|---|---|---|
| FOIR cap — personal loan, prime salaried | 50% | Private banks often sanction PL up to ~50% of net for 750+ MNC/govt. That is their number, not a safe household number. | My judgement, typical 2024–26 private-bank PL grids |
| FOIR cap — personal loan, standard | 45% | Default unsecured grid when the file is ordinary. | My judgement |
| FOIR cap — personal loan, risky / informal | 40% | Thin files get less FOIR, not more. | My judgement |
| FOIR self-cap — personal loan | 40% | The extra 10 points vs a prime sanction is how people become house-poor. | My judgement |
| FOIR cap — LAP / shop-secured | 55% | The property is the second way out. Still not 65%. | My judgement, typical NBFC LAP |
| FOIR self-cap — LAP | 45% | Same household logic: we stay tighter than the sanction letter. | My judgement |
| FOIR cap — home loan | 55% | Home grids are looser because the asset is the house they live in. | Typical home-loan practice + my judgement |
| FOIR self-cap — home | 45% | Same 10-point gap. | My judgement |
| FOIR cap — two-wheeler | 50% | Short tenor, small ticket. | My judgement |
| FOIR self-cap — two-wheeler | 35% | A scooter EMI on thin surplus is how app loans start. | My judgement |
| FOIR cap — gold | 55% | Metal is liquid. FOIR is secondary to LTV. | My judgement |
| FOIR self-cap — gold | 40% | Gold still has to be paid back. | My judgement |
| FOIR cap — unsecured business | 50% | MSME unsecured sits between PL and LAP. | My judgement |
| FOIR self-cap — informal income | 30% | Cash weeks vanish. A 40% FOIR a salaried MNC can service will bounce a rider in a slow month. | My judgement |
| Residual buffer | 15% of borrower income | Money we refuse to turn into EMI. | My judgement |
| Extra buffer per dependent | +3% | School, food, the second adult who is not earning. | My judgement |
| Variable pay counted | 60% of the variable slice | Bonus is real until the year it is not. | My judgement, typical salaried grids |
| Default variable share if unanswered | 10% | We do not assume a clean CTC. | My judgement |
| Spouse / co-applicant, lender side | 70% | Most grids haircut the second income unless it is formally added. | My judgement |
| Spouse / co-applicant, safe side | 80% | The household can plan on more than a banker will. | My judgement |
| Lender income if no ITR (self-employed) | 55% of cash | A branch underwrites documents, not the till. | My judgement |
| Lender income if informal | 50% of stated | Platform + cash tailoring rarely survive a spreadsheet at face value. | My judgement |
| Safe income if informal / thin cash | Low end of the range, else 85% of typical | Fat months do not raise the ceiling. | My judgement |
| Consumption EMI haircut | × 0.80 | A wedding does not earn. | My judgement |
| Consumption principal cap | 6× monthly take-home | Beyond six months of pay the borrower is financing a lifestyle spike with years of interest. | My judgement |
| Emergency savings &lt; 3 months | Safe EMI × 0.65 | The first shock becomes a second loan. | My judgement |
| Emergency savings unanswered | Safe EMI × 0.85, band widened | We do not invent six months of FD. | Assignment: confidence widens with silence |
| Stated extra monthly earn from the loan | 40% counted | Everyone over-forecasts the second stock line. | My judgement |
| Bounce in last 12 months | +3pp rate; lender amount ×0.4–0.7; new EMI capped at 8% of income | The file is already talking. | My judgement |
| Bounce unanswered | +0.5pp on the top of the band, no Don’t-borrow fire | Assuming a clean file would narrow a verdict we have no basis to narrow. Assuming a bounce would invent a stain. | My judgement |
| Existing loan ≥ 24% plus a bounce | Don’t borrow | App / payday paper is the fire. A new scooter is more fuel. | My judgement |
| Card utilisation ≥ 70% | +1pp on the high end of the rate | High utilisation is a surcharge even with a decent score. | My judgement |
| MNC / government employer | −0.75pp | These files are priced better. | My judgement |
| Job tenure &lt; 1 year | +1.5pp | Flight risk. | My judgement |
| Job ≥ 5 years or business ≥ 10 years | −0.35pp | Stability notch. | My judgement |
| Business &lt; 3 years | +1 / +1.5pp | Vintage is the self-employed bureau. | My judgement |
| Personal-loan headline floor | 10.5% | MNC notches must not push unsecured PL into home-loan territory. | My judgement |
| Processing fee + GST | PL 2%, home 0.5%, LAP 1%, gold 0.75%, 2W 1.5%, business 2% — then × 1.18 | RBI-style all-in cost. A 12% sticker with a 2% fee is not 12%. APR is the IRR on net disbursal. | Fee: my judgement. GST 18%: statute |
| Shop / commercial LTV | 50–60% | A kirana premises is not a Bandra flat. | My judgement, typical LAP LTV |
| Home LTV | 75–85% | Standard home-loan LTV, unused by the three personas. | Typical home-loan practice |
| Gold LTV | 65–75% | Public gold-loan practice. | Public practice + my judgement |
| Two-wheeler sanction ceiling | ₹3,00,000 | An e-scooter is not a car loan. | My judgement |
| Informal 2W “Don’t borrow” lender band | ₹70,000–₹1,20,000 sales pitch, ₹0 safe | A prudent FOIR after app EMIs is ~₹0. A scooter counter may still try to book. Showing ₹0–₹0 would hide the thing she has to refuse. | My judgement |
| Max age at maturity | 60 unsecured / 70 secured | Typical Indian grids. | Typical bank grids + my judgement |
| Max tenure | PL 60m, home 240m, LAP 180m, gold 36m, 2W 48m, business 84m | Product practice, not a wish. | My judgement |
| Default tenure used for the recommended ticket | PL 36m, LAP 120m, 2W 36m, gold 24m, business 60m, home 180m | The tenure we quote unless age caps it. | My judgement |
| Stress case | Income −20% **or** rate +200 bps, worse FOIR wins | Informal and bonus-linked pay already move 20%. Rate resets happen. | My judgement |
| Minimum meaningful loan | ₹25,000 | Below this we print zero rather than a toy ticket. | My judgement |
| Confidence mix | 62% must-set + 38% additional | The must-set has to work on its own. Extra answers earn the rest. | My judgement |
| Confidence cap if score unknown | 58% | We will not claim a tight rate without a bureau. | Assignment + my judgement |
| Confidence cap if expenses unknown | 62% | Surplus is a guess. | Assignment + my judgement |
| Band widen per missing confidence | +12% amount spread; rate widens by up to ~2.4pp | Fewer answers, wider band, and the app says so. | Assignment |

## Rate tables (headline %, 2026)

These are **not** a live market feed. Anchored to late-2025 / 2026 advertised PL, LAP, gold, 2W and home ranges, then widened for thin files.

**Personal loan**

| Bureau | Low | High |
|---|---|---|
| 800+ | 10.5 | 12.0 |
| 750–799 | 11.0 | 13.0 |
| 700–749 | 13.0 | 16.0 |
| 650–699 | 16.0 | 20.0 |
| &lt;650 | 20.0 | 26.0 |
| Unknown, salaried | 12.5 | 18.0 |
| Unknown, self-employed | 15.0 | 22.0 |
| Unknown, informal | 18.0 | 28.0 |

**LAP** — unknown file uses 10.5–13.5 (we price the shop, not a 300 CIBIL). Prime 10.0–12.0.

**Gold** — 9.5–14.0, metal-priced.

**Two-wheeler** — prime 11.0–14.5; informal 15.0–20.0; unknown 13.0–18.5.

**Unsecured business** — documented 14–18; thin 16–22.

**Home** — 8.15–11.5 by bureau. Unused by the three personas.

## Income multiples (monthly, before FOIR / LTV bind)

| File | Multiple |
|---|---|
| PL 800+ | 18–24× |
| PL 750–799 | 16–22× |
| PL 700–749 | 12–18× |
| PL unknown salaried | 10–18× |
| PL informal | 4–8× |
| Unsecured business, with ITR | 12–24× |
| LAP / home | 24–48×, then LTV usually binds |

MNC/govt adds +2×. Job tenure under a year subtracts 4×.

## Product routing

| Condition | Product |
|---|---|
| Purpose is a house | Home loan |
| Gold pledged and the file is informal, bounced, or they asked for gold | Gold loan |
| Shop / house pledged, value ≥ 1.4× the ask (and ≥ ₹4L), business purpose or self-employed | **LAP** — this is the Ravi rule |
| Vehicle purpose, ask ≤ ₹3L | Two-wheeler |
| Business purpose, not enough collateral | Unsecured business |
| Else | What they walked in with, defaulting to personal |

## Verdict

| Fire | When |
|---|---|
| **Don’t borrow** | Existing EMIs already at or above the lender FOIR; **or** a bounce plus existing rate ≥ 24%; **or** surplus &lt; 8% of income and the household is already distressed; **or** safe carry rounds to nothing |
| **Borrow less** | Ask &gt; safe high (always on a wedding if the ask is near the top of safe); **or** ask &gt; lender high |
| **Borrow** | Ask fits the safe number and the product is honest |

The number the borrower should **use** is always the safe number. The lender number is what the branch can sell.

## Question design

Nine must questions produce all four outputs with wide bands and low confidence.

Every additional question is wired to at least one output. The test `each additional question changes at least one output` will fail a dead question. Cut it; don’t keep it for colour.

Adaptive paths: a salaried MNC sees employer, tenure, variable pay, card utilisation. A kirana owner sees vintage, ITR, cash range, collateral. A rider sees cash range and the rate on the app loans. They do not see each other’s 30 questions.

## What I do not know

- **Live 2026 bank grids.** I do not have HDFC / Bajaj / Shriram rate cards as of this week. The bands are reasoned, not scraped.
- **City-level living costs.** Bengaluru rent is in Priya’s expenses because she typed it. I do not have a city CPI table.
- **Actual CIBIL commercial scores, GST returns, bank-statement averaging.** The app only has what the borrower says.
- **Whether a particular shop is mortgageable.** I assume an unencumbered kirana premises of ₹45L can take a LAP. A lawyer might disagree.
- **Recovery of the second stock line.** I count 40% of whatever they claim it will earn. That is still a guess.
- **RBI circulars I have not re-read this week.** APR-including-fee is in the spirit of fair-practice disclosure, not a legal opinion.

The app surfaces guesses as assumptions on the result page. If a must-question is skipped, we do not compute. If an additional question is skipped, we widen, and we say so.
