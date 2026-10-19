# GitHub Pages Deployment & Full Static Build Implementation Plan

Comprehensive resolution for the GitHub Pages deployment failure, GitHub Actions workflow conflict, Next.js static HTML export, asset path resolution, and seamless offline client fallback for Janta +2 High School – Khalari.

## User Review & Critical Decisions

> [!IMPORTANT]
> The newly added GitHub workflow (`.github/workflows/nextjs.yml`) fails on GitHub Actions because Next.js `output: 'export'` cannot process dynamic Route Handlers (`/api/*`) without static pre-generation, resulting in `Error: export const dynamic = "force-static"`. We will configure the workflow to run our custom static generator (`npm run build:gh-pages`), ensure `.nojekyll` and `404.html` SPA routing fallbacks are created, automatically handle repository subpaths, and enable complete client-side data persistence so that student login, MCQ practice, attendance, timetable, and study books operate smoothly on static GitHub Pages.

- **Confirmed Decision 1**: Harmonize `.github/workflows/nextjs.yml` and `.github/workflows/deploy.yml` so that GitHub Actions successfully compiles via `npm run build:gh-pages` and deploys the generated `./out` artifact without errors or workflow concurrency conflicts.
- **Confirmed Decision 2**: Enable automatic basePath and assetPrefix resolution for repository URLs (`https://<username>.github.io/<repo-name>/`) as well as custom root domains (`https://<username>.github.io/`).
- **Confirmed Decision 3**: Provide automatic in-memory and `localStorage` fallback in `lib/apiConfig.ts` and UI views so that when hosted on a purely static server without Node.js backend routes, student login, notices, study books, attendance, and MCQ testing continue to function without network error banners.

---

## 1. Overview & Core Concept

- **What It Does**: Enables zero-error static compilation and automated GitHub Pages deployment via GitHub Actions. When deployed to GitHub Pages, the school portal loads instantly as a high-performance static Progressive Web App with all school records, class selection, student login, syllabus books, and offline-capable quizzes intact.
- **Target Audience / Persona**: Students (Classes 9–12), teachers, school administrators, and community members accessing the official school portal via GitHub Pages on mobile smartphones and desktop browsers.
- **Key Value**: Fixes all CI/CD build breakages, prevents duplicate deployment race conditions, and guarantees that the entire portal works out of the box whether served on a Node.js server (AI Studio / Cloud Run) or a static file host (GitHub Pages).

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Deployment Flow (GitHub Actions)**: On push to `main`, GitHub Actions runs the workflow, isolates dynamic API routes, generates static HTML/JS bundles to `./out`, injects `.nojekyll` and `404.html`, and publishes live to GitHub Pages.
  2. **Student & Teacher Portal Flow**: Visitors open the GitHub Pages URL, assets load with correct base paths, student login recognizes enrolled roll numbers (`1001`, `25`, etc.), and class-specific resources display immediately.
- **Visual Identity & Theme**:
  - Unchanged: Preserves the authentic Navy Blue (`#1e3a8a`), Gold/Amber, and Emerald school color palette.
  - Zero layout shifts or clipping on mobile viewports.
- **Interactive Feedback & Reliability**:
  - Seamless fallback indicators when dynamic server features (like live AI generation) operate in offline demonstration mode.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Workflow Strategy for GitHub Actions**
  - *Chosen Approach*: Update `nextjs.yml` to run `npm run build:gh-pages` and remove redundant duplicate workflows, ensuring single-source-of-truth deployment.
  - *Why*: The default Next.js template in `nextjs.yml` crashes on dynamic routes. Running `build:gh-pages` temporarily isolates `/api` routes during static export and restores them immediately, yielding a pristine `./out` folder.
- **Decision 2: Base Path & Asset Resolution**
  - *Chosen Approach*: Use `actions/configure-pages@v5` alongside `process.env.GITHUB_REPOSITORY` detection in `next.config.ts` and `lib/apiConfig.ts`.
  - *Why*: Ensures CSS, JavaScript chunks, images, and fonts load correctly regardless of whether the site is hosted at `/` or `/<repository-name>/`.
- **Decision 3: Static Data Layer & Authentication Resilience**
  - *Chosen Approach*: Enhance `lib/apiConfig.ts` with built-in default seed datasets and client-side credential verification when running in static mode.
  - *Why*: GitHub Pages cannot execute server-side Node.js route handlers. Supplying local database fallback allows valid student roll numbers (e.g. `1001`, `1002`, `25`) to authenticate and view real records without a running backend server.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────┐
│                   GitHub Actions CI/CD                   │
│                                                          │
│  push to main ──► nextjs.yml (Setup Node 20 & Pages)     │
│                         │                                │
│                         ▼                                │
│             npm run build:gh-pages                       │
│      ┌──────────────────┴──────────────────┐             │
│      ▼                                     ▼             │
│  Isolate /api                      Next.js Static Export │
│  Auto-detect basePath              Generate ./out        │
│  Restore /api                      Inject .nojekyll/404  │
│                         │                                │
│                         ▼                                │
│           Upload & Deploy to GitHub Pages                │
└──────────────────────────────────────────────────────────┘
```

### Key Execution Steps

1. **Update `.github/workflows/nextjs.yml`**:
   - Replace generic `next build` command with `npm run build:gh-pages`.
   - Pass necessary environment flags (`GITHUB_PAGES: 'true'`, `STATIC_EXPORT: 'true'`).
   - Clean up conflicting/duplicate deployment files.
2. **Refine `next.config.ts`**:
   - Ensure `isExport` automatically enables `output: 'export'`, `trailingSlash: true`, and `images: { unoptimized: true }` when running inside GitHub Actions (`process.env.GITHUB_ACTIONS === 'true'`).
3. **Enhance Client API Resilience (`lib/apiConfig.ts`)**:
   - Add graceful static client fallback for endpoints (`/api/auth/login`, `/api/data/*`, `/api/health`) so static GitHub Pages users can log in, view timetables, study materials, and notices without network errors.
4. **Local Verification**:
   - Verify `npm run build:gh-pages` builds successfully into `./out`.
   - Verify `compile_applet` passes.
