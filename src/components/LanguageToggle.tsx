"use client";

import { useLang } from "@/lib/language";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "hi" : "en")}
      className="rounded-full border border-rule px-2.5 py-0.5 text-xs font-semibold hover:border-accent"
    >
      {lang === "en" ? "आ आसान हिंदी" : "EN Simple English"}
    </button>
  );
}
