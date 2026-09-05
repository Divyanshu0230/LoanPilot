import type { Answers, OutputKey, QuestionId } from "./types";

export type FieldKind = "choice" | "inr" | "number" | "percent" | "credit" | "cashRange" | "collateral";

export interface Choice {
  value: string;
  label: string;
  labelHi?: string;
  hint?: string;
}

export interface Question {
  id: QuestionId;
  tier: "must" | "additional";
  prompt: string;
  promptHi: string;
  help: string;
  helpHi: string;
  kind: FieldKind;
  options?: Choice[];
  unitLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  showIf: (a: Answers) => boolean;
  affects: OutputKey[];
  tighten: string;
}

const always = () => true;

export const QUESTIONS: Question[] = [
  {
    id: "purpose",
    tier: "must",
    prompt: "What do you need this money for?",
    promptHi: "Yeh paise kis kaam ke liye chahiye?",
    help: "A wedding and a shop are not the same loan. Tell us the real reason.",
    helpHi: "Shaadi aur dukan ka loan alag hota hai. Asli wajah batao.",
    kind: "choice",
    options: [
      { value: "wedding", label: "Wedding or family function", labelHi: "Shaadi ya ghar ka function" },
      { value: "education", label: "Education", labelHi: "Padhai" },
      { value: "medical", label: "Medical", labelHi: "Ilaaj" },
      { value: "home", label: "Buy a home", labelHi: "Ghar kharidna" },
      { value: "renovation", label: "Home repair", labelHi: "Ghar ki marammat" },
      { value: "vehicle", label: "Scooter, bike or car", labelHi: "Scooter, bike ya car" },
      { value: "business", label: "Shop, stock or business", labelHi: "Dukan, maal ya business" },
      { value: "refinance", label: "Pay off other loans", labelHi: "Purane loan utarna" },
      { value: "consumption", label: "Travel or other spending", labelHi: "Travel ya aur kharch" },
      { value: "other", label: "Something else", labelHi: "Kuch aur" },
    ],
    showIf: always,
    affects: ["verdict", "safeAmount", "product"],
    tighten: "Changes whether we say yes, less, or no — and which loan type.",
  },
  {
    id: "amountWanted",
    tier: "must",
    prompt: "How much do you want to borrow?",
    promptHi: "Kitna loan lena chahte ho?",
    help: "Type the amount in your head. We will say if it is too much. You can write 8L for ₹8 lakh.",
    helpHi: "Jo soch ke aaye ho woh likho. Zyada hua toh hum bata denge. 8L likhne se ₹8 lakh ho jayega.",
    kind: "inr",
    min: 10000,
    max: 50000000,
    step: 10000,
    showIf: always,
    affects: ["verdict", "emi"],
    tighten: "Compared with what is safe for you and what a bank may give.",
  },
  {
    id: "preferredProduct",
    tier: "must",
    prompt: "What kind of loan were you told to take?",
    promptHi: "Aapko kaunsa loan lene ko kaha gaya?",
    help: "Not sure? Pick “recommend”. We may suggest a cheaper type — for example a loan on your shop instead of a personal loan.",
    helpHi: "Pata nahi? “Recommend” dabao. Kabhi sasta rasta hota hai — jaise dukan ke kaagaz par loan, personal loan nahi.",
    kind: "choice",
    options: [
      { value: "recommend", label: "I am not sure — you tell me", labelHi: "Pata nahi — aap batao" },
      { value: "personal", label: "Personal loan", labelHi: "Personal loan" },
      { value: "business", label: "Business loan", labelHi: "Business loan" },
      { value: "lap", label: "Loan on my house or shop", labelHi: "Ghar ya dukan par loan" },
      { value: "home", label: "Home loan", labelHi: "Home loan" },
      { value: "gold", label: "Gold loan", labelHi: "Sone par loan" },
      { value: "two_wheeler", label: "Scooter / bike loan", labelHi: "Scooter / bike loan" },
    ],
    showIf: always,
    affects: ["product", "rate", "lenderAmount"],
    tighten: "Starting point. Your shop or gold can change this.",
  },
  {
    id: "incomeType",
    tier: "must",
    prompt: "How do you earn money?",
    promptHi: "Aap paise kaise kamate ho?",
    help: "Salary, own shop, or cash / app work. Banks treat these three differently.",
    helpHi: "Salary, apni dukan, ya cash / app ka kaam. Bank in teeno ko alag dekhta hai.",
    kind: "choice",
    options: [
      { value: "salaried", label: "Salary — company pays me", labelHi: "Salary — company deti hai" },
      { value: "self_employed", label: "Own shop / business / practice", labelHi: "Apni dukan / business" },
      { value: "informal", label: "Cash or app work — delivery, tailoring, daily", labelHi: "Cash ya app — delivery, silai, daily" },
    ],
    showIf: always,
    affects: ["rate", "lenderAmount", "safeAmount", "product"],
    tighten: "Picks which extra questions you see, and how we count income.",
  },
  {
    id: "monthlyIncome",
    tier: "must",
    prompt: "In a normal month, how much comes in?",
    promptHi: "Normal mahine mein kitna aata hai?",
    help: "After tax if you have a payslip. If some months are high and some are low, put a normal month.",
    helpHi: "Tax ke baad, agar payslip hai. Kabhi zyada kabhi kam ho toh normal mahina likho.",
    kind: "inr",
    min: 5000,
    max: 5000000,
    step: 1000,
    showIf: always,
    affects: ["lenderAmount", "safeAmount", "emi", "verdict"],
    tighten: "This is the base for every rupee we calculate.",
  },
  {
    id: "existingEmis",
    tier: "must",
    prompt: "How much do you already pay in EMIs each month?",
    promptHi: "Abhi har mahine EMI mein kitna jaata hai?",
    help: "Add every running loan — car, app loans, cards on EMI. Do not add rent. Put 0 if none.",
    helpHi: "Har chal raha loan jodo — car, app loan, card EMI. Kiraya mat jodo. Kuch nahi hai toh 0.",
    kind: "inr",
    min: 0,
    max: 2000000,
    step: 500,
    showIf: always,
    affects: ["lenderAmount", "safeAmount", "emi", "verdict"],
    tighten: "Taken off before we add any new monthly payment.",
  },
  {
    id: "monthlyExpenses",
    tier: "must",
    prompt: "What does the house already spend in a month (not EMIs)?",
    promptHi: "Ghar ka mahine ka kharch kya hai (EMI chhod ke)?",
    help: "Rent, food, school, petrol, UPI. Guess a little high if you are unsure — that is safer.",
    helpHi: "Kiraya, khana, school, petrol, UPI. Pakka nahi hai toh thoda zyada likho — safer hai.",
    kind: "inr",
    min: 0,
    max: 2000000,
    step: 1000,
    showIf: always,
    affects: ["safeAmount", "emi", "verdict"],
    tighten: "Shows what money is actually left after the house is fed.",
  },
  {
    id: "age",
    tier: "must",
    prompt: "Your age?",
    promptHi: "Aapki umar?",
    help: "Loans are cut short so they finish before retirement age. This only changes how many years you can take.",
    helpHi: "Loan retirement se pehle khatam hona chahiye. Sirf itne saal ka farak padta hai.",
    kind: "number",
    unitLabel: "years",
    min: 18,
    max: 70,
    step: 1,
    showIf: always,
    affects: ["emi", "lenderAmount", "safeAmount"],
    tighten: "Limits how many years the loan can run.",
  },
  {
    id: "credit",
    tier: "must",
    prompt: "Do you know your credit score?",
    promptHi: "Credit score pata hai? (CIBIL)",
    help: "A 3-digit number from CIBIL / Experian, usually 300–900. If you don’t know, tap that — we will not treat you as 300.",
    helpHi: "CIBIL ka 3-digit number, aksar 300–900. Nahi pata? Wahi dabao — hum 300 nahi maanenge.",
    kind: "credit",
    showIf: always,
    affects: ["rate", "lenderAmount", "confidence"],
    tighten: "Sets the interest band. “I don’t know” keeps the band wide.",
  },
  {
    id: "employerType",
    tier: "additional",
    prompt: "What kind of company do you work for?",
    promptHi: "Kis tarah ki company mein kaam karte ho?",
    help: "Big MNC or government jobs usually get a slightly cheaper rate.",
    helpHi: "Badi MNC ya sarkari naukri par byaj thoda kam milta hai.",
    kind: "choice",
    options: [
      { value: "mnc", label: "Large MNC", labelHi: "Badi MNC" },
      { value: "govt", label: "Government or PSU", labelHi: "Sarkari / PSU" },
      { value: "listed", label: "Listed Indian company", labelHi: "Listed Indian company" },
      { value: "pvt", label: "Private company", labelHi: "Private company" },
      { value: "other", label: "Startup / contract / other", labelHi: "Startup / contract / aur" },
    ],
    showIf: (a) => a.incomeType === "salaried",
    affects: ["rate", "lenderAmount"],
    tighten: "MNC or government can lower the rate a little.",
  },
  {
    id: "employmentYears",
    tier: "additional",
    prompt: "How many years in this job?",
    promptHi: "Is job mein kitne saal ho gaye?",
    help: "Less than 1 year looks risky to a bank. 5 years looks stable.",
    helpHi: "1 saal se kam par bank ghabrata hai. 5 saal par vishwas hota hai.",
    kind: "number",
    unitLabel: "years",
    min: 0,
    max: 40,
    step: 0.5,
    showIf: (a) => a.incomeType === "salaried",
    affects: ["rate", "lenderAmount"],
    tighten: "Under 1 year raises the rate. 5+ years lowers it a bit.",
  },
  {
    id: "variableIncomeShare",
    tier: "additional",
    prompt: "How much of your pay is bonus or overtime?",
    promptHi: "Salary ka kitna hissa bonus ya overtime hai?",
    help: "We count only part of bonus. A fat bonus month is not a month you should plan EMIs on.",
    helpHi: "Bonus ka poora hisaab nahi. Moti bonus wali mahine par EMI mat jodo.",
    kind: "percent",
    min: 0,
    max: 80,
    step: 5,
    showIf: (a) => a.incomeType === "salaried",
    affects: ["lenderAmount", "safeAmount"],
    tighten: "Lowers the income we count, so the loan amount comes down.",
  },
  {
    id: "businessVintageYears",
    tier: "additional",
    prompt: "How many years has this business been running?",
    promptHi: "Yeh business kitne saal se chal raha hai?",
    help: "For a shop, years in business matter as much as a credit score.",
    helpHi: "Dukan ke liye kitne saal chali, yeh score jitna hi zaroori hai.",
    kind: "number",
    unitLabel: "years",
    min: 0,
    max: 50,
    step: 1,
    showIf: (a) => a.incomeType === "self_employed",
    affects: ["rate", "lenderAmount", "verdict"],
    tighten: "10+ years can lower the rate. Under 3 years keeps it high.",
  },
  {
    id: "documentedAnnualIncome",
    tier: "additional",
    prompt: "What yearly income is on your latest tax return?",
    promptHi: "Last ITR pe saal ki income kya likhi hai?",
    help: "This is what the bank will believe. Cash in the till is your number; the tax return is theirs.",
    helpHi: "Bank ITR maanta hai. Galla aapka number hai; ITR unka.",
    kind: "inr",
    min: 0,
    max: 50000000,
    step: 10000,
    showIf: (a) => a.incomeType === "self_employed",
    affects: ["lenderAmount", "rate"],
    tighten: "Changes the bank’s number. Your safe number still uses a thin cash month.",
  },
  {
    id: "cashRange",
    tier: "additional",
    prompt: "In a weak month and a strong month, how much comes in?",
    promptHi: "Kamzor mahine aur acche mahine mein kitna aata hai?",
    help: "We plan your EMI on the weak month. The strong month does not raise your ceiling.",
    helpHi: "EMI kamzor mahine pe. Accha mahina ceiling nahi badhata.",
    kind: "cashRange",
    showIf: (a) => a.incomeType === "self_employed" || a.incomeType === "informal",
    affects: ["safeAmount", "lenderAmount", "emi"],
    tighten: "Your safe EMI moves to the weaker month.",
  },
  {
    id: "dependents",
    tier: "additional",
    prompt: "How many people live on this income?",
    promptHi: "Is income pe kitne log palte hain?",
    help: "Children, parents, anyone who eats from this money. Each person leaves less room for a new EMI.",
    helpHi: "Bacche, maa-baap — jo is paise se khate hain. Har extra aadmi se nayi EMI mushkil.",
    kind: "number",
    unitLabel: "people",
    min: 0,
    max: 12,
    step: 1,
    showIf: always,
    affects: ["safeAmount", "emi", "verdict"],
    tighten: "Lowers the EMI we say you should agree to.",
  },
  {
    id: "pastBounces",
    tier: "additional",
    prompt: "How many EMIs bounced in the last 12 months?",
    promptHi: "Pichhle 12 mahine mein kitni EMI bounce hui?",
    help: "A bounce means the auto-debit failed. If you skip this, we will not assume the worst — and we will not say “don’t borrow” on a bounce we have not seen.",
    helpHi: "Bounce matlab account se paise nahi kate. Skip karoge toh hum worst nahi maanenge — aur bina dekhe “mat lo” bhi nahi kahenge.",
    kind: "number",
    unitLabel: "times",
    min: 0,
    max: 12,
    step: 1,
    showIf: always,
    affects: ["verdict", "rate", "lenderAmount", "safeAmount"],
    tighten: "A bounce raises the rate and can turn the answer into “don’t borrow”.",
  },
  {
    id: "emergencyMonths",
    tier: "additional",
    prompt: "If income stopped tomorrow, how many months can the house run?",
    promptHi: "Kal income band ho jaye toh kitne mahine ghar chalega?",
    help: "Count cash, gold you would actually sell, and FDs you can break. Not PF you cannot touch.",
    helpHi: "Cash, woh sona jo bechoge, todne layak FD. PF mat gino.",
    kind: "number",
    unitLabel: "months",
    min: 0,
    max: 24,
    step: 0.5,
    showIf: always,
    affects: ["safeAmount", "verdict", "emi"],
    tighten: "Under 3 months, we cut the safe EMI. If you skip, we already cut it a little.",
  },
  {
    id: "collateral",
    tier: "additional",
    prompt: "Is there a shop, house, gold or vehicle you could pledge?",
    promptHi: "Koi dukan, ghar, sona ya gaadi girvi rakh sakte ho?",
    help: "Pledging an asset often gets a cheaper loan than a personal loan. Say “nothing” if you will not pledge.",
    helpHi: "Samaan girvi rakhne se personal loan se sasta milta hai. Nahi rakhna hai toh “kuch nahi”.",
    kind: "collateral",
    showIf: always,
    affects: ["product", "lenderAmount", "rate"],
    tighten: "Shop or house can switch you to a cheaper property loan. Gold to a gold loan.",
  },
  {
    id: "coApplicantIncome",
    tier: "additional",
    prompt: "Does a spouse or family member earn, and how much a month?",
    promptHi: "Patni / pati ya ghar ka koi aur kamata hai? Mahine ka kitna?",
    help: "Put 0 if they will not join the loan. We count most of it, not all of it.",
    helpHi: "Loan pe nahi aayenge toh 0. Hum poora nahi, zyadatar ginte hain.",
    kind: "inr",
    min: 0,
    max: 2000000,
    step: 1000,
    showIf: always,
    affects: ["lenderAmount", "safeAmount", "emi"],
    tighten: "Adds a second income, which can raise both amounts.",
  },
  {
    id: "upcomingExpense",
    tier: "additional",
    prompt: "Any big bill coming this year, besides this loan?",
    promptHi: "Is saal koi bada kharch aur hai, is loan ke alawa?",
    help: "School admission, medical, another wedding. We spread it over 12 months.",
    helpHi: "School, ilaaj, aur koi shaadi. 12 mahine mein baant ke ginte hain.",
    kind: "inr",
    min: 0,
    max: 10000000,
    step: 5000,
    showIf: always,
    affects: ["safeAmount", "emi"],
    tighten: "Lowers how much EMI is left for this loan.",
  },
  {
    id: "productiveMonthlyEarn",
    tier: "additional",
    prompt: "If this loan will earn, how much extra per month — honestly?",
    promptHi: "Is loan se extra kamai kitni hogi — sach sach?",
    help: "We believe only part of this. A scooter that “doubles runs” still has petrol and off days.",
    helpHi: "Hum poora nahi maante. Scooter se double run ke saath petrol aur chhutti bhi hoti hai.",
    kind: "inr",
    min: 0,
    max: 500000,
    step: 500,
    showIf: (a) =>
      a.purpose === "business" ||
      a.purpose === "vehicle" ||
      a.purpose === "education" ||
      a.purpose === "refinance",
    affects: ["verdict", "safeAmount"],
    tighten: "This is the only question that can raise your safe EMI.",
  },
  {
    id: "cardUtilisation",
    tier: "additional",
    prompt: "How full are your credit cards right now?",
    promptHi: "Credit card abhi kitna bhara hua hai?",
    help: "If you have used more than about 70% of the limit, banks often charge a bit more.",
    helpHi: "Limit ka 70% se zyada use hai toh bank thoda mehnga kar deta hai.",
    kind: "percent",
    min: 0,
    max: 100,
    step: 5,
    showIf: (a) => a.incomeType === "salaried" || a.incomeType === "self_employed",
    affects: ["rate"],
    tighten: "Over 70% adds about 1% to the rate band.",
  },
  {
    id: "existingLoanRate",
    tier: "additional",
    prompt: "On your costliest running loan, what interest are you paying?",
    promptHi: "Sabse mehnga chal raha loan kis byaj pe hai?",
    help: "App loans at 30% change the answer. Sometimes the right move is to stop, not to add a scooter.",
    helpHi: "30% wale app loan se faisla badal jaata hai. Kabhi scooter nahi, pehle woh loan band karna sahi hai.",
    kind: "percent",
    min: 0,
    max: 60,
    step: 0.5,
    showIf: (a) => (a.existingEmis ?? 0) > 0,
    affects: ["verdict", "rate"],
    tighten: "Very high rates plus a bounce can mean “don’t borrow”.",
  },
  {
    id: "existingOfferRate",
    tier: "additional",
    prompt: "Has a bank or app already quoted you a rate?",
    promptHi: "Kisi bank ya app ne rate bata diya hai?",
    help: "Type their number. We will say if it is fair, or if you should walk away.",
    helpHi: "Unka number likho. Hum bataenge yeh theek hai ya wahan se uth jao.",
    kind: "percent",
    min: 6,
    max: 48,
    step: 0.1,
    showIf: always,
    affects: ["rate"],
    tighten: "Sets the “walk away if higher than this” line on your card.",
  },
];

