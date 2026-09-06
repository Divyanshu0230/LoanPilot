# Walkthrough

I did not make a video. The assignment said written is fine, so this is that.

Open the live app or `localhost:3000`. A phone is enough. Use a laptop only if you want `/rules` or `/studio` side by side.

## Home

You land on a dashboard — rate board, tools, three sample files. No login.

I open **Ravi** first (`/result?persona=ravi`). He is the one where the product can go wrong.

## Ravi

He asked for a **personal loan** of ₹15L (stock + a vehicle). The page should say **loan against property**. Verdict is **borrow less**, not yes to fifteen, not don’t borrow.

Two amounts on the same screen:

- Bank high (~₹23L) is the ₹45L shop.
- Safe high (~₹14.5L) is a thin month at the till plus most of his wife’s ₹18,000.

Use the second one. His score is “I don’t know”. That is not 300. I priced the shop.

Open the card. It tells him not to sign an 18% personal loan.

## Priya

Go back, open **Priya**.

A 780 MNC file will get a wedding loan. I still said **borrow less**. Bank side is about ₹17–18L. I only leave her ₹5.3–6.1L. EMI cap is ₹20,000. ₹30,000 is a bank FOIR number, not hers.

₹8L at ~11% for 3 years is already about ₹26,000 EMI. That is why eight is too much.

If the desk says 14%, that is already above my 10.5–12.3% band. The card has that line.

## Anita

Open **Anita**.

**Don’t borrow.** Bounce last month, 32% app loans. The scooter would help her earn. The house cannot take another EMI.

A counter can still quote ₹70k–₹1.2L. Safe is ₹0. That zero is the answer.

## Move a rule

Open `/studio`. Drag **Safe EMI share — salaried** down. Priya’s safe number falls. Ravi barely moves — he is on a shop loan. Same value is `FOIR_SAFE_PERSONAL` in `src/engine/rules.ts`.

Then, if you still have time:

- `/compare` — three files, one table
- `/practice` — someone offers 14% on ₹8L
- `/pack?persona=priya` — what she carries tomorrow
- `/rules` — same table as `RULES.md`

`npm test` checks the three files, unknown score, and that every extra question moves a number.

## What I would add later

1. Bank statement on the phone only — no server. Helps on Ravi (till vs ITR).
2. Paste two or three sanction letters on the card, not just one rate.
3. For Anita, actually work out a gold loan that pays off the 32% apps, not only a sentence.
4. Kannada on the card. She is in Hubballi.
5. Even an old public rate list, so the fair band is not only my guess. I already said that in RULES.md.

## What I would leave out

- More loan types. I already have home-loan numbers I barely use.
- A database. That stores people, and the first run from the README gets slower.
- A chatbot. Then I cannot stand by the questions.
- Extra must-questions. Nine is enough. If the start is long, they leave before the verdict.

I would keep Anita as don’t borrow, Ravi on the shop, and unknown as unknown.
