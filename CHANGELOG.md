# Changelog

All notable changes to Labtool are recorded here, newest first. Each entry says what changed and
why. Bugs that tests found but that are not fixed yet are listed under "Known bugs".

## 2026-10-10

### Security
- **axios 0.18/0.19 → 1.20.0** in the backend (Kurki calls) and the frontend (all API calls).
  Fixes the server-side and cross-site request forgery advisories and the follow-redirects
  credential leak. No code changes were needed. `npm audit`: backend 28 → 26, frontend 24 → 22.
- **nodemailer 4 → 10.0.13** (fixes header and command injection advisories) and
  **jsonwebtoken 8 → 9.0.3** (fixes key-confusion advisories). `jwt.verify` now only accepts
  HS256, the algorithm tokens are signed with, so existing tokens stay valid. Sending through
  SMTP was checked against a local fake SMTP server, since the tests stub the transport. Backend
  `npm audit`: 26 → 24; the remaining direct findings are sequelize and dev tooling.
- nodemailer 10.1.0 was skipped because `backend/.npmrc` only allows packages published at least
  7 days ago (`min-release-age=7`).

### Removed
- **Unused backend dependencies:** `cryptiles`, `fs`, `path` and `request`. `fs` and `path` were
  npm placeholders for Node built-ins; nothing used `cryptiles`; `request` was only used by the
  unrouted `getNew`/`getNewer` controller methods, which are removed too. Backend `npm audit`:
  34 → 28 vulnerabilities (7 → 6 critical).

### Added
- **Copy checklist: only courses with something to copy.** On the checklist page, the
  "...from another course" dropdown now lists only courses that have a non-empty checklist for the
  selected week, final review or code review. It also leaves out courses you are not a teacher or
  student on, because copying from them already failed with 403.
  - Backend: new `GET /api/checklist/copyable`, which returns `{ courseInstanceId, week, forCodeReview }`
    for the non-empty checklists on the current user's courses.
  - Frontend: new `getCopyableChecklists` service and `copyableChecklists` reducer;
    `CreateChecklist.jsx` filters the dropdown with them.
  - Tests: backend API tests for the endpoint, frontend tests for the reducer, the service and the
    dropdown filtering.
- **Seeded course for the current term.** New dev seeder
  `backend/server/seeders/20261010000000-demo-current-course.js` adds
  `TKT20010.2026.S.K.SIM1` (Tietorakenteet ja algoritmit, autumn 2026) with `paaopettaja` as
  teacher and `tiraopiskelija1` and `tiraopiskelija2` as students. It is dated after the e2e
  seeder on purpose: seeders are undone newest first.
- **Fake Kurki generates courses for any term.** `Kurki_simulation` used to have data only up to
  2020, so course import failed for the current term. For a term or course without a response
  file it now returns two generated courses (course codes ending in `SIM1`) with `paaopettaja` as
  teacher. Existing response files work as before.
- **Course import e2e test enabled.** It imports a course, checks that the Kurki teacher becomes
  its teacher and that the course disappears from the import list. The e2e seeder removes imported
  `SIM` courses before every run. The e2e suite now runs all 43 tests.

### Documentation
- New `e2e/README.md`: how to run and develop the e2e tests, what each spec covers, how test data
  is seeded, and known issues.
- `README.md`: new "Tests" section covering the frontend unit tests, backend API tests and e2e
  tests, plus local URLs.
- `Kurki_simulation/README.md`: describes the generated courses.

## 2026-10-09

### Fixed
- **Course registration sent two responses** (`courseinstances.js`), leaving an unhandled promise
  rejection. Sequelize 5 only logs it, but after the Sequelize 6 upgrade it would crash the backend
  on every registration.
- **Handlers that sent a 400 and kept running** and then crashed the backend: grading a code review
  that does not exist (`codeReviews.js`), removing a tag a student does not have (`tags.js`), and
  invalid checklist rows (`checklists.js`). Checklist validation now lives in a `validateChecklist`
  function that returns the first error. Invalid checklists used to be saved anyway and are now
  rejected without saving.
- **Course import crashed the backend when Kurki failed** (`applicationHelper.js`,
  `courseImport.js`). Both listing and importing now answer 400, and only successful Kurki results
  are cached, so a failure is retried on the next request instead of being stuck for 10 minutes.
- **Security: students could read hidden, instructor-only comments** through `POST /api/comments`.
  Hidden comments are now returned only to course staff.

### Added
- **Backend API test suite** (`backend/test/`, mocha and supertest against a real Postgres in
  Docker via `docker-compose.test.yml`; run with `npm run test:docker`). It replaces the stale
  mocha specs. Kurki is mocked with nock and email is stubbed.
- **Frontend unit tests** for the API middleware, every service function, all reducers, data flow
  through the real store, and two pages. HTTP is mocked with msw (new devDependency
  `msw@2.15.0`), so the tests do not depend on axios internals.
- **E2E tests** for course settings, checklists, code reviews, tags, comments, review drafts,
  course staff, email, dropping out, my page and logout, on top of the existing smoke,
  registration and grading tests. The grading test was failing because it typed into the form
  before the page had finished loading; it now waits for the page.
- **CI** (`.github/workflows/tests.yml`): tests now also run on every pull request, with new jobs
  for the backend API tests and the e2e suite. The e2e job uploads the Playwright report when it
  fails.
- `CLAUDE.md`: guidance for Claude Code (commands and architecture); it is no longer gitignored.

### Security
- `npm audit fix` in `backend/`, `labtool2.0/` and `Kurki_simulation/` (lockfiles only, no
  breaking upgrades): backend 40 → 34 vulnerabilities, frontend 27 → 24, Kurki_simulation 4 → 0.
  The remaining ones need breaking upgrades (sequelize, axios, nodemailer, jsonwebtoken, request,
  and old dev tooling).

## Known bugs

Found by the new tests and not fixed yet. Each one has a skipped test (`it.skip` / `test.fixme`)
with an explanation, except where noted.

Backend:
- The responsible teacher can be removed from a course: the check reads `.admin`, a column that a
  migration renamed to `instructor` (`users.js`).
- Changing a student's repo through bulk update always fails with 400 (`courseinstances.js`).
- Code reviews can be saved without a review round: a misplaced parenthesis means a missing
  `reviewNumber` is never rejected (`codeReviews.js`).
- Deleting a code review hangs when no rows (or more than one) match (`codeReviews.js`).
- A student with no assistant gets a 400 instead of the "no assistant" message (`assistants.js`).
- Race when a code review is created: the `beforeCreate` hook starts a delete without waiting for
  it (`models/codereview.js`).
- `POST /api/courseinstances/coursepage` with a numeric `course` crashes the backend on an unhandled
  database error (no test yet).

Frontend:
- Random code-review assignment sometimes assigns nobody (`codeReviewReducer.js`).
- New checklist rows all get the id `-Infinity` when the checklist starts empty
  (`checklistReducer.js`).
- "Notified" labels do not update after sending an email, and several other reducer actions change
  the existing state instead of returning a new one (coursePage, coursePageLogic, codeReview and
  checklist reducers).
- Opening BrowseReviews or the code review settings page directly at the start of a session can
  show a blank page. Comment notification emails link straight to BrowseReviews.
- A "Logout" button is still shown in the nav after logging out (no test).
- `npm run lint` only checks `.js` files, so the `.jsx` pages are never linted.
