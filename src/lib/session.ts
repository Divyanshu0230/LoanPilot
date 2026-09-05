import { emptyAnswers, type Answers, type QuestionId } from "@/engine";

export const SESSION_KEY = "loanpilot.session.v1";

export interface SessionState {
  answers: Answers;
  skipped: QuestionId[];
  personaId?: string;
}

export function loadSession(): SessionState {
  if (typeof window === "undefined") {
    return { answers: emptyAnswers(), skipped: [] };
  }
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { answers: emptyAnswers(), skipped: [] };
    const parsed = JSON.parse(raw) as SessionState;
    return {
      answers: { ...emptyAnswers(), ...parsed.answers },
      skipped: parsed.skipped ?? [],
      personaId: parsed.personaId,
    };
  } catch {
    return { answers: emptyAnswers(), skipped: [] };
  }
}

export function saveSession(state: SessionState) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
