import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "screenshots");
mkdirSync(outDir, { recursive: true });

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const base = "http://127.0.0.1:3000";

const shots = [
  { file: "01-dashboard.png", url: "/", needle: "Borrower dashboard", height: 1100 },
  { file: "02-dashboard-file.png", prep: "ravi", url: "/", needle: "Your file", height: 1100 },
  { file: "03-assess.png", url: "/assess?new=1", needle: "What do you need this money for", height: 980 },
  { file: "04-result-priya.png", url: "/result?persona=priya", needle: "How sure we are", height: 1400 },
  { file: "05-wait-and-year.png", url: "/result?persona=priya", needle: "Wait a few months", height: 1200, scroll: "Wait a few months" },
  { file: "06-quotes.png", url: "/result?persona=priya", needle: "Two desks", height: 1000, scroll: "Two desks" },
  { file: "07-pack.png", url: "/pack?persona=priya", needle: "Walk-in pack", height: 1200 },
  { file: "08-card.png", url: "/card?persona=priya", needle: "Borrow less", height: 1100 },
  { file: "09-lab.png", url: "/studio", needle: "See a rule move", height: 1000 },
  { file: "10-compare.png", url: "/compare", needle: "Three lives", height: 1000 },
  { file: "11-practice.png", url: "/practice", needle: "Practice on Priya", height: 1000 },
  { file: "12-rules.png", url: "/rules", needle: "Every rule", height: 1000 },
  { file: "13-result-ravi.png", url: "/result?persona=ravi", needle: "How sure we are", height: 1200 },
  { file: "14-result-anita.png", url: "/result?persona=anita", needle: "Do not take this loan", height: 1200 },
  { file: "15-hinglish.png", url: "/", lang: "hi", needle: "Borrower dashboard", height: 1100 },
];

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});

async function waitForText(page, text, ms = 25000) {
  await page.waitForFunction(
    (t) => (document.body?.innerText || "").toLowerCase().includes(t.toLowerCase()),
    { timeout: ms },
    text,
  );
}

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: shot.height ?? 900, deviceScaleFactor: 2 });
  await page.evaluateOnNewDocument((lang) => {
    localStorage.setItem("loanpilot.lang", lang);
  }, shot.lang === "hi" ? "hi" : "en");

  if (shot.prep === "ravi") {
    await page.goto(`${base}/result?persona=ravi`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForText(page, "How sure we are");
  }

  await page.goto(`${base}${shot.url}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await waitForText(page, shot.needle);
  await page.addStyleTag({
    content: "nextjs-portal,[data-next-badge-root],#__next-build-watcher{display:none!important}",
  });
  await new Promise((r) => setTimeout(r, 700));

  if (shot.scroll) {
    await page.evaluate((t) => {
      const el = [...document.querySelectorAll("h1,h2,h3,p,section")].find((n) =>
        n.textContent?.includes(t),
      );
      el?.scrollIntoView({ block: "start" });
    }, shot.scroll);
    await new Promise((r) => setTimeout(r, 400));
  }

  await page.screenshot({ path: join(outDir, shot.file), type: "png" });
  console.log("wrote", shot.file);
  await page.close();
}

await browser.close();
