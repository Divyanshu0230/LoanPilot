# Borrower Copilot

I built a self-assessment for an Indian borrower who is about to walk into a lender. It answers four things — should I borrow, how much is actually mine, what interest is fair, what EMI I agree to — and prints a one-page card for the desk.

I am Divyanshu Pratap Singh. This is my submission.

| | |
|---|---|
| Repo | https://github.com/Divyanshu0230/LoanPilot |
| Live | https://loanpilot-iota.vercel.app |
| Run it | [`README.md`](README.md) |

```bash
nvm use
npm install
npm test
npm run dev
```

Open http://localhost:3000. Node 20. Under five minutes.

No login. I do not save a name or pull a credit report. If someone does not know their score, they say so. I do not treat that as 300.

---

## 1. The working app

The borrower taps through everyday questions. They get four outputs and a card they can hold up.

**Should I borrow?** Yes, take less, or don’t. Anita is don’t.

**How much?** Two numbers. What a bank may sanction, and what the household can carry. I tell them to walk in with the second one.

**Fair rate?** A range, plus the real yearly cost after fee and GST. If the desk says 14%, they can type it and check.

**EMI?** A monthly ceiling they should not cross, the tenure trade, and one stress case (income down 20% or rate up 2 points).

**Card.** One page. Print, WhatsApp, or the walk-in pack (numbers + papers + card).

### Try it

| Open | What I made |
|---|---|
| `/` | Dashboard — rate board, tools, three sample files |
| `/assess?new=1` | Questions. Type `8L`. Skip extras. आ आसान हिंदी |
| `/result?persona=priya` | Wedding loan — take less than ₹8L |
| `/result?persona=ravi` | He asked for a personal loan. I put him on the shop. |
| `/result?persona=anita` | Don’t borrow. Safe amount is ₹0 |
| `/pack` | What they carry tomorrow |
| `/card` | Printable card |
| `/studio` | I move a rule. The three files recompute. |
| `/compare` | Priya, Ravi, Anita on one table |
| `/practice` | Desk offers 14% on ₹8L |
| `/rules` | Same table as RULES.md |

Screenshots are in the README, in that order.

### How I built it

Rules sit in `src/engine/`. No React there. `assess()` is the only judge. The pages and `POST /api/assess` call the same function. If I change `FOIR_SAFE_PERSONAL` in `src/engine/rules.ts`, or drag the slider on `/studio`, the number moves everywhere.

Income first (payslip vs ITR vs till). Then the product (Ravi’s shop beats the PL form they handed him). Then a rate band and APR. Then two amounts. Then the verdict. Then EMI + stress. Missing answers make the band wider. I never invent a thin, confident number from silence.

I did not put a database, login, or a bureau on this. That would store people I was told not to store, and it would not help a first run from the README.

### The questions

Nine must-questions so the four outputs still work if they stop early: purpose, amount, product they were told, how they earn, take-home, existing EMIs, household spend, age, score (or “I don’t know”).

Extra questions only exist if they change a number — job type, years, ITR, weak month at the till, dependents, bounce, emergency months, collateral, wife’s income, what the loan will earn, card use, the 32% app loan.

Priya does not see ITR. Ravi does not see “MNC”. Anita sees the bounce and the 32%.

---

## 2. RULES.md

[`RULES.md`](RULES.md) is every threshold I used: what, value, why, and whether I took it from a known practice or from my own judgement.

I am not a credit officer. I did not sit with a bank’s 2026 grid. Where I guessed, I wrote “my judgement”. The result page also lists what I assumed and what they skipped.

The same knobs are named exports in `src/engine/rules.ts` and on `/rules`.

| If you change this | This moves |
|---|---|
| `FOIR_SAFE_PERSONAL` | Priya’s safe amount and EMI cap. Bank number barely moves. |
| `LTV_LAP_HIGH` | How much of Ravi’s shop a lender may lend. |
| `BOUNCE_RATE_BUMP` | Extra rate after a bounce. |
| `CONSUMPTION_SAFE_HAIRCUT` | Wedding / spending tickets. |

Unknown score stays `null` in `resolvedScore()`. I do not fill 300.

---

## 3. Three run-throughs

Full questions, four outputs, and each card: [`RUNTHROUGHS.md`](RUNTHROUGHS.md).

```bash
npm run personas
```

The brief did not give every household number. I wrote what I typed and why at the top of that file — Priya’s living cost besides rent, Anita’s EMI on the ₹35k apps. If the brief was silent, I left it unanswered and let the band stay wide.

| | Priya | Ravi | Anita |
|---|---|---|---|
| Verdict | Borrow less | Borrow less, on the shop | Don’t borrow |
| Product | Personal loan | LAP — not the PL he asked for | Two-wheeler, refuse it |
| Bank may offer | ₹17.1–18.2L | ₹10.9–23.4L | ₹70k–1.2L (sales) |
| They should take | ₹5.3–6.1L | ₹11.6–14.5L | ₹0 |
| Fair rate | 10.5–12.3% | 9.7–13.9% LAP | 17.5–24.7% |
| Real yearly cost | ~12.7–14.9% | ~10.5–15.2% | ~20.5–29.4% |
| EMI ceiling | ₹20,000 | ₹20,500 | ₹0 |
| Score | 780 | Unknown, not 300 | Unknown, not 300 |

**Priya.** A 780 MNC file will get a wedding loan. That is not the question. ₹8L EMI is already about ₹26,000. After the car and Bengaluru living I only leave her ₹20,000. So take about ₹6.1L, not eight. If they say 14%, that is already above my band.

**Ravi.** He thinks this is a personal loan. He has a ₹45L shop with no loan on it. I send him to a loan against the shop. The high bank number is the shop. The number he should use is a weak month at the till plus most of his wife’s ₹18,000. “We can do 22 lakh on the premises” is a sales line.

**Anita.** The scooter would help her earn. The house cannot take another EMI. Bounce last month, 32% app loans. Don’t borrow. I still show the salesman ₹70k–1.2L so she knows what to refuse. Safe is zero.

---

## 4. Walkthrough

Written, not a video. What I would add later, and what I would leave out: [`WALKTHROUGH.md`](WALKTHROUGH.md).

Order I click: **Ravi** (shop loan, two amounts, unknown is not 300), **Priya** (bank can fund ₹8L, she should not take it), **Anita** (don’t borrow, sales number vs ₹0), then `/studio` — pull “Safe EMI share — salaried” down. Priya’s safe number falls. Ravi barely moves. He is on LAP.

Later I would add a bank-statement check on the phone, more than one quote on the card, a real gold number for Anita, Kannada on the card, and a public rate list so the fair band is less of a guess.

I would not add more loan types, a database, or a chatbot. Nine must-questions is enough.

If you change `FOIR_SAFE_PERSONAL` from 0.40 to 0.35, Priya’s household number moves. The bank number does not.
