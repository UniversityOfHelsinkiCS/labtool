# Changelog

All notable changes to Labtool are recorded here, newest first. Each entry says what changed and
why. Bugs that tests found but that are not fixed yet are listed under "Known bugs".

## 2026-10-11

### Fixed
- **Blank page when opening BrowseReviews or the code review settings page directly** at the start
  of a session, for example from the link in a comment notification email. The pages could decide
  loading had finished before the course data arrived, and then crashed on `courseData.data`.
  Both now show the loader until the data is there. Regression tests reproduce the crash, and the
  e2e specs open these pages directly instead of logging in on my page first.
- **The responsible teacher could be removed from a course** (`users.js`). The guard checked
  `.admin`, a column a 2019 migration renamed to `instructor` and inverted, so it never triggered.
  It now refuses to remove anyone who is not an assistant (`instructor: true`). Removing
  assistants works as before.
- **Random code-review assignment sometimes assigned nobody** (`codeReviewReducer.js`). From round
  2 on, the search reshuffled the list it was working through, so it could miss every valid
  assignment and silently return none (about 1 in 4 runs with 3 students). It is now a randomized
  backtracking search that always finds an assignment when one exists, with the same rules: nobody
  reviews themselves or someone they reviewed in an earlier round.
- **Changing a student's repository through bulk update always failed with 400**
  (`courseinstances.js`): the whole request object was stored instead of its `github` field.
- **The course page endpoint could crash the backend** (`courseinstances.js`): it had no error
  handling, so for example a numeric `course` caused an unhandled database error. It now answers
  400 for a `course` that is not a course code, and 500 for any other error.
- **Code reviews could be saved without a review round** (`codeReviews.js`): a misplaced
  parenthesis meant a missing `reviewNumber` was never rejected.
- **Deleting a code review that does not exist left the request hanging** (`codeReviews.js`); it
  now answers 404.
- **A student with no assistant gave a 400 instead of "No assistant assigned to student."**
  (`assistants.js`).
- **"Notified" labels did not update after sending an email** (`coursePageReducer.js`): the reducer
  changed the comment or week in place and returned the old state object, so nothing re-rendered.
- **Reducers changed the existing state instead of returning a new one**, which can leave screens
  stale: the code review bulk insert, grade and remove, and a student's new comment
  (`coursePageReducer.js`); hiding a code review column (`coursePageLogicReducer.js`); four actions
  in `codeReviewReducer.js`; and nine checklist editing actions (`checklistReducer.js`). All now
  return new objects.
- **New checklist rows all got the id `-Infinity`** when the checklist started empty, so
  prerequisites could not tell them apart. New rows now get distinct ids starting from 1. Removing
  a row that does not exist no longer removes the last row instead.
- **A "Logout" button stayed in the nav after logging out** (`Nav.jsx`).

## 2026-10-10

### Operations
- **Staging data:** added course `TKT20010.2026.S.K.SIM1` (id 1) with `jaara` as teacher and
  students `tiraopiskelija1` and `tiraopiskelija2` (plain records, they cannot log in), using a
  one-off script run in the staging backend pod. The repo seeders were not used: staging had none
  of the demo users they depend on, and their undo steps empty whole tables. Staging had 2 users
  (`admini2`, `jaara`) and no courses before this.
- **Staging checked after the Sequelize 6 upgrade** (deployed from #1184): the new course, its
  students and the checklists work against the existing staging database.

### Security
- **Sequelize 5 → 6.37.8.** Fixes the SQL injection (via replacements) and information disclosure
  advisories; Sequelize 5 is no longer maintained. Code changes:
  - `models/index.js` loads models with `require(...)(sequelize, DataTypes)` instead of the removed
    `sequelize.import`, and the removed `operatorsAliases` option is gone from the config.
  - Migration `20191125133715-add_CASCADE_to_toReview_in_CodeReviews.js` uses the v6
    `addConstraint(table, { fields, ... })` signature. Databases that already ran it (production,
    staging) are not affected; fresh databases (dev, tests, e2e) need the new form.
  - Backend `npm audit`: critical findings 5 → 4. Sequelize 6 brings in an older `uuid` with a
    moderate finding that only applies when a buffer is passed, which Sequelize does not do.

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

### Fixed
- **Code review creation race** (`models/codereview.js`): the `beforeCreate` hook started a delete
  of older reviews without waiting for it, so the delete could remove the review being created.
  The hook now awaits the delete, and the test factory no longer has to skip it.

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

None of the bugs found by the new tests are open any more; there are no skipped tests.

Tooling:
- `npm run lint` in `labtool2.0` only checks `.js` files, so the `.jsx` pages are never linted
  (and have many old formatting errors).
