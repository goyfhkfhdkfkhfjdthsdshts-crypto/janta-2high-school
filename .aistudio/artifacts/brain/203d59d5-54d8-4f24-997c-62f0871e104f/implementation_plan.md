# JAC Class 10 MCQ Practice System & GitHub Deployment Fix Plan

A targeted, production-grade strategy to ensure the JAC Class 10 MCQ Practice System and all school portal features work seamlessly across all environments — including GitHub Pages static deployments, production custom domains, and the live fullstack server for Janta +2 High School – Khalari.

## User Decisions & Clarifications Summary

From the clarification dialog:
- **Deployment Environments**: Full functionality across all GitHub deployment environments (static GitHub Pages, repository subpaths, and live web server).
- **MCQ Practice System Architecture**: Full pre-bundled JAC Class 10 syllabus with client-side local progress saving and offline evaluation.
- **Preservation Principle**: Zero regression. Preserve all student roll numbers (`1001`, `1002`, `25`, etc.), database records, teacher/admin accounts, and existing school features.

---

## 1. Root Cause Analysis

In the Base44 dev server, Next.js executes a live Node.js runtime where dynamic API Route Handlers (`app/api/data/[entity]`) serve MCQs on-demand from `lib/db.ts`. 

However, on the GitHub Pages deployment:
1. **Static Export Isolation**: During static build (`npm run build:gh-pages`), server Route Handlers cannot run dynamically without a Node.js backend.
2. **Missing Client Fallback in `lib/apiConfig.ts`**: `getStaticFallback()` lacked a handler for `/data/mcq`. Any request to `/api/data/mcq` failed with a 404 error.
3. **Network-Dependent State in `McqPracticeView.tsx`**: The component initialized `allQuestions` to an empty array `[]` and only populated it after a raw `fetch('/api/data/mcq')` completed. When that network request failed on static GitHub Pages, `allQuestions` stayed empty, causing the subject dropdown, subject cards, and question list to be completely blank.
4. **Login Gate on Direct Deployed Visits**: When opening the deployed GitHub site fresh, users were prompted for a roll number without a quick guest/direct link to test or practice Class 10 MCQs.
5. **Missing Standalone `/mcq` Route**: Direct navigation to `/mcq` or URLs with `#mcq` / `?section=mcq` was not supported.

---

## 2. Proposed Implementation Strategy

### Phase 1: Pre-Bundle Complete JAC Class 10 Syllabus in `McqPracticeView.tsx`
- Import `CLASS_10_VERIFIED_MCQS` and `CLASS_10_SUBJECTS` directly from `@/lib/jacClass10McqBank`.
- Initialize state with pre-bundled questions so the MCQ section renders instantly with zero loading delay, zero blank states, and zero network dependency.
- Render interactive **Subject Cards** for all JAC Class 10 subjects:
  - **Mathematics (गणित)**: 15 chapters (Real Numbers, Polynomials, Trigonometry, Quadratic Equations, Triangles, etc.)
  - **Science (विज्ञान)**: Physics, Chemistry, Biology (Chemical Reactions, Acids/Bases, Metals, Life Processes, Light, Electricity)
  - **Social Science (सामाजिक विज्ञान)**: History, Geography, Civics, Economics
  - **English**: First Flight, Footprints without Feet, JAC Grammar
  - **Hindi (हिंदी)**: क्षितिज भाग-2, कृतिका भाग-2, व्यावहारिक व्याकरण
  - **Sanskrit (संस्कृत)**: शेमुषी भाग-2, सन्धि, समास, प्रत्यय
  - **Urdu (उर्दू)**: दरख़्शां, नज़्म, ग़ज़ल, कवायद
  - **Information Technology & Healthcare**: Vocational board syllabus
- Each Subject Card will feature:
  - Bilingual subject name (Hindi & English)
  - Color gradient matching the subject theme
  - Total chapter count & verified question count
  - "Start Practice" instant launch button
  - Chapter quick-filter chips

### Phase 2: Offline Progress Tracking & Local Evaluation
- Enable local self-assessment evaluation:
  - Selection of options A, B, C, D with instant correct/incorrect visual feedback
  - Detailed JCERT/NCERT model explanations
  - Confetti celebration upon test completion
  - Score recording (percentage, correct count, total) in `localStorage` under `janta_test_history_[studentId]`
  - Question bookmarking saved to `localStorage` under `janta_bookmarks_[studentId]`
- Gracefully sync bookmarks and test attempts to `/api/student/activity` when connected to a live server, with silent fallback when offline or static.

### Phase 3: Enhance `lib/apiConfig.ts` Static Fallback
- Add `/data/mcq` resolution in `getStaticFallback()`:
  - If requested class is `'10'`, return `CLASS_10_VERIFIED_MCQS`.
  - Filter by `subject` query parameter if provided.
  - Support POST/DELETE fallback into local cache so admin/teacher additions also work offline.

### Phase 4: Navigation, Direct URLs & Guest Access
- **Login Screen Guest Access**:
  - Add a dedicated "🎯 Quick JAC Class 10 MCQ Practice (कक्षा 10 प्रश्नोत्तरी अभ्यास)" card on `LoginScreen.tsx` allowing students, parents, and visitors to jump directly into the Class 10 MCQ bank without needing credentials.
  - Add quick-fill roll number chips (`1001 - Amit`, `25 - Kavita`, `1002 - Pooja`) for one-tap student sign-in.
- **Deep Linking Support**:
  - In `SchoolPortalClient.tsx`, inspect URL search params (`?section=mcq`, `?tab=mcq`) and hash (`#mcq`) on initial render to automatically activate the MCQ section.
- **Standalone Route**:
  - Create `app/mcq/page.tsx` so direct navigation to `https://.../mcq` renders the full JAC Class 10 MCQ practice environment with layout.

### Phase 5: Verification & Build Testing
- Run `compile_applet` to verify that Next.js compilation succeeds with zero errors.
- Test `scripts/build-gh-pages.js` static export readiness.
- Verify desktop and mobile layouts for all subject cards, quiz modals, and navigation tabs.

---

## 3. Verification Checklist

1. **JAC Class 10 Subject Cards**: Verify all core, language, and vocational subjects display with chapter counts and start buttons on desktop & mobile.
2. **Instant Quiz Engine**: Test 10/20/30 question tests, instant option selection, explanations, and confetti score display.
3. **Local Progress Persistence**: Verify quiz history and bookmarks persist across page refreshes in `localStorage`.
4. **Offline & Static Resilience**: Verify the MCQ section works completely with network disabled or when `/api` returns 404.
5. **Guest & Direct Links**: Test `?section=mcq` parameter and login screen "Quick Practice" button.
6. **Existing Portals**: Confirm student login (Roll 1001, 25), Teacher/Admin panel, Attendance, and Textbooks remain 100% functional.
