const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "NEXTAUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

const PRODUCTION_ENV_VARS = ["NEXTAUTH_URL"] as const;

let validated = false;

function shouldRequireNextAuthUrl(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  // `next build` sets NEXT_PHASE; production URL may not be available yet
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return true;
}

export function validateEnv(): void {
  if (validated) return;

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      console.error(`Missing required env var: ${key}`);
      throw new Error(`Missing required env var: ${key}`);
    }
  }

  if (shouldRequireNextAuthUrl()) {
    for (const key of PRODUCTION_ENV_VARS) {
      const value = process.env[key];
      if (!value || value.trim() === "") {
        console.error(`Missing required env var: ${key}`);
        throw new Error(`Missing required env var: ${key}`);
      }
    }
  }

  validated = true;
}

/** Logs warnings for optional chat/AI env vars (non-fatal). */
export function validateChatEnv(): void {
  const optional = [
    "GROQ_API_KEY",
    "GOOGLE_GENERATIVE_AI_API_KEY",
    "PUSHER_APP_ID",
    "NEXT_PUBLIC_PUSHER_KEY",
    "PUSHER_SECRET",
    "NEXT_PUBLIC_PUSHER_CLUSTER",
  ] as const;

  if (process.env.NODE_ENV === "production") {
    const missing = optional.filter((k) => !process.env[k]?.trim());
    if (missing.length > 0) {
      console.warn(
        `[chat] Optional env vars not set (AI/realtime may use fallbacks): ${missing.join(", ")}`
      );
    }
  }
}
