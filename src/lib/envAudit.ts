export type EnvStatus = "ok" | "missing" | "placeholder";

export interface EnvCheck {
  key: string;
  status: EnvStatus;
  category: string;
  note?: string;
}

const PLACEHOLDER_PATTERNS = [
  /^your_/i,
  /^sk_test_\.\.\./,
  /^whsec_\.\.\./,
  /01XXXXXXXXX/,
  /^xxx/i,
];

function checkValue(key: string, value: string | undefined): EnvStatus {
  if (!value || value.trim() === "") return "missing";
  if (PLACEHOLDER_PATTERNS.some((p) => p.test(value.trim()))) return "placeholder";
  return "ok";
}

/** Audit env vars used across the app (non-secret summary for admin UI). */
export function auditEnvironment(): EnvCheck[] {
  const checks: Array<{ key: string; category: string; note?: string }> = [
    { key: "MONGODB_URI", category: "Core", note: "Required" },
    { key: "MONGODB_DB_NAME", category: "Core" },
    { key: "NEXTAUTH_SECRET", category: "Core", note: "Required" },
    { key: "AUTH_SECRET", category: "Core" },
    { key: "NEXT_PUBLIC_APP_URL", category: "Core", note: "Required" },
    { key: "NEXTAUTH_URL", category: "Core", note: "Required in production" },
    { key: "CLOUDINARY_CLOUD_NAME", category: "Storage" },
    { key: "CLOUDINARY_API_KEY", category: "Storage" },
    { key: "CLOUDINARY_API_SECRET", category: "Storage" },
    { key: "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", category: "Storage" },
    { key: "SMTP_USER", category: "Email" },
    { key: "SMTP_PASSWORD", category: "Email" },
    { key: "SMTP_HOST", category: "Email" },
    { key: "SMTP_FROM_NAME", category: "Email" },
    { key: "GROQ_API_KEY", category: "AI Chat" },
    { key: "GOOGLE_GENERATIVE_AI_API_KEY", category: "AI Chat" },
    { key: "PUSHER_APP_ID", category: "Live Chat" },
    { key: "NEXT_PUBLIC_PUSHER_KEY", category: "Live Chat" },
    { key: "PUSHER_SECRET", category: "Live Chat" },
    { key: "NEXT_PUBLIC_PUSHER_CLUSTER", category: "Live Chat" },
    { key: "NEXT_PUBLIC_DEFAULT_CURRENCY", category: "Payments" },
    { key: "NEXT_PUBLIC_BKASH_NUMBER", category: "Payments" },
    { key: "NEXT_PUBLIC_NAGAD_NUMBER", category: "Payments" },
    { key: "SSLCOMMERZ_STORE_ID", category: "Payments" },
    { key: "SSLCOMMERZ_STORE_PASSWORD", category: "Payments" },
    { key: "SSLCOMMERZ_IS_LIVE", category: "Payments" },
    { key: "STRIPE_SECRET_KEY", category: "Payments" },
    { key: "STRIPE_WEBHOOK_SECRET", category: "Payments" },
  ];

  return checks.map(({ key, category, note }) => ({
    key,
    category,
    note,
    status: checkValue(key, process.env[key]),
  }));
}

export function envAuditSummary() {
  const results = auditEnvironment();
  const ok = results.filter((r) => r.status === "ok").length;
  const missing = results.filter((r) => r.status === "missing");
  const placeholder = results.filter((r) => r.status === "placeholder");
  return { results, ok, missing, placeholder, total: results.length };
}
