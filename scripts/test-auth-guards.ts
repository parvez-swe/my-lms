/**
 * Verifies auth guards return 401/403 before any DB work.
 * Run: npx tsx scripts/test-auth-guards.ts
 */

type AuthSession = {
  user: { id: string; email: string; name: string; role: string };
} | null;

let mockSession: AuthSession = null;

// Mock auth before route modules load
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Patch via dynamic import after setting up mock - use manual handler invocation
import { POST as createCourse } from "../src/app/api/courses/route";
import {
  PUT as updateCourse,
  DELETE as deleteCourse,
} from "../src/app/api/courses/[id]/route";
import { PUT as updateHero } from "../src/app/api/hero-section/route";
import { PUT as updateFaq } from "../src/app/api/faq/route";
import { PUT as updateAbout } from "../src/app/api/about-me/route";
import { PUT as updateWhy } from "../src/app/api/why-choose-us/route";
import { POST as uploadVideo } from "../src/app/api/upload/video/route";
import { GET as getConversations } from "../src/app/api/chat/conversations/route";
import { GET as getChatUsers } from "../src/app/api/chat/users/route";
import { GET as getAdmin } from "../src/app/api/chat/get-admin/route";
import { POST as createConversation } from "../src/app/api/chat/create-conversation/route";
import { GET as getMessages } from "../src/app/api/chat/messages/[conversationId]/route";
import * as authModule from "../src/lib/auth";
import * as chatRequestModule from "../src/lib/chatRequest";

const originalAuth = authModule.auth;
const originalGetParticipant = chatRequestModule.getRequestParticipant;

function req(method: string, url: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

let passed = 0;
let failed = 0;

async function check(name: string, res: Response, expected: number) {
  const ok = res.status === expected;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${res.status} (expected ${expected})`);
  if (!ok) {
    console.log("  body:", (await res.text()).slice(0, 160));
    failed++;
  } else {
    passed++;
  }
}

// Unauthenticated
(authModule as { auth: typeof authModule.auth }).auth = async () => null;
(chatRequestModule as { getRequestParticipant: typeof chatRequestModule.getRequestParticipant }).getRequestParticipant =
  async () => null;

async function main() {
console.log("=== 401 without session ===\n");

await check(
  "POST /api/courses",
  await createCourse(req("POST", "http://localhost/api/courses", { title: "x" })),
  401
);
await check(
  "PUT /api/courses/[id]",
  await updateCourse(req("PUT", "http://localhost/api/courses/x", { title: "x" }), {
    params: Promise.resolve({ id: "x" }),
  }),
  401
);
await check(
  "DELETE /api/courses/[id]",
  await deleteCourse(req("DELETE", "http://localhost/api/courses/x"), {
    params: Promise.resolve({ id: "x" }),
  }),
  401
);
await check(
  "PUT /api/hero-section",
  await updateHero(req("PUT", "http://localhost/api/hero-section", {})),
  401
);
await check(
  "PUT /api/faq",
  await updateFaq(req("PUT", "http://localhost/api/faq", {})),
  401
);
await check(
  "PUT /api/about-me",
  await updateAbout(req("PUT", "http://localhost/api/about-me", {})),
  401
);
await check(
  "PUT /api/why-choose-us",
  await updateWhy(req("PUT", "http://localhost/api/why-choose-us", {})),
  401
);
await check(
  "POST /api/upload/video",
  await uploadVideo(req("POST", "http://localhost/api/upload/video")),
  401
);
await check("GET /api/chat/conversations", await getConversations(), 401);
await check("GET /api/chat/users", await getChatUsers(), 401);
await check("GET /api/chat/get-admin", await getAdmin(), 401);
await check(
  "POST /api/chat/create-conversation",
  await createConversation(
    req("POST", "http://localhost/api/chat/create-conversation", { recipientId: "x" })
  ),
  401
);
await check(
  "GET /api/chat/messages",
  await getMessages(req("GET", "http://localhost/api/chat/messages/fake"), {
    params: Promise.resolve({ conversationId: "fake" }),
  }),
  401
);

console.log("\n=== 403 for student role ===\n");

const studentSession = {
  user: { id: "1", email: "s@test.com", name: "Student", role: "student" },
};
(authModule as { auth: typeof authModule.auth }).auth = async () => studentSession;
(chatRequestModule as { getRequestParticipant: typeof chatRequestModule.getRequestParticipant }).getRequestParticipant =
  async () => ({
    id: studentSession.user.id,
    name: studentSession.user.name,
    role: "student",
    avatar: "/images/users/user31.jpg",
  });

await check(
  "POST /api/courses (student)",
  await createCourse(req("POST", "http://localhost/api/courses", { title: "x" })),
  403
);
await check(
  "PUT /api/hero-section (student)",
  await updateHero(req("PUT", "http://localhost/api/hero-section", {})),
  403
);
await check(
  "POST /api/upload/video (student)",
  await uploadVideo(req("POST", "http://localhost/api/upload/video")),
  403
);

// Restore
(authModule as { auth: typeof authModule.auth }).auth = originalAuth;
(chatRequestModule as { getRequestParticipant: typeof chatRequestModule.getRequestParticipant }).getRequestParticipant =
  originalGetParticipant;

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
}

main();
