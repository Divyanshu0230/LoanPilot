"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { NegotiationCardView } from "@/components/NegotiationCardView";
import { assess, canAssess, type Assessment } from "@/engine";
import { personaById } from "@/engine/personas";
import { loadSession, saveSession } from "@/lib/session";

export default function CardPage() {
  return (
    <Suspense fallback={<p className="p-8">Preparing card…</p>}>
      <CardInner />
    </Suspense>
  );
}

function CardInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [view, setView] = useState<{ assessment: Assessment; name?: string } | null>(null);

  useEffect(() => {
    const personaId = params.get("persona");
    if (personaId) {
      const persona = personaById(personaId);
      if (persona) {
        saveSession({ answers: persona.answers, skipped: [], personaId });
        setView({ assessment: assess(persona.answers), name: persona.name });
        return;
      }
    }
    const session = loadSession();
    if (!canAssess(session.answers)) {
      router.replace("/assess?new=1");
      return;
    }
    setView({
      assessment: assess(session.answers),
      name: session.personaId ? personaById(session.personaId)?.name : undefined,
    });
  }, [router, params]);

  if (!view) return <p className="p-8">Preparing card…</p>;

  return (
    <div className="min-h-screen bg-bg px-4 py-8 text-ink">
      <div className="no-print mx-auto mb-4 flex max-w-[46rem] items-center justify-between text-sm">
        <Link href="/result" className="text-muted hover:text-ink">
          Back
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-accent px-4 py-2 font-semibold text-accent-ink"
        >
          Print / PDF
        </button>
      </div>
      <div className="mx-auto max-w-[46rem]">
        <NegotiationCardView card={view.assessment.card} name={view.name} />
      </div>
    </div>
  );
}
