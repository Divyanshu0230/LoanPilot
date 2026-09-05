"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "hi";

const KEY = "loanpilot.lang";

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (en: string, hi: string) => string;
}>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "hi") setLangState(saved);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem(KEY, next);
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: (en, hi) => (lang === "hi" ? hi : en),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
