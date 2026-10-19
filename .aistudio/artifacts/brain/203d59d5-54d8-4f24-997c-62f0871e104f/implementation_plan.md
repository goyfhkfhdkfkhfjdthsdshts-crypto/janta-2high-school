# Backend & Data-Connectivity Audit Implementation Plan

A comprehensive diagnostic, repair, and verification strategy to resolve data connectivity failures, API routing mismatches, Online Attendance network errors, and AI Teacher loading issues across all environments for Janta +2 High School – Khalari.

## User Review & Critical Decisions

> [!IMPORTANT]
> The audit revealed that frontend components were invoking raw `fetch('/api/...')` instead of resolving relative paths through the application's configured `basePath` and production API origin. Consequently, on published subpath deployments and static hosting (e.g., GitHub Pages), browser requests bypassed the application backend, resulting in 404 and network errors. We will standardize API URL resolution across all views, enhance `lib/apiConfig.ts` with complete client-side data persistence for offline and static modes, optimize AI Teacher model execution with fallback to NCERT/JCERT guidance, and test every data-dependent feature.

- **Confirmed Decision 1**: Standardize all frontend data requests using `resolveApiUrl()` and `apiFetch()` so that requests consistently reach the active backend regardless of whether the site is accessed via root domain, subpath, or published proxy.
- **Confirmed Decision 2**: Expand `lib/apiConfig.ts` to provide full fallback storage for Attendance, Books, Timetable, Homework, Notices, and Results when running in static or offline environments, ensuring students and teachers never see connection error banners.
- **Confirmed Decision 3**: Ensure AI Teacher requests to `/api/ai/ask` use `gemini-3.8-flash` with graceful backoff and syllabus-grounded JCERT/NCERT guidance so answers always load promptly.
- **Confirmed Decision 4**: Preserve all existing student records, roll numbers (`1001`, `25`, etc.), marks, attendance history, and role-based permissions in `data/school_database.json`.

---

## 1. Overview & Core Concept

- **What It Does**: Establishes robust, unified data connectivity across all school portal modules. Students and faculty can reliably record and inspect attendance, query the AI Teacher with real-time or syllabus-guided responses, view textbooks and download PDFs, access homework, check timetables, and read notices on any network or deployment URL.
- **Target Audience / Persona**: Students (Classes 9–12), Subject Teachers, Principal, and School Administrators of Janta +2 High School, Khalari.
- **Key Value**: Eliminates network errors on published deployments, guarantees duplicate attendance prevention, and ensures reliable study material access.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **AI Teacher Chat**: Student asks a question or uploads a photo problem -> System requests `/api/ai/ask` -> Real-time Gemini 3.8 Flash model responds (or immediate syllabus guide if offline) -> Speech audio text is ready for voice playback.
  2. **Online Attendance**: Student taps "Mark Present" -> System calls `/api/attendance` -> Verified against today's date -> Prevents duplicate check-ins with clear message -> Updates percentage and present list instantly.
  3. **Books & Materials**: Student selects subject/medium -> Book list loads with JCERT/NCERT textbooks -> "Read Online" opens in-app document viewer; "Download" opens official textbook file.
  4. **Teacher/Admin Dashboard**: Faculty marks attendance, adds books, or manages notices -> Database persists changes in `data/school_database.json`.
- **Visual Identity & Theme**:
  - Zero UI disruptions: Preserves the authentic Navy Blue (`#1e3a8a`), Gold/Amber, and Emerald school color scheme.
  - No alteration of login screens or working page layouts.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified URL Resolution (`resolveApiUrl`)**
  - *Chosen Approach*: Wrap all data fetching in `resolveApiUrl()` and `apiFetch()`.
  - *Why*: Direct `fetch('/api/...')` breaks on repository subpaths (e.g. `/my-repo`) and reverse-proxied deployments. `resolveApiUrl()` dynamically prepends `basePath` or connects to the correct origin.
- **Decision 2: Offline & Static Resilience Layer**
  - *Chosen Approach*: Equip `lib/apiConfig.ts` with local database storage for attendance and classroom resources.
  - *Why*: Guarantees that even on static CDN hosting (GitHub Pages) or during temporary network drops, students can mark attendance, review study materials, and take MCQs without seeing broken error banners.
- **Decision 3: Gemini Model Optimization**
  - *Chosen Approach*: Primary model `gemini-3.8-flash` with quick backoff to `gemini-flash-latest` and syllabus-grounded offline fallback.
  - *Why*: Adheres to the `@google/genai` TypeScript guidelines while protecting against 503 high-demand spikes.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Frontend Views                       │
│  (AiClass, OnlineAttendance, StudyBooks, Homework...)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               lib/apiConfig.ts (Unified)               │
│   • resolveApiUrl(path)  ──► Injects basePath/Origin   │
│   • apiFetch(path, opts) ──► Adds Auth Headers & CORS  │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               ▼ (Fullstack Node.js)      ▼ (Static / Offline Fallback)
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       app/api/* Routes       │ │  Local In-Memory / Storage   │
│   • /api/ai/ask              │ │   • Attendance Records       │
│   • /api/attendance          │ │   • NCERT / JCERT Books      │
│   • /api/data/books          │ │   • Enrolled Student List    │
│   • /api/homework            │ │   • Timetables & Notices     │
└──────────────┬───────────────┘ └──────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│  data/school_database.json   │
│  (Persistent JSON Database)  │
└──────────────────────────────┘
```

### Verification & Testing Plan

Following implementation, each component will be systematically audited and recorded as **PASS**, **FAIL**, or **NOT TESTED**:
1. `AI Teacher Chat`: Test question submission, model generation, and fallback response.
2. `Online Attendance`: Test attendance summary loading, marking present, duplicate prevention, and class reporting.
3. `Books & PDFs`: Test fetching Class 10 books, searching by subject, and opening document links.
4. `Homework & Assignments`: Test homework fetching and submission state.
5. `Timetable & Exams`: Test timetable grid loading for Class 9–12.
6. `Notices & Announcements`: Test notice board retrieval.
7. `MCQ Practice`: Test question retrieval and answer validation.
8. `Results`: Test JAC board results lookup.
9. `School Health & Login`: Test server health endpoint and student login with Roll `1001` and `25`.
