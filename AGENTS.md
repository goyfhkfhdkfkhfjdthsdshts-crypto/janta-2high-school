# Working in this repo (Janta +2 High School – Khalari)

Next.js 15 App Router app (TypeScript, Tailwind 4). The whole product — portal UI and
API routes — is this one Next app; there is no separate backend service.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d
curl http://localhost:3000/api/health     # {"status":"healthy", ...}
```

- Web entry point is host port **3000**; the container runs `next dev` (webpack, live
  reload) from the bind-mounted source, so edits show up without a rebuild.
- Dependencies are installed at container start with `npm ci` from `package-lock.json`
  (CI uses npm too — ignore the stale `bun.lock`). `node_modules` lives in a named
  volume, so a restart re-syncs but does not re-download everything.
- `WATCHPACK_POLLING`/`CHOKIDAR_USEPOLLING` are on because bind mounts do not reliably
  emit file events.
- On first `next dev` run Next rewrites `tsconfig.json` (adds `.next-dev/types`) and
  `next-env.d.ts`. That is expected noise, not a mistake.

## No database service

Persistence is a JSON file read/written by `lib/db.ts`:

- `data/school_database.json` is the entire datastore (it is bind-mounted from the repo,
  so saved data survives container restarts). Do not delete it to "reset" a container.
- If the file is missing the app reseeds it from constants in `lib/db.ts`; the dev
  server pretty-prints the JSON whenever it writes.
- `GET /api/health` reports row counts, which is a quick way to see the data layer is live.

## Secrets

Delivered by the platform at `/run/base44/app.env` (wired as the last `env_file:`, so a
dashboard value always wins). Both are optional for boot, so no placeholder value is
committed — the AI routes already degrade to a built-in offline answer set:

- `GEMINI_API_KEY` — used by `app/api/ai/ask`, `app/api/mcq/generate`,
  `app/api/ai/transcribe` via `@google/genai`. Without it those routes return canned
  "offline mode" content instead of real Gemini answers.
- `ADMIN_PASSWORD` — unlocks the school management panel (`app/api/admin/verify`). There
  is **no built-in default**: with it unset the panel stays locked (503).
- `SESSION_SECRET` — optional; HMAC key for session/admin-panel cookies. Falls back to
  `ADMIN_PASSWORD`, then to a local-development constant, so it is not required to boot.
- `STAFF_INITIAL_PASSWORD` — optional; only used when a **brand-new** database is seeded,
  giving the seeded staff accounts their initial password hash. No default staff password
  is committed, so without it those accounts exist with no password set.

## Sandbox-only override

`next.config.ts` appends the preview proxy origin (`3000-$BASE44_PUBLIC_HOST_SUFFIX`) to
`allowedDevOrigins` **only when `BASE44_PREVIEW_MODE === "1"`** — Next gates dev assets
and HMR by request origin, so without it the proxied preview loads HTML but not JS.
Unset or any other value leaves the original config untouched. Both `BASE44_PREVIEW_MODE`
and `BASE44_PUBLIC_HOST_SUFFIX` are passed through in compose.

## Authentication & access control

- Session tokens (`lib/session.ts`) are HMAC-SHA256 signed and carry only the account id;
  the **role is always re-read from the database** on each request, so a tampered token or
  a hand-set header cannot escalate privileges. `getActor(req)` is the single source of
  truth for "who is calling"; never trust `x-user-role`/`x-admin-password` style headers.
- Two levels of authority exist: a signed-in **Principal/Admin** account, and the
  **management panel** gate (`hasAdminPanelAccess`) which additionally accepts a staff
  member who verified `ADMIN_PASSWORD` at `/api/admin/verify` (signed 12 h cookie).
- Guarded surface: profile read/update (self or staff), account deletion, official record
  writes under `/api/data/[entity]`, results reads, audit log + full backup, attendance
  corrections and staff overrides.
- There are **no default passwords anywhere**. Staff accounts authenticate only against
  their stored `passwordHash`. A student account with no password may set its first one
  via change-password using its own roll number.
- Sessions minted before this change are unsigned and are rejected: an existing user is
  simply asked to sign in once more.

## Signing in when testing by hand

Seeded accounts live in `lib/db.ts` and `data/school_database.json`. Students sign in with
class + roll number and **no password**, e.g. `Class 10` + roll `1001` (Amit Kumar Singh).
Teacher/principal/admin tabs need the account's own password (the hashes already stored in
the database) — they are not displayed anywhere in the app. The management panel (notices,
timetable, exams, marks, MCQ bank, backups) opens with `ADMIN_PASSWORD`.
