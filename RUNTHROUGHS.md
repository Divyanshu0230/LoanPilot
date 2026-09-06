# Three run-throughs

Numbers below are what `npm run personas` prints from `src/engine/personas.ts`. Same engine as the UI.

A few facts the brief did not give, which I had to type so the must-set could run:

| Borrower | Gap in the brief | What I entered | Why |
|---|---|---|---|
| Priya | Household spend besides the ₹28,000 rent | ₹50,000 (rent + ₹22,000 living) | Bengaluru software, one person, car already has its own EMI |
| Priya | Emergency savings | Left unanswered | The brief is silent. Silence cuts safe EMI 15% and is listed as an assumption |
| Ravi | Household spend | ₹28,000 | Couple, Mysuru, shop family. Not Bengaluru rent |
| Ravi | What the stock + vehicle will earn | ₹10,000 / month claimed | Counted at 40% = ₹4,000. Optimism haircut |
| Ravi | Emergency savings | 4 months | 14-year shop, unencumbered premises — I judged he is not at zero |
| Anita | Existing EMI on ₹35,000 app loans | ₹5,500 | 30%+ on a short remaining tenor |
| Anita | Household spend | ₹24,000 | Two children, one income, Hubballi |
| Anita | Emergency savings | 0 | Husband unemployed 8 months. There is no airbag |

---

## 1. Priya, 29 · Bengaluru · salaried

**Ask.** ₹8,00,000 personal loan for a wedding.

### Questions the app asked

**Must (9)**

1. Purpose → wedding  
2. Amount → ₹8,00,000  
3. Product she was told → personal loan  
4. How she earns → salaried  
5. Take-home → ₹1,10,000  
6. Existing EMIs → ₹14,000  
7. Household spend → ₹50,000  
8. Age → 29  
9. Credit → exact 780  

**Additional (each one moves a number; salaried path, no ITR, no till range)**

10. Employer → large MNC *(rate, sanction multiple)*  
11. Years in the job → 5 *(rate)*  
12. Variable share → 10% *(recognised income)*  
13. Dependents → 0 *(buffer)*  
14. Bounces → 0 *(rate / verdict)*  
15. Collateral → none *(stays personal)*  
16. Co-applicant → ₹0  
17. Upcoming other bill → ₹0  
18. Card utilisation → 30% *(no surcharge)*  

She did not see vintage, ITR, cash-range or app-loan rate. Those questions do not apply.

Skipped-on-purpose: emergency months. Safe EMI stays haircut 15%.

### Four outputs

| | |
|---|---|
| **O1 Verdict** | **Borrow less.** Lenders will fund a wedding. She should not take ₹8,00,000. It earns nothing. Safe carry is ₹5,30,000–₹6,10,000. |
| **O2 Lender sanction** | ₹17,10,000 – ₹18,20,000. 50% FOIR on a prime MNC file, 5-year tenure, 780 score. They can sell her more than twice the ask. |
| **O2 Safe carry** | ₹5,30,000 – ₹6,10,000. **Use this one.** |
| **O3 Fair rate** | 10.5% – 12.3% headline. All-in APR including 2.4% fee+GST: **12.7% – 14.9%.** A 14% sticker is already above fair. |
| **O4 EMI ceiling** | **₹20,000 / month** at a 36-month recommended ticket of ₹6,10,000. |

**Why ₹20,000 and not ₹30,000.** After the car EMI and ₹50,000 household, a 15% buffer and a 20% consumption haircut, ₹20,000 is what is left. ₹30,000 is what a 50% FOIR banker can extract — that is their number, not hers. ₹8,00,000 at ~11% for 36 months is already ~₹26,000 EMI. That is why the ask is “borrow less”, not “borrow”.

**Stress.** Income −20% → FOIR ~39% including the car. Still fits the 40% self-cap. The recommended ticket survives; the original ₹8L would not sit as quietly.

**Confidence.** High (~90%). Score, employer and tenure are known.

### Negotiation card

