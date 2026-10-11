# End-to-end tests

Playwright tests that drive the real UI through the core teacher and student flows. They run
against their own docker compose stack (`../docker-compose.e2e.yml`: frontend, backend, Postgres
and the fake Kurki course registry), which uses separate ports and a throwaway database, so it can
run alongside the normal dev stack.

## Running

First time only:

```
cd e2e
npm install
npx playwright install chromium
```

Run everything in one go (starts the stack, runs the suite, tears the stack down; exits non-zero
if any test fails):

```
npm run e2e
```

While writing tests, keep the stack running between runs:

```
npm run e2e:up                              # stack on :3010 (frontend) and :3011 (backend)
npm test                                    # whole suite
npx playwright test tests/tags.spec.ts      # one spec
npx playwright test -g "logs out"           # tests matching a name
npm run test:ui                             # step through interactively
npm run test:headed                         # watch the browser
npm run e2e:down                            # tear the stack down
```

The backend container runs `npm start` without a file watcher, so after changing backend code or
the seeder, restart the stack (`npm run e2e:down && npm run e2e:up`).

On failure, screenshots, videos and traces are saved in `test-results/` and an HTML report in
`playwright-report/` (`npx playwright show-report`).

CI runs the suite on every pull request (the `e2e` job in `.github/workflows/tests.yml`) and
uploads both folders as the `playwright-report` artifact when it fails.

## What is covered

55 tests in 18 spec files.

| Spec | Tests | Covers |
|---|---|---|
| `smoke` | 7 | Main pages render without uncaught errors, stuck loaders or error notifications: my page, course list, course page (student and teacher), browse reviews, course settings, admin |
| `student-registration` | 2 | A student finds a course, registers with project name and repo and stays registered; the teacher sees the new student |
| `teacher-grading` | 2 | Points above the week maximum are rejected; a teacher grades week 1 and the student sees points and feedback |
| `week-review-draft` | 3 | A teacher saves a review as a draft and the student cannot see it; the teacher continues from the draft and publishes it |
| `checklist` | 2 | A teacher creates a week 1 checklist; when reviewing, ticking items fills in points and feedback |
| `code-reviews` | 3 | A teacher creates a review round and assigns reviewers; the student sees whom to review and submits a link; the teacher grades it and the student sees the points |
| `comments` | 3 | A student comments on a reviewed week; the teacher replies and adds an instructor-only note; the student sees the reply but not the note |
| `tags` | 2 | A teacher creates a tag, tags a student, filters by the tag and removes it |
| `course-settings` | 3 | A teacher changes week amount, max points, current week, material link and registration status; changes persist; registration can be reactivated |
| `course-staff` | 4 | A teacher adds an assistant and assigns a student to them; the assistant sees the course and the student; the teacher removes the assistant |
| `email` | 5 | Notifying a student about a reviewed week and a mass email to all students with a copy to instructors (both checked in the Mailpit inbox), the error when no recipient is selected, and a rejected address (#1141): the others still get the email and the teacher is told who did not, or nothing is sent when every address is rejected |
| `grading-safety` | 4 | Two instructors grading the same review in two browsers: the second save is stopped, and the instructor can load the other version or overwrite it on purpose; grading a student with another assigned instructor asks for confirmation, the assigned instructor is not asked (#1127) |
| `change-history` | 3 | The review page shows who changed a week's grading with the old and new texts; a student's repository change shows in their change history; Browse reviews shows the student's whole change history, which can be filtered (#1129, #1132) |
| `dropping-out` | 5 | A teacher marks a student dropped and the student sees it; the teacher marks a registration mistaken; the student removes themselves and disappears from the teacher's list |
| `my-page` | 2 | A user changes their email address; a user without one must give one before using the app |
| `logout` | 1 | Logging out clears the session |
| `invalid-course` | 3 | The teacher marks a course invalid with a confirmation; it is struck through in the teacher's lists and hidden in the course list behind a toggle; it disappears from its students; the teacher restores it and the students see it again (#905) |
| `course-import` | 1 | A sysop imports a course from Kurki, becomes its teacher, and the course disappears from the import list |

**Email.** The e2e stack has its own Mailpit mail server, which catches everything the backend
sends; its inbox is at http://localhost:8026 while the stack runs. `fixtures/mailpit.ts` reads the
inbox, and the global setup empties it before every run. Mailpit rejects recipients outside the
domains used in the seed data, so the seeded student with the address `bounce@rejected.test` on
`E2E.BOUNCE.COURSE.1` triggers a delivery failure (issue #1141).

## How the suite is set up

**Test data.** `fixtures/global-setup.ts` reseeds the database before every run, so the suite can
be run repeatedly on the same stack. The data comes from
`backend/server/seeders/20260916000000-e2e-fixtures.js`, which only inserts anything when
`E2E_SEED=true` (set in the e2e compose file), so the dev stack is untouched. Its `down` step also
removes everything the tests create through the UI, including courses imported from Kurki. Set
`E2E_SKIP_RESET=true` to skip the reseed.

**Kurki.** The fake Kurki (`Kurki_simulation/`) generates two courses, with course codes ending in
`SIM1` and `TEACHER` as their teacher, for any term it has no response file for. The import test
therefore always has courses from the current term to import, and the seeder recognises imported
courses by that suffix.

**One course per spec.** Each spec has its own seeded course (ids 90001–90010, see `COURSES` in
`fixtures/data.ts`), so specs do not share data and can run in any order. Steps that build on each
other within a file use `test.describe.serial`. Tests run with a single worker.

**Fixtures** (`fixtures/`):

- `data.ts` — all ids, course codes, users and notification texts. They must match the seeder.
  Users: `TEACHER` (also sysop), `REGISTERED_STUDENT`, `UNREGISTERED_STUDENT`, `SECOND_STUDENT`,
  `ASSISTANT`, `EMAIL_CHANGER`, `NO_EMAIL_USER`.
- `auth.ts` — fake Shibboleth login through localStorage (`fake-shibbo-data`):
  - `loginAs(page, user)` logs in on every page load
  - `loginOnceAs(page, user)` logs in once, so a logout sticks
  - `newPageAs(browser, user)` opens a second user's page in a fresh context
  - `gotoWithSession(page, path)` opens my page first, then `path` (see known issues)
- `helpers.ts`:
  - `waitForApi` and `clickAndWaitForApi` wait for the API calls a page makes on mount before the
    test types into it. Some pages, like ReviewStudent, first render stale store data, then reset
    and refetch, and input typed in between is lost.
  - `chooseDropdownOption` and `openAccordion` handle Semantic UI widgets.
  - `expectNoLoader` and `expectSuccess` are common assertions.

**Writing tests.** Prefer role, text and label locators over CSS or test ids, and add shared
constants to `fixtures/data.ts`. If a spec needs new data, add it to the e2e seeder (keeping it
behind `E2E_SEED` and removing it in `down`) under a new course id. Do not use fixed sleeps; wait
for responses or UI state instead.

## Known issues

- **Opening some pages directly at the start of a session can show a blank page.** BrowseReviews
  and the code review settings page crash if a page's first render sees stale loading state, which
  depends on the order in which two responses arrive. `gotoWithSession` works around it. This is
  an app bug, not a test bug.
