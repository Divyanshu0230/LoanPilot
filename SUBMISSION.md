# Lokta · Borrower Copilot · Submission

**Candidate:** Divyanshu Pratap Singh  
**Role:** Software Engineering Intern  
**Assignment:** Borrower Copilot Build Challenge v1.0 (issued 2 Sep 2026)

This file is the cover sheet. The four deliverables the brief asked for sit at the **repo root**, in the same order as the mail.

---

## Links

| | |
|---|---|
| **Public repo** | https://github.com/Divyanshu0230/LoanPilot |
| **Live app** | https://loanpilot-iota.vercel.app |
| **How to run locally** | [`README.md`](README.md) — under 5 minutes (`nvm use && npm install && npm test && npm run dev`) |

No login. No bureau. No stored personal data. Answers live in `sessionStorage` on this machine.

---

## Deliverables (brief order)

### 1. The working app

Web app. Next.js 15 + TypeScript. Rules live in `src/engine/` with no React imports. Same `assess()` function powers the UI and `POST /api/assess`.

- Open https://loanpilot-iota.vercel.app or run from the README.
- Sample files: `/result?persona=priya` · `/result?persona=ravi` · `/result?persona=anita`
- Follow-up hook: `/studio` — drag **Safe EMI share — salaried**. Priya’s safe amount moves; the bank number barely does.

### 2. RULES.md

[`RULES.md`](RULES.md) — every rule, threshold, band and assumption as **what · value · why · source or “my judgement”**.

The machine copy of the same table is `src/engine/rules.ts` and `/rules`.

### 3. Three run-throughs

[`RUNTHROUGHS.md`](RUNTHROUGHS.md) — Priya, Ravi, Anita: questions asked, the four outputs, and the negotiation card for each.

Reprint the numbers any time:

```bash
npm run personas
```

### 4. Five-minute walkthrough

[`WALKTHROUGH.md`](WALKTHROUGH.md) — written walkthrough (phone + laptop). What I would build next, and what I would cut.

---

## What I would show first in the 60-minute session

1. **Ravi** — he asked for a personal loan; the file becomes a shop loan. Unknown score is not 300.
2. **Anita** — Don’t borrow fires. Safe amount is ₹0.
3. **`/studio`** — change `FOIR_SAFE_PERSONAL` live. Priya’s household number moves; the lender number does not.

That is the product: the bank’s number is what they can sell; the second number is what the household can carry.