> **Borrow less than ₹8,00,000**  
> 29 yrs · salaried · ₹1,10,000/mo · score 780  
> Ask ₹6,10,000. Walk away above ₹6,10,000 or EMI ₹20,000 or a sticker above 12.3%.  
> Fair 10.5–12.3%. APR 12.7–14.9%.  
> If they quote 14%, the extra points are theirs, not the market.  
> They may wave ₹17–18L. Ignore it.  
> Refuse a top-up that pushes EMI above this card.

---

## 2. Ravi, 42 · Mysuru · self-employed

**Ask.** ₹15,00,000 for a second stock line and a delivery vehicle. He walks in thinking this is a personal loan. He has never had a bureau file.

### Questions the app asked

**Must (9)**

1. Purpose → business  
2. Amount → ₹15,00,000  
3. Product he was told → **personal loan** (we will override)  
4. How he earns → self-employed  
5. Typical month → ₹60,000 (mid of 40–80)  
6. Existing EMIs → ₹0  
7. Household spend → ₹28,000  
8. Age → 42  
9. Credit → **I don’t know**  

Unknown is not 300. The LAP unknown band is 10.5–13.5 before notches, then widened.

**Additional (self-employed path, no MNC employer question)**

10. Vintage → 14 years *(rate)*  
11. ITR → ₹4,20,000 *(this becomes the lender’s income: ₹35,000/mo)*  
12. Cash range → ₹40,000–₹80,000 *(safe side uses ₹40,000)*  
13. Dependents → 1  
14. Bounces → 0 (never had a loan)  
15. Emergency months → 4  
16. Collateral → shop, ₹45,00,000, unencumbered **← this reroutes the product**  
17. Co-applicant / wife → ₹18,000  
18. Upcoming bill → ₹0  
19. Extra monthly earn claimed → ₹10,000 *(we count ₹4,000)*  

He did not see employer type, variable bonus, or card utilisation.

### Four outputs

| | |
|---|---|
| **O1 Verdict** | **Borrow less.** He *should* borrow, on the right product. ₹15,00,000 sits a little above the ₹11,60,000–₹14,50,000 he can carry if the till has a thin month. |
| **Product** | **Loan against property.** Unencumbered shop of ₹45L should be pledged. Do not walk in for an unsecured personal loan. |
| **O2 Lender sanction** | ₹10,90,000 – ₹23,40,000. Wide, on purpose: no bureau, ITR only ₹4.2L, LTV on ₹45L would allow more than FOIR on documents. Low end is FOIR on ITR + 70% of wife; high end is LTV. |
| **O2 Safe carry** | ₹11,60,000 – ₹14,50,000 on the ₹40,000 thin month + 80% of wife. **Use this one.** Recommended ₹14,50,000. |
| **O3 Fair rate** | 9.7% – 13.9% on **LAP**. All-in APR including 1.2% fee+GST: **10.5% – 15.2%.** An unsecured PL quote at 18–22% is what the card tells him to refuse. |
| **O4 EMI ceiling** | **₹20,500 / month** over 120 months. |

**Why the two amounts differ.** The lender’s high number is the shop. The borrower’s number is the till in a thin month. They are not supposed to match. If a banker says “we can do 22 lakh against the premises”, that is a sales sentence.

**Why ₹20,500 and not ₹30,000.** Residual after ₹28,000 household and an 18% buffer (15% + 3% for one dependent), plus 40% of the claimed extra earn. ₹30,000 would assume the fat ₹80,000 month is the month that pays the EMI.

**Stress.** Income −20% → FOIR ~47%, **fails** the 45% LAP self-cap. That is why the verdict is borrow less, not borrow: even ₹14.5L is tight if the till dips. Take closer to ₹12L, or split the vehicle.

**Confidence.** Medium (capped at 58%). No score.

### Negotiation card