export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => q.showIf(answers));
}

export function isAnswered(id: QuestionId, a: Answers): boolean {
  switch (id) {
    case "purpose":
      return a.purpose != null;
    case "amountWanted":
      return a.amountWanted != null;
    case "preferredProduct":
      return a.preferredProduct != null;
    case "incomeType":
      return a.incomeType != null;
    case "monthlyIncome":
      return a.monthlyIncome != null;
    case "existingEmis":
      return a.existingEmis != null;
    case "monthlyExpenses":
      return a.monthlyExpenses != null;
    case "age":
      return a.age != null;
    case "credit":
      return a.creditBand != null;
    case "employerType":
      return a.employerType != null;
    case "employmentYears":
      return a.employmentYears != null;
    case "variableIncomeShare":
      return a.variableIncomeShare != null;
    case "businessVintageYears":
      return a.businessVintageYears != null;
    case "documentedAnnualIncome":
      return a.documentedAnnualIncome != null;
    case "cashRange":
      return a.cashMonthlyLow != null && a.cashMonthlyHigh != null;
    case "dependents":
      return a.dependents != null;
    case "pastBounces":
      return a.pastBounces != null;
    case "emergencyMonths":
      return a.emergencyMonths != null;
    case "collateral":
      return a.collateralType != null;
    case "coApplicantIncome":
      return a.coApplicantIncome != null;
    case "upcomingExpense":
      return a.upcomingExpense != null;
    case "productiveMonthlyEarn":
      return a.productiveMonthlyEarn != null;
    case "cardUtilisation":
      return a.cardUtilisation != null;
    case "existingOfferRate":
      return a.existingOfferRate != null;
    case "existingLoanRate":
      return a.existingLoanRate != null;
    default:
      return false;
  }
}

export function mustComplete(answers: Answers): boolean {
  return visibleQuestions(answers)
    .filter((q) => q.tier === "must")
    .every((q) => isAnswered(q.id, answers));
}

export function nextQuestion(
  answers: Answers,
  skipped: QuestionId[],
): Question | null {
  const visible = visibleQuestions(answers);
  const open = (tier: "must" | "additional") =>
    visible.find(
      (q) => q.tier === tier && !isAnswered(q.id, answers) && !skipped.includes(q.id),
    );
  return open("must") ?? open("additional") ?? null;
}

export function progress(answers: Answers, skipped: QuestionId[]) {
  const visible = visibleQuestions(answers);
  const must = visible.filter((q) => q.tier === "must");
  const add = visible.filter((q) => q.tier === "additional");
  const mustDone = must.filter((q) => isAnswered(q.id, answers)).length;
  const addDone = add.filter(
    (q) => isAnswered(q.id, answers) || skipped.includes(q.id),
  ).length;
  return {
    mustDone,
    mustTotal: must.length,
    addDone,
    addTotal: add.length,
    answeredAdditional: add.filter((q) => isAnswered(q.id, answers)).length,
  };
}
