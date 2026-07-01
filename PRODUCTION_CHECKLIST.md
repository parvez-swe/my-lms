# Production Checklist

Sign off each item before deploying to production.

## STEP 1 — Rate limiting

- [x] `lru-cache` installed for in-memory sliding-window rate limiting
- [x] `src/lib/rateLimit.ts` — reusable `withRateLimit(req, key, limit, windowMs)` helper
- [x] `POST /api/users/register` — max 5 requests per IP per hour
- [x] `POST /api/auth/send-otp` — max 3 per IP per 10 minutes
- [x] `POST /api/auth/verify-otp` — max 10 per IP per hour
- [x] `POST /api/chatbot` — max 30 per IP per hour
- [ ] **Production note:** In-memory limits reset on deploy and do not share across instances. For multi-instance production, switch to `@upstash/ratelimit` + `@upstash/redis`.

## STEP 2 — Environment variable validation

- [x] `src/lib/validateEnv.ts` validates required env vars on startup
- [x] `src/lib/db.ts` calls `validateEnv()` before DB exports
- [x] `src/lib/mongodb.ts` calls `validateEnv()` before connecting
- [x] Required always: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
- [x] Required in production (`NODE_ENV=production`): `NEXTAUTH_URL`
- [ ] Set production values in hosting provider (Vercel, Railway, etc.)
- [ ] Confirm `NEXTAUTH_URL` matches your public app URL (including trailing slash policy)
- [ ] Confirm SMTP, Cloudinary, and MongoDB credentials are set for production

## STEP 3 — Remove template pages

- [x] Deleted Trezo demo route directories under `src/app/(admin)/` (kept `authentication/`, `dashboard/`, `layout.tsx`)
- [x] Removed template dashboard sub-routes: `ecommerce`, `finance`, `helpdesk`, `pos-system`, `school`
- [x] Admin sidebar trimmed to real LMS navigation only
- [x] Broken nav links updated (`ProfileMenu`, `Navbar`, breadcrumbs)
- [ ] Run `npm run build` and confirm zero route errors
- [ ] Smoke-test all admin sidebar links after deploy

## STEP 4 — Security headers

- [x] `X-Frame-Options: DENY`
- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [x] `Content-Security-Policy` — allows self, Cloudinary, YouTube iframes
- [ ] Verify YouTube lesson embeds work in production
- [ ] Verify Cloudinary image/video uploads work in production
- [ ] Consider adding `Strict-Transport-Security` at the reverse proxy / CDN layer

## STEP 5 — Health check endpoint

- [x] `GET /api/health` — no auth required
- [x] Returns `{ status: 'ok', db: 'connected', uptime, timestamp }` when MongoDB pings successfully
- [x] Returns `503` with `{ status: 'degraded', db: 'disconnected' }` when DB is unreachable
- [ ] Wire uptime monitor (UptimeRobot, Better Stack, etc.) to `GET /api/health`
- [ ] Set alert on 503 responses

## STEP 6 — Mentor role

- [x] Kept `mentor` in `UserRole` enum (used by chat + post-login routing)
- [x] `src/lib/adminAccess.ts` — mentor route allowlist
- [x] Mentors can access: `/dashboard`, `/dashboard/courses` (view), `/dashboard/messages`, `/dashboard/chats`
- [x] Mentors blocked from: enrolments admin, user management, course create/update, analytics, CMS pages
- [x] Middleware enforces mentor route restrictions
- [x] Admin layout allows mentor role (not only admin/superadmin)
- [x] Sidebar hides admin-only items for mentors
- [ ] Create at least one test mentor account and verify access boundaries
- [ ] Confirm mentor cannot call `GET /api/enrollments/admin` or `PATCH /api/users/admin` (API already admin-only)

## Pre-deploy smoke tests

- [ ] `npm run build` passes
- [ ] `npm run start` — app boots without env validation errors
- [ ] `GET /api/health` returns `ok`
- [ ] Student registration + OTP flow works under rate limits
- [ ] Admin login → courses, enrolments, users pages load
- [ ] Mentor login → courses (view), messages, chat only
- [ ] Marketer login → analytics + CMS pages only
- [ ] Teacher / marketer / admin role permissions verified
- [ ] Payment gateways configured (see env vars below)
- [ ] Chatbot responds and respects rate limit
- [ ] Certificate PDF download works (Chrome / `PUPPETEER_EXECUTABLE_PATH` in prod)

## Post-deploy

- [ ] Remove or rotate any secrets committed to git history
- [ ] Enable MongoDB IP allowlist / VPC peering for production cluster
- [ ] Configure production `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Set up log aggregation for API 5xx errors

## Payment & currency env vars

- [ ] `NEXT_PUBLIC_DEFAULT_CURRENCY=BDT` (or USD/EUR/GBP)
- [ ] `NEXT_PUBLIC_BKASH_NUMBER` — manual bKash wallet number
- [ ] `NEXT_PUBLIC_NAGAD_NUMBER` — manual Nagad wallet number
- [ ] `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_IS_LIVE=false`
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (optional but recommended)
- [ ] SSLCommerz IPN URL: `{APP_URL}/api/payments/webhook/sslcommerz`
- [ ] Stripe webhook URL: `{APP_URL}/api/payments/webhook/stripe`