> **Borrow less than ₹15,00,000**  
> 42 yrs · self-employed · ₹60,000/mo · score unknown  
> Ask ₹14,50,000 as a **shop-secured LAP**. Walk away above that, or EMI ₹20,500, or a sticker above 13.9%.  
> Fair 9.7–13.9% LAP. APR 10.5–15.2%.  
> **Refuse:** unsecured personal loan or merchant cash at 18%+.  
> They may wave ₹23L against the shop. Do not take it.

---

## 3. Anita, 35 · Hubballi · informal

**Ask.** ₹1,50,000 for an electric scooter to double delivery runs.

This is where I said no. The scooter would help her earn. The household still cannot carry it.

### Questions the app asked

**Must (9)**

1. Purpose → vehicle  
2. Amount → ₹1,50,000  
3. Product → two-wheeler  
4. How she earns → informal  
5. Typical month → ₹28,000  
6. Existing EMIs → ₹5,500  
7. Household spend → ₹24,000  
8. Age → 35  
9. Credit → I don’t know  

**Additional (informal path)**

10. Cash range → ₹26,000–₹30,000  
11. Dependents → 2 *(buffer up, surplus gone)*  
12. Bounces → **1 last month**  
13. Emergency months → **0**  
14. Collateral → none  
15. Co-applicant → ₹0 (husband unemployed)  
16. Upcoming bill → ₹0  
17. Extra earn claimed → ₹8,000 *(we count ₹3,200; it does not save the verdict)*  
18. Costliest existing rate → **32%**  

She did not see MNC employer, ITR, or card utilisation.

### Four outputs

| | |
|---|---|
| **O1 Verdict** | **Don’t borrow.** A bounce is still warm and she is already on 24%+ paper. The next EMI is how a squeeze becomes a default. Clean the app loans first — gold if she has it. Do not add a scooter. |
| **O2 Lender (sales)** | ₹70,000 – ₹1,20,000. A two-wheeler counter may still try to book this. It is a sales number, not a prudent sanction. A FOIR on 50% of ₹28,000 after ₹5,500 existing EMI is ~₹0. |
| **O2 Safe carry** | **₹0.** Use this one. |
| **O3 Fair rate** | 17.5% – 24.7% if she ignored us and still took a 2W. All-in APR **20.5% – 29.4%.** The 30%+ app loans she already has are at or above the top of even this ugly band. |
| **O4 EMI ceiling** | **₹0 / month.** |

**Why ₹0 and not a “small” ₹3,000.** Surplus after EMI and a family of four is already negative-to-flat. A bounce plus 32% paper is the Don’t-borrow latch. A kind-looking ₹3,000 EMI is how the second bounce arrives.

**What she can do tomorrow.** Do not sign a scooter form. If there is gold in the house, a gold loan at 10–14% to retire the ₹35,000 app stack saves more than the scooter can earn. Revisit a used scooter in six clean months.

**Stress.** Already failed in the base case. Income −20% does not change the answer.

**Confidence.** Medium, capped — no score, informal file.

### Negotiation card

> **Do not sign today**  
> 35 yrs · informal · ₹28,000/mo · score unknown  
> Ask ₹0. Walk away from any new EMI.  
> If they quote a 2W at 18% on ₹1,00,000, refuse it.  
> **Refuse:** any app loan, top-up, or 30% “instant” offer.  
> **Insist on:** nothing new. Gold only to retire the 32% paper, if metal exists.

---

## Side by side

| | Priya | Ravi | Anita |
|---|---|---|---|
| Verdict | Borrow less | Borrow less (right product) | Don’t borrow |
| Product | Personal | **LAP, not PL** | Two-wheeler (refuse it) |
| Lender vs safe | 17–18L vs 5.3–6.1L | 10.9–23.4L vs 11.6–14.5L | 0.7–1.2L sales vs ₹0 |
| Rate band | 10.5–12.3% PL | 9.7–13.9% LAP | 17.5–24.7% 2W |
| EMI ceiling | ₹20,000 | ₹20,500 | ₹0 |
| Unknown score? | No, 780 | Yes — not treated as 300 | Yes — not treated as 300 |
