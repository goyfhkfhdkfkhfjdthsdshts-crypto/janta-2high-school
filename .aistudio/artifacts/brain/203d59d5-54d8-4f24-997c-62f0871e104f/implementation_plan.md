# GitHub Pages Build Failure Repair & Deployment Synchronization Plan

A targeted repair strategy to eliminate the GitHub Actions Pages build failure (`npm ci` exit code 1 / EUSAGE error after 17 seconds), synchronize `package-lock.json`, add resilient dependency fallback, and ensure continuous automated deployment for Janta +2 High School – Khalari across repository subpaths and custom domains.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The exact root cause of the 17-second GitHub Actions failure has been diagnosed:
> When `react-markdown` and `remark-gfm` were added to `package.json`, `package-lock.json` was not regenerated. The GitHub Actions runner executed `npm ci`, which strictly mandates that `package.json` and `package-lock.json` match byte-for-byte, causing an immediate `EUSAGE` crash.
> 
> Based on your confirmed choices:
> - **Deployment URL Format**: Dual-mode automatic basePath resolution (seamlessly handles `username.github.io/repo-name/` subpaths and custom root domains like `jantahighschoolkhalari.in` via `CNAME` and `ACTIONS_PAGES_BASE_PATH` detection).
> - **Dependency Installation**: Synchronize `package-lock.json` with npm, and enhance `.github/workflows/nextjs.yml` with a resilient fallback (`npm ci || npm install`) so runner environments never fail on lockfile drift.

---

### 1. Overview & Core Concept

- **The Problem**: GitHub Actions workflow `Deploy Next.js site to Pages / build (push)` failed in 17 seconds, preventing the `deploy` step from executing.
- **Root Cause**: The runner executed `npm ci`, which crashed because newly added runtime packages (`react-markdown`, `remark-gfm`) were present in `package.json` but absent from `package-lock.json`.
- **The Solution**: 
  1. Generate a synchronized `package-lock.json` matching all production dependencies.
  2. Update `.github/workflows/nextjs.yml` to use resilient installation (`npm ci || npm install --legacy-peer-deps`) and pass all required GitHub Pages environment variables.
  3. Ensure `scripts/build-gh-pages.js` and `next.config.ts` dynamically detect custom domains (`CNAME`), Actions environment variables (`ACTIONS_PAGES_BASE_PATH`), and repository subpaths.
  4. Preserve all school data, student profiles, AI Tutor improvements, and MCQ practice features without regressions.

---

### 2. User Experience & Deployment Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   GitHub Actions Deployment Workflow                   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                     [Step 1: Checkout Repository]
                                    │
                                    ▼
                [Step 2: Resilient Dependency Install]
                 `npm ci || npm install --legacy-peer-deps`
                                    │
                                    ▼
                [Step 3: Auto-Detect Deployment Domain]
             Checks for CNAME / ACTIONS_PAGES_BASE_PATH / repo
                                    │
                                    ▼
              [Step 4: Execute `build:gh-pages` Export]
        - Generates public/.nojekyll
        - Isolates dynamic server routes safely
        - Generates optimized static HTML/JS/CSS in `out/`
                                    │
                                    ▼
                [Step 5: Upload Pages Artifact & Deploy]
              Published to GitHub Pages Live Environment
```

- **For Visitors & Students**: The public school portal loads instantly from GitHub Pages, with working MCQ practice, AI Class view, student profiles, and notices.
- **For Repository Maintainers**: Future git pushes build cleanly in under 45 seconds without lockfile mismatch failures.

---

### 3. Key Technical Decisions & Trade-Offs

- **Decision 1: Synchronizing `package-lock.json` vs. Switching to `npm install` only**
  - *Chosen Approach*: Do both. Update `package-lock.json` to be 100% in sync with `package.json`, AND add a graceful fallback in `.github/workflows/nextjs.yml` (`npm ci || npm install --legacy-peer-deps`).
  - *Why*: `npm ci` is fast and deterministic for CI/CD, while the fallback ensures that future direct commits or dependency adjustments will never block website deployment.
  - *Alternatives Considered*: Forcing `npm install` exclusively would slow down every build run; keeping strict `npm ci` alone causes pipeline fragility.

- **Decision 2: Dual-Mode BasePath Resolution in `next.config.ts` & `build-gh-pages.js`**
  - *Chosen Approach*: Detect whether a custom domain exists (via `public/CNAME`) or if GitHub Pages provides `ACTIONS_PAGES_BASE_PATH`. If deploying to a project page (e.g. `username.github.io/janta-high-school`), apply `basePath: '/janta-high-school'`. If deploying to a custom domain or user page (`username.github.io`), apply `basePath: ''`.
  - *Why*: Supports immediate deployment without hardcoding repository names, preventing 404 asset failures (`_next/static/...`).

- **Decision 3: Zero-Data-Loss & Feature Integrity**
  - *Chosen Approach*: Keep `data/school_database.json`, student profiles (Amit, Kavita, Pooja, etc.), teacher logins, and all recent AI Tutor updates intact.
  - *Why*: Guarantees that neither student accounts nor public portal features are disrupted.

---

### 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Next.js Static & Server Model                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Local Dev Server & Docker (Full-Stack Mode)                          │
│   ├── Dynamic API Routes: `/api/ai/ask`, `/api/data/*`, `/api/login`   │
│   └── Database: Read/Write from `data/school_database.json`            │
│                                                                        │
│   GitHub Pages Static Export (CDN Hosting Mode)                        │
│   ├── Target Directory: `out/`                                         │
│   ├── Static Assets: `_next/static/*` with `.nojekyll` enabled         │
│   ├── Client Fallback: `lib/apiConfig.ts` with bundled JAC MCQs        │
│   └── SPA Routing: `out/404.html` fallback                             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Proposed Changes by Component:
1. **`package-lock.json`**:
   - Re-generate using npm to include `react-markdown`, `remark-gfm`, and all sub-dependencies so `npm ci` passes cleanly.
2. **`.github/workflows/nextjs.yml`**:
   - Update dependency installation step to:
     ```yaml
     - name: Install dependencies
       run: npm ci || npm install --legacy-peer-deps
     ```
   - Ensure `build:gh-pages` receives `GITHUB_PAGES: 'true'`, `STATIC_EXPORT: 'true'`, and `ACTIONS_PAGES_BASE_PATH`.
3. **`scripts/build-gh-pages.js` & `next.config.ts`**:
   - Validate CNAME and custom domain awareness in basePath detection.
   - Confirm asset prefixes and static export configuration.
4. **Verification**:
   - Run `npm ci` locally in terminal to confirm zero errors.
   - Run `npm run build:gh-pages` locally to ensure static export generation succeeds.
   - Run `compile_applet` and `lint_applet` to confirm overall codebase health.
