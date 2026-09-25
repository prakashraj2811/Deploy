# Sacred Bond — Matrimony Platform (Phase 1 Foundation)

A full-stack matrimonial platform built as a phased, production-grade monorepo:
**React + TypeScript + Tailwind** frontend, **Node.js + Express + TypeScript + Prisma**
backend, **PostgreSQL** database.

This is **Phase 1**: a real, working foundation — not a mockup — covering auth/RBAC, the
database schema for the full platform, user registration & profiles, search, matching,
interests/shortlists, real-time chat, subscriptions/payments (sandboxed), moderation,
support tickets, and admin/super-admin panels. Every external integration (payments, email,
SMS, file storage) is built behind a swappable interface with a mock/local implementation,
so real provider keys can be dropped in later via `.env` with zero code changes.

## What's implemented

**Backend** (`server/`)
- JWT auth with refresh tokens (httpOnly cookie), OTP-based mobile/email verification, account lockout
- Full RBAC: roles, permissions, role-permission mapping, middleware-enforced (`requirePermissions`, `requireRoles`)
- Complete Prisma schema: users, roles/permissions, profiles, photos, partner preferences, privacy
  settings, verification requests, interests, shortlists, subscriptions/payments/invoices,
  notifications, conversations/messages, reports, support tickets, audit logs, system settings
- REST API (`/api/v1/...`): auth, users, profiles, search, matches, interests, shortlists,
  subscriptions (checkout + server-verified payment flow), reports, support, admin, lookups, conversations
- Real-time chat via Socket.IO (JWT-authenticated handshake, rooms, typing indicators, read receipts)
- Matching engine with a private (non-exposed) compatibility scoring algorithm
- Provider-agnostic integration layers: `integrations/{email,sms,storage,payment}` — mock
  implementations active by default, swap in SMTP/Razorpay/S3/Cloudinary by implementing the
  same interface and changing one line in each module's `index.ts`
- Security: helmet, CORS, rate limiting, bcrypt password hashing, input validation (Zod),
  centralized error handling, audit logging on sensitive admin actions

**Frontend** (`client/`)
- Public site: home/landing, search (guest-browsable), membership plans, static legal/info pages
- Auth: login, multi-step registration (account → OTP verification), forgot/reset password
- Onboarding wizard: basic info → education → career → family → lifestyle → partner
  preference → photos → submit for verification (mirrors the spec's 9-step registration)
- User panel: dashboard, matches (by category), interests (sent/received), shortlist,
  real-time messages, membership checkout, notifications, settings (account/privacy/security)
- Admin panel: dashboard metrics, user management, verification queue, reports, support
  tickets, subscription plan management
- Role-based protected routing, axios client with automatic token refresh on 401

## What's not built yet (intentionally, per phased plan)

CMS/blog editing UI, SEO SSR/SSG, PWA manifest/service worker, i18n, background job
scheduler (BullMQ/Redis), automated test suites beyond the initial unit tests, and full
admin CRUD for lookup/master data (religions/communities/castes currently seeded, not
UI-editable). The database schema and API layer are already structured to support all of
these without rework — ask to continue with any of these modules next.

## Getting started

### 1. Database

You need a PostgreSQL instance. Easiest local option (requires Docker):

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` (user/pass `postgres`/`postgres`, db `matrimony`),
matching the default in `server/.env.example`. No Docker? Install Postgres locally, or use a
free managed instance (Neon, Supabase, Railway) and paste its connection string into `DATABASE_URL`.

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

The API listens on `http://localhost:4000`. `npm run seed` creates roles/permissions, sample
religions/communities/castes, subscription plans, and demo accounts (password `Password@123`
for all):

| Role | Email |
|---|---|
| Super Admin | `superadmin@matrimony.test` |
| Admin | `admin@matrimony.test` |
| Support | `support@matrimony.test` |
| Demo members | `arjun.demo@matrimony.test`, `priya.demo@matrimony.test`, `rahul.demo@matrimony.test`, `sneha.demo@matrimony.test` |

### 3. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Opens on `http://localhost:5173`.

### 4. Verify

- `npm test` in `server/` runs the unit test suite (password hashing, JWT, OTP hashing)
- `npm run build` in either `server/` or `client/` runs a full production type-check + build

## Configuring real providers

Every third-party integration starts in mock mode (logs to console / accepts any sandbox
payment / stores files locally under `server/uploads`). To go live:

- **Payments**: implement `PaymentProvider` in `server/src/integrations/payment/` for
  Razorpay, set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`, swap
  the export in `integrations/payment/index.ts`
- **Email**: set `EMAIL_PROVIDER=smtp` plus `SMTP_*` vars — `SmtpEmailProvider` is already implemented
- **SMS**: implement `SmsProvider` for your gateway (Twilio, MSG91, etc.)
- **Storage**: implement `StorageProvider` for S3/Cloudinary/Firebase; `LocalStorageProvider` is the current default

## Deployment targets (per original spec)

- Frontend → Vercel / Netlify / Firebase Hosting (static build via `npm run build`)
- Backend → Render / Railway / AWS / any VPS (`server/Dockerfile` included)
- Database → any managed PostgreSQL (Neon, Supabase, RDS, Railway)
