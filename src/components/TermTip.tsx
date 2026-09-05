"use client";

import { useState } from "react";
import { TERMS } from "@/engine/plain";
import { useLang } from "@/lib/language";

export function TermTip({ id }: { id: keyof typeof TERMS }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const term = TERMS[id];
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border-b border-dotted border-accent text-accent"
      >
        {t(term.short, term.short)}
      </button>
      {open && (
        <span className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-rule bg-bg p-3 text-left text-sm text-ink shadow-md">
          {t(term.simple, term.simple)}
        </span>
      )}
    </span>
  );
}
