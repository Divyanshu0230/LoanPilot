# Borrower Copilot

**Know your number before the bank tells you theirs.**

A self-assessment for an Indian borrower who is about to walk into a lender. It answers four questions — **should I borrow, how much is actually mine, what is a fair rate, what EMI do I agree to** — and prints a one-page negotiation card.

No login. No bureau. No database. Answers live in `sessionStorage` on this machine and vanish when the tab does.

[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](#stack)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs)](#stack)
[![React](https://img.shields.io/badge/React-19-087EA4?logo=react)](#stack)
[![Tests](https://img.shields.io/badge/Vitest-18_passing-1f5c45)](#run-it-under-5-minutes)

---

## Run it (under 5 minutes)

You need **Node 20+** (`nvm use` picks it up from `.nvmrc`).

```bash
nvm use
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You land on the **dashboard**.

```bash
npm run personas    # reprint Priya / Ravi / Anita in the terminal
```

---

## Product tour

Screenshots are in click order — the path you would walk in a room.

### 1. Dashboard

The home screen. Fair-rate board, tools, and three **demo** files (not anyone’s KYC).

![Dashboard](docs/screenshots/01-dashboard.png)

### 2. Your file, at a glance

After a check (or a sample), four KPIs, readiness, and the next three moves.

![Dashboard with a file](docs/screenshots/02-dashboard-file.png)

### 3. Adaptive questions

Everyday language. Type `8L`. Skip extras. “I don’t know” is a valid answer.

![Questionnaire](docs/screenshots/03-assess.png)

### 4. Result — Priya (salaried, wedding)

Take less than ₹8L. Bank number and safe number are not the same.

![Priya result](docs/screenshots/04-result-priya.png)

### 5. Wait vs borrow + first-year cost

Save for 3 or 6 months. See how much of year one is interest, not principal.

![Wait vs borrow and first year](docs/screenshots/05-wait-and-year.png)

### 6. Two desks, two quotes

Type 12% and 14%. Compare EMI and total interest on the safe ticket.

![Two-quote compare](docs/screenshots/06-quotes.png)

### 7. Walk-in pack

What you carry tomorrow: four numbers, papers checklist, card.

![Walk-in pack](docs/screenshots/07-pack.png)

### 8. Negotiation card

One page for the desk. Print / PDF.

![Negotiation card](docs/screenshots/08-card.png)

### 9. Rate lab

Move a household rule. Three sample files recompute live.

![Rate lab](docs/screenshots/09-lab.png)

### 10. Side-by-side

Priya, Ravi, Anita on one table. Same engine.

![Compare](docs/screenshots/10-compare.png)

### 11. Desk rehearsal

Someone offers 14% on ₹8L. Practice using the card.

![Practice](docs/screenshots/11-practice.png)

### 12. Every rule

The thresholds behind the numbers. Same catalog as `RULES.md`.

![Rules](docs/screenshots/12-rules.png)

### 13. Ravi — shop loan, unknown score

He asked for a personal loan. The file becomes a loan on the shop. Unknown ≠ 300.

![Ravi result](docs/screenshots/13-result-ravi.png)

### 14. Anita — don’t borrow

A bounce plus 24%+ paper. Don’t-borrow is a real product answer. Cheaper door: gold, wait, don’t sign.

![Anita result](docs/screenshots/14-result-anita.png)

### 15. Hinglish

Tap **आ आसान हिंदी**. Same engine, simpler words.

![Hinglish](docs/screenshots/15-hinglish.png)

---

## High-level system design

One machine. One judgement. Two doors (browser and API) so a follow-up change to a constant moves every surface.

```mermaid
flowchart LR
  subgraph User["Borrower"]
    P[Phone or laptop]
  end

  subgraph Client["Next.js App Router"]
    D[Dashboard]
    Q[Adaptive questions]
    R[Result / pack / card]
    L[Rate lab]
  end

  subgraph Store["This tab only"]
    S[sessionStorage]
  end

  subgraph Core["Pure TypeScript engine"]
    E["assess(answers, knobs)"]
    K[rules.ts knobs]
  end

  subgraph API["Optional same-process API"]
    A1[POST /api/assess]
    A2[GET /api/rules]
  end

  P --> D --> Q --> S
  S --> R
  R --> E
  L --> E
  D --> E
  E --> K
  A1 --> E
  A2 --> K
```

Nothing is stored on a server. There is no auth, no bureau pull, no Postgres.

### C4 — containers

```mermaid
flowchart LR
  Borrower((Borrower)) -->|everyday questions| Copilot[Borrower Copilot]
  Copilot -->|four numbers + pack| Borrower
  Borrower -->|holds up the card| Desk[(Bank desk)]
  Desk -->|rate + sanction| Borrower
```

```mermaid
flowchart TB
  subgraph Browser
    UI[React 19 pages]
    SS[sessionStorage]
    UI --- SS
  end

  subgraph NextServer["Next.js 15 — same repo"]
    Pages[App Router RSC / client pages]
    API["/api/assess  /api/rules"]
  end

  subgraph Engine["src/engine — no React"]
    Types[types.ts]
    Rules[rules.ts]
    Qs[questions.ts]
    Assess[assess.ts]
    Coach[coach.ts]
    Types --> Assess
    Rules --> Assess
    Qs --> Assess
    Assess --> Coach
  end

  UI --> Pages
  UI --> Assess
  API --> Assess
  API --> Rules
```

### Sequence — one check

```mermaid
sequenceDiagram
  actor B as Borrower
  participant D as Dashboard
  participant Q as /assess
  participant S as sessionStorage
  participant E as assess()
  participant R as Result / Pack / Card

  B->>D: Open localhost:3000
  D->>B: Rate board + sample files
  B->>Q: Start — 5 minutes
  loop Must questions, then extras
    Q->>B: Plain-language prompt
    B->>S: Save answer
  end
  B->>R: See numbers
  R->>E: assess(answers)
  E-->>R: verdict, two amounts, rate, EMI, card
  R->>B: Walk-in pack
```

---

## Low-level design — the engine

`assess()` is a pipeline. The UI never invents a number.

```mermaid
flowchart TD
  A[Answers] --> N[Normalize income<br/>lender vs household]
  N --> P[Route product]
  P --> F[Fair rate band + APR]
  P --> L[Lender amount<br/>FOIR × documented income, LTV]
  N --> S[Safe amount<br/>tighter FOIR, buffers, haircuts]
  L --> V[Verdict]
  S --> V
  F --> V
  V --> C[EMI ceiling + tenure]
  C --> X[Stress: income -20% or rate +200bps]
  X --> O[Assessment + negotiation card]
```

### Product routing (why Ravi is not on a personal loan)

```mermaid
flowchart TD
  Start[preferredProduct + purpose + collateral] --> Shop{Shop / house pledged<br/>and ask is business?}
  Shop -->|yes| LAP[loan against property]
  Shop -->|no| Home{Buying a home?}
  Home -->|yes| HL[home loan]
  Home -->|no| Gold{Gold pledged?}
  Gold -->|yes| GL[gold loan]
  Gold -->|no| TW{Scooter / bike?}
  TW -->|yes| TWL[two-wheeler]
  TW -->|no| Biz{Business without property?}
  Biz -->|yes| BL[business unsecured]
  Biz -->|no| PL[personal loan]
```

### Verdict

```mermaid
flowchart TD
  V{Can the household carry a new EMI?}
  V -->|bounce warm or 24%+ paper + no surplus| NB[dont_borrow]
  V -->|lender will fund more than is safe| BL[borrow_less]
  V -->|ask sits inside the safe band| B[borrow]
```

### Two amounts (the product thesis)

| Number | What it is | What it is not |
|---|---|---|
| **Lender amount** | FOIR on *documented* income, LTV on pledged asset | What you should take |
| **Safe amount** | FOIR on *household* cash, buffers, consumption haircut, bounce cap | What the RM’s target is |

Priya: bank may offer ~₹17–18L; she should take ~₹5.3–6.1L.  
Ravi: bank sees ITR ÷ 12 and the shop; he lives on a weak month at the till.  
Anita: salesman can still quote ₹70k–₹1.2L. Safe is **₹0**.

Unknown credit score is **`null`**, never 300.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| UI | Next.js 15 App Router + React 19 + TypeScript | One command, runs locally, works on a phone |
| Rules | Pure TypeScript in `src/engine/` | Zero React imports. Change a constant — or a lab slider — and the number moves |
| API | `POST /api/assess`, `GET /api/rules` | Same engine on the server. This is the full-stack boundary |
| Validation | Zod on the API | Rejects a malformed body without touching the UI |
| Tests | Vitest — 18 engine tests | Domain rules, not button clicks |
| Style | Tailwind 4 · Newsreader / Source Sans 3 / IBM Plex Mono | Readable on a phone at the branch |

Deliberately not added: auth, Postgres, Redis, Docker, a bureau SDK, an ML model. Extra infrastructure would have been theatre.

---

## Where the numbers live

All knobs are named exports in [`src/engine/rules.ts`](src/engine/rules.ts).

- Personal-loan FOIR: `FOIR_PERSONAL_PRIME` / `FOIR_SAFE_PERSONAL`
- Shop LTV: `LTV_LAP_LOW` / `LTV_LAP_HIGH`
- Bounce: `BOUNCE_RATE_BUMP`, `BOUNCE_SAFE_EMI_CAP_OF_INCOME`
- Unknown score: `resolvedScore()` returns `null` — unknown rate table, not 300
- Consumption haircut: `CONSUMPTION_SAFE_HAIRCUT`

The dashboard, API, tests, `/rules` and `/studio` all read that file.

---

## Repository map

```
src/engine/       rules, questions, assess(), coach — no UI
src/app/          dashboard, assess, result, pack, card, lab, compare, practice, rules
src/app/api/      POST /api/assess · GET /api/rules
src/components/   questionnaire, ranges, printable card
src/lib/          sessionStorage, language, share pack
docs/screenshots/ product tour
```

| File | What it is |
|---|---|
| [`RULES.md`](RULES.md) | Every threshold, why, and what I do not know |
| [`RUNTHROUGHS.md`](RUNTHROUGHS.md) | Priya, Ravi, Anita — questions, four outputs, cards |
| [`WALKTHROUGH.md`](WALKTHROUGH.md) | Five-minute written walkthrough |

---

## API

```bash
curl -s -X POST localhost:3000/api/assess \
  -H 'content-type: application/json' \
  -d '{"purpose":"wedding","amountWanted":800000,"incomeType":"salaried","monthlyIncome":110000,"existingEmis":14000,"monthlyExpenses":50000,"age":29,"creditBand":"exact","creditScore":780}'
```

The browser calls `assess()` directly. The API calls the same function. One source of judgement.
