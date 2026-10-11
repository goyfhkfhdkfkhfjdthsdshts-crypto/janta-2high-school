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
- `ADMIN_PASSWORD` — teacher/admin management panel (`app/api/admin/verify`); falls back
  to the in-app default when unset.

## Sandbox-only override

`next.config.ts` appends the preview proxy origin (`3000-$BASE44_PUBLIC_HOST_SUFFIX`) to
`allowedDevOrigins` **only when `BASE44_PREVIEW_MODE === "1"`** — Next gates dev assets
and HMR by request origin, so without it the proxied preview loads HTML but not JS.
Unset or any other value leaves the original config untouched. Both `BASE44_PREVIEW_MODE`
and `BASE44_PUBLIC_HOST_SUFFIX` are passed through in compose.

## Signing in when testing by hand

Seeded accounts live in `lib/db.ts`. Students sign in with class + roll number and **no
password**, e.g. `Class 10` + roll `1001` (Amit Kumar Singh). Teacher/principal/admin tabs
use a login ID + password (`ADMIN_PASSWORD` for admin).
