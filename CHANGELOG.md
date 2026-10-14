# Changelog

All notable changes to Labtool are recorded here, newest first. Each entry says what changed and
why. Bugs that tests found but that are not fixed yet are listed under "Known bugs".

## 2026-10-13

### Security
- **Frontend server upgraded from `serve` 6.5.8 to 14.2.6.** The 2017 version had known path traversal
  and XSS advisories. The production image (`Dockerfile`) now runs `serve -l 3000 -s build -c ../serve.json`.
- **Security headers.** The frontend sends a Content Security Policy (scripts only from the app itself,
  styles and fonts from cdnjs and Google Fonts, API calls to the app and api.github.com), plus nosniff,
  `X-Frame-Options: DENY`, a referrer policy, HSTS and a permissions policy (`labtool2.0/serve.json`).
  The backend sets the same kind of headers with `helmet` and no longer sends `X-Powered-By`. The
  Semantic UI stylesheet is loaded over explicit https instead of a protocol-relative URL.
- **Email addresses in the user list** (`GET /api/users`, used on the "Add and remove assistants" page)
  are only sent to sysops and teachers responsible for a course. Assistants still get the list, without
  email addresses.

## 2026-10-12

### Security
- **One request could crash the backend.** Express 4 does not catch rejected promises of async route
  handlers, and on Node 15+ an unhandled rejection ends the process, so any logged-in user could take the
  backend down with a malformed request (e.g. `POST /api/weeks/getDraft` with an unknown student). Route
  handlers registered in `app.js` now pass rejections to a final error handler (logged, answered with a
  generic 500, or 400 for malformed JSON), and `node app.js` logs unhandled rejections instead of
  crashing. Week drafts of an unknown student answer 404, and `PUT /api/users/update` checks that the
  email is a string and awaits the update properly.
- **Database errors are no longer sent to the client.** About twenty handlers answered with the raw
  Sequelize error, which contains SQL and its parameters; they now log it and answer with a generic
  message.
- **Tags of other courses could be edited by id.** `POST /api/tags/create` with an `id` only checked the
  course in the request, so staff of one course could rename, move or globalize another course's tag. The
  tag being edited must now belong to a course the user is staff on (404 for an unknown tag).
- **Global tags** are shown on every course, so editing and removing them is limited to sysops and
  teachers responsible for a course; assistants get 403 (creating global tags is unchanged). The tag
  removal failure is now shown in the UI.
- **Hidden comments could be emailed to the student.** The teacher notification for an instructors-only
  comment is refused (the UI never offered it).
- **Links that could run scripts.** The course page and course material links accept only http(s)
  addresses (backend 400, and the course settings form says so; failures of saving course settings are
  now shown), and an external repository to review must be a GitHub repository link
  (`https://github.com/owner/repo[/path]`). Before, a `javascript:` link set by any course staff member
  ran on the labtool page when clicked. Links stored earlier are rendered without a link target unless
  they are http(s) (`labtool2.0/src/util/links.js`).

## 2026-10-11

### Changed
- **Bigger review titles:** the week, final review and code review titles in a student's review list
  (course page, Browse reviews) use a larger font with a thicker separator and more space between them, and the
  redundant "Review" heading inside each review is gone.
- **Checklist editor copy form** shows its two sources as separate choices in a "Copy a checklist into
  week N" box: "From another week of this course" and "From week N of another course", each with its own
  Copy button and an "or" between them, so choosing a week no longer looks like it filters the courses.
  When no other course has a checklist for the week, that row says so instead of showing an empty
  dropdown. The copy logic is unchanged. When the selected week already has a checklist, the box is
  collapsed into a "Copy a checklist into week N..." button (and can be closed again); for a week
  without a checklist it is open. Copying on top of a week that already has a checklist asks first
  ("Overwrite the checklist of week N?", with its number of topics and checkboxes, saying that copying
  replaces it and the change is saved only when Save is pressed). "From another week of this course" lists only the weeks (and code
  review / final review) that have a saved checklist, refreshed whenever a week is loaded; when there are
  none, it says "No other week of this course has a checklist."
- **Checklist descriptions belong to checks, not topics** (#525). Each checkbox in the checklist editor
  has its own optional "Kuvaus" field (replacing the per-topic description), shown under the check's
  name when grading. Saved as `ChecklistItems.description` (trimmed, empty → null), returned with the
  checklist and copied with it. Migration `20261011180000-move-descriptions-to-checklist-items` adds the
  column and drops `Checklists.topicDescriptions`; topic descriptions written before it are discarded.
  The dev seed checklist has a description on each of its six checks.

### Added
- **Final review notes: only the assigned instructor edits, others add notes.** In the final review,
  only the student's assigned instructor can edit the review notes (the backend refuses other changes
  with 403 `NOTES_LOCKED`; without an assigned instructor everyone can, as before). The rest of the course
  staff see the notes read-only and add **additional review notes** of their own, listed with author and
  time on the review page and under the final review in the student's review list. Like review notes
  they are never shown to students. New table `ReviewNotes` (migration
  `20261012020000-create-review-notes`), endpoint `POST /api/reviewnotes` (course staff, final review
  only, and only once the review notes of the final review have been written); the notes come with the
  staff's course page data. In the final review the review notes field is open from the start instead of
  collapsed into an "Add review notes" button.
- **Copy all checklists of another course.** When a course has no checklists yet, the checklist editor
  offers a "This course has no checklists yet" box: choose one of your other courses (listed with how
  many checklists they have) and copy all its checklists at once. Weeks keep their numbers, a final
  review checklist goes to this course's final review, the code review checklist is copied too, and
  checklists for weeks this course does not have are skipped (the notification says which). Items,
  descriptions, maximum points and prerequisites are copied. New endpoint `POST /api/checklist/copyall`
  (staff of the course copied to; teacher or student of the course copied from; refused with 409 when the
  course already has checklists). The checklist copying of `copyCourseInformation` now shares the same
  helper (`server/helpers/copyChecklists.js`).
- **A course can be marked invalid** (#905), when it was registered or imported by mistake. The
  responsible teacher (not assistants) or an admin marks it, after a confirmation, on the course settings
  page or in the admin course list, and can restore it the same way. Nothing is deleted. An invalid
  course disappears from its students (course list, my page, course page, comments) and cannot be
  registered to; its staff and admins see it struck through at the bottom of course lists, hidden in
  the course list behind "Show invalid courses", with a banner on the course page. Invalid courses are
  not offered for copying course information or checklists. New column `CourseInstances.invalid`
  (migration `20261012000000-add-invalid-to-course-instances`) and endpoint
  `PUT /api/courseinstances/:ohid/invalid`.
- **Final review can be hidden from students.** Course settings have a prominent switch "Show final
  review results to students", shown only for courses with a final review, with a status line
  (hidden / shown) and a confirmation dialog before it changes. "Course registration is active" is now
  the first of the course settings checkboxes. "Points are given for final review" is shown only when the course
  has a final review.
- **Course settings Save and Cancel** sit below the final review switch and are enabled only when the
  settings differ from the saved ones (the reducer keeps `savedSettings` from the last load or save). While it is off, students do not get
  their final review at all (points, grade, feedback, checks, comments are left out of the course page
  data), cannot comment on it, and teachers cannot send email notifications about it; students see
  "Final review results are not shown yet". Staff see a "Hidden from students" label on the final review
  and a notice when grading it. New column `CourseInstances.finalReviewVisible` (migration
  `20261011200000-add-finalReviewVisible-to-course-instances`): final reviews are hidden by default, on
  existing courses too (migration `20261012010000-hide-final-reviews-by-default` hides them on courses
  where an earlier version of the first migration had shown them).
- **Checklist preview in the checklist editor.** A "Preview" button next to Save opens the checklist
  being edited, unsaved changes included, as it looks when grading: checks can be ticked to see the
  feedback text and points (prerequisites hide and uncheck dependent checks, points are capped at the
  checklist's maximum). Nothing is saved; the preview starts empty each time it is opened.
- **Dev seed course has a week 1 checklist:** `TKT20010.2026.S.K.SIM1` gets a checklist for week 1
  (max 3 points) with three described topics (Ohjelmakoodi, Testaus, Dokumentaatio) and six items,
  so the grading checklist and topic descriptions (#525) can be tried right after a reset.
- **Checklist topic descriptions** (#525). Each topic in the checklist editor has an optional
  "Topic description" field; the description is shown under the topic when grading with the
  checklist (week reviews and code reviews). Descriptions are saved with the checklist, kept only for
  existing topics, removed with their topic, and copied along with checklists and course details.
  New column `Checklists.topicDescriptions` (migration
  `20261011160000-add-topicDescriptions-to-checklists.js`).
- **Editing comments** (#534). The author of a comment (instructor or student) can edit its text:
  "Edit" under their own comments opens an inline editor with Save / Cancel. Edited comments show
  "(edited <time>)" and become unread again for the others. Only the author can edit, visibility
  (instructors only or not) cannot be changed, and old comments without a known author cannot be
  edited. New endpoint `PUT /api/comment/:id` and column `Comments.editedAt` (migration
  `20261011150000-add-editedAt-to-comments.js`).
- **Student list marks points changed by someone other than the assigned instructor.** On the
  course page, a week, final review or code review cell whose points (or grade) were changed by
  someone else than the student's assigned instructor gets a light orange background; hovering it
  shows who changed what and when ("Changed by someone other than the assigned instructor (Aatu
  Assistentti): 11.10.2026 14.32 Pää Opettaja: points 2 → 2.5"). Based on the change history, so
  only changes since it was added count, compared to the current assigned instructor; students
  without one are not marked. The teacher's course page data includes `pointsChangedByOthers` per
  week and code review.
- **Change history of a whole student in Browse reviews:** the student's Browse reviews page (opened
  from their name on the course page) ends with their whole change history: all recorded week
  review, final review, code review grading and repository changes, each labelled ("Week 3",
  "Code review 1", "Repository"), with filters All / Week reviews / Code reviews / Repository. It
  replaces the repository-only history there. (A separate history page linked from an icon in the
  course page's student table was tried first and removed.)
- **Change history of grading** (#1129). Every week review save and code review grading is logged:
  who, when, points and grade old → new, the full old and new feedback and review notes texts, and
  which checklist boxes changed. Course staff see it as an orange, instructor-only "Change history"
  under the review on the week review and code review grading pages; old and new texts open with
  "Show old and new text". Changes are recorded from this release on.
- **Repository link history** (#1132). Repository changes (at registration, by the student, or by a
  teacher's bulk update) are logged with old → new and who made them; course staff see them in the
  student's change history in Browse reviews.
- **Code reviews remember the reviewed repository** (#1132). A code review stores the reviewee's
  repository when it is assigned and when the reviewer adds their link, so a later repository change
  no longer silently changes which repository a past review shows. If the student has changed their
  repository since, instructors see "The student has changed their repository since; it is now …".
  Older reviews show the current repository as before.
- New table `ChangeLogs` and columns `CodeReviews.repoAtAssignment` / `repoAtLinkAdded` (migration
  `20261011130000-create-change-logs.js`), endpoint `GET /api/changelog/:studentInstanceId` (course
  staff only).
- **The first entry is marked as initial:** a review's first save ("Initial review"), the first
  grading of a code review ("Initial grading") and the repository given at registration ("Repository
  at registration") are shown as the initial version (values, and "Show text" for texts) instead of a
  change from empty. New column `ChangeLogs.initial` (migration
  `20261011140000-add-initial-to-change-logs.js`); entries recorded before it are not marked.
- **Dev seed course has two teachers:** on `TKT20010.2026.S.K.SIM1`, Ossi Ohjaaja Mutikainen
  (`tiraohjaaja`) is an assistant next to Pää Opettaja, and the four students (a new one, Sanna Sofia
  Makkonen, was added) are split between them, two each. Useful for trying the assigned-instructor
  confirmation (#1127) and instructor-only comments (#1142).
- **Instructor-only comments are unmistakable** (#1142, the comment part):
  - They are shown with an orange border and background and the label "Instructors only: not shown
    to the student", instead of greyed out with a small "Hidden".
  - When writing a comment, the easy-to-miss "Add comment for instructors only" checkbox is replaced
    by an explicit choice, "Who can see this comment: Student and instructors | Instructors only".
    The default stays visible to the student, and the choice returns to it after each comment.
  - Choosing "Instructors only" turns the text area border orange, changes its placeholder, and
    changes the button to an orange "Add instructor-only note".
- **Review notes on the review page are styled as instructor-only too** (#1142): the section has
  the same orange border, background and "Instructors only: not shown to the student" label.
  While empty, the section is collapsed into an orange "Add review notes (instructors only)"
  button that opens it; reviews with notes show it open.
- **Local email setup for development and e2e tests** (for #1141):
  - The dev and e2e docker compose stacks have a Mailpit mail server that catches all email; inbox
    at http://localhost:8025 (dev) and :8026 (e2e). It rejects recipients outside the seed data's
    domains, so delivery failures can be reproduced.
  - The backend sends real email whenever `SMTP_HOST` / `SMTP_PORT` are set; without them,
    behaviour is as before (sent in production/staging, simulated elsewhere).
  - Seeded students with rejected addresses: Pekka Palautuva (`pekka.palautuva@rejected.test`) on
    the dev course `TKT20010.2026.S.K.SIM1`, and a separate `E2E.BOUNCE.COURSE.1` in the e2e seed.
  - The e2e email tests now check the mail delivered to Mailpit. This showed that the mass email
    test had been turning the "copy to instructors" option off; it now checks the copy arrives.
  - A new e2e test checks that a rejected recipient gives an error and gets no mail.
- **Filter box on the course staff page** (#325): filters the user list by name, username, email
  or student number.
- **Warning when two students review the same project in one code review round** (#442): in the
  reviewee dropdown, students another reviewer already has are marked "also reviewed by another
  student", and choosing one shows a warning.
- **Copy checklist: better order of source courses** (#1139): earlier runs of the same course (same
  course code) come first, then other courses, newest first within both. Courses without a
  checklist to copy were already hidden on 2026-10-10.

### Changed (dev tooling)
- **Backend lint and test tooling upgraded:**
  - eslint 4 → 9.39.5 with a flat `eslint.config.js` that keeps the old style rules (no
    semicolons, single quotes, 2-space indent, 120 columns) without the airbnb config.
  - mocha 5 → 12.0.3; `test/mocha.opts`, which mocha no longer reads, is replaced by
    `.mocharc.js`.
  - supertest 3 → 7.3.1, nock 9 → 14.0.17, cross-env 5 → 10.1.0.
  - nodemon moved to devDependencies, so it is no longer installed in the production image.
- **Removed unused backend packages:** `should`, `tape` (both were listed as production
  dependencies), `assert` (the tests use Node's built-in module), `js-beautify`, `standard`,
  `prettier` and the old eslint configs and plugins.
- **Frontend lint and format tooling upgraded:** eslint 6 → 9.39.5 with a flat
  `eslint.config.mjs` (the same rules that were in effect before), prettier 1 → 3.9.9, vitest
  4.1.10 → 4.1.11. Lint now also checks the `.jsx` pages, which it had skipped; `src` was
  reformatted once with prettier 3 in a separate, formatting-only commit.
- **Removed unused frontend packages:** `git-rev-sync`, `preval.macro` and `dotenv` (listed as
  runtime dependencies), `redux-mock-store`, `react-test-renderer`, `identity-obj-proxy`,
  `jest-css-modules`, `jsinspect`, `js-beautify`, `babel-eslint` and the old eslint configs and
  plugins.
- **Removed husky and lint-staged.** The pre-commit hook was never installed, because
  `labtool2.0/.npmrc` sets `ignore-scripts=true`. CI lints every pull request instead.

### Security
- **pug 2 → 3.0.4** (renders the `/admin` page; fixes code execution advisories).
- Backend `npm audit`: 24 → 5 findings, 0 critical. Production dependencies have only the 2
  moderate `uuid` findings from Sequelize 6; the rest is nodemon's file watcher in dev.
- Frontend `npm audit`: 22 → 0 findings.

### Fixed
- **Final review points aligned in the student list:** the final review cell put its points at the top
  of the cell; they are now vertically centred like the weekly points.
- **Floating point points shown rounded** (#508). Points are shown with at most two decimals and no
  trailing zeros everywhere (`3`, `0.5`, `1.25` instead of `2.9999999999`, `3.00` or `0.50`): the
  shared `roundNumber`, the change history, the changed-cell tooltip in the student list and the week
  review email. The columns stay `DOUBLE`; no data is changed.
- **Checklist editor description field:** the field is now full width and labelled "Kuvaus"; it used
  to be a tiny unlabelled box.
- **Checklist editor showed stale contents:** reopening the editor restored the copy remembered in the
  browser instead of the saved checklist, so later changes (e.g. topic descriptions) could be missing.
  Without unsaved edits it now reloads the checklist from the server.
- **Unsaved review edits restored from the browser looked like the saved review.** The review page
  keeps what you type in the browser until you save; reopening a week showed those values exactly
  like a saved review (e.g. points for a week the student list shows as not reviewed). Now such values
  get a "Unsaved changes" box ("... changes made in this browser (last edited ...) that have not been
  saved yet. Save to keep them, or press Cancel to discard them."). The page records when the form
  was last edited. "Load their version" (#1127) now also resets the
  form properly instead of only clearing the browser storage.
- **Grading could silently overwrite another instructor's work** (#1127). Several checklists were
  reset or half-emptied during a final grading round. Two causes are fixed:
  - **Old unsaved edits in the browser won over the saved review.** The review page keeps edits in
    the browser and preferred them over the saved review, even when someone had saved the review
    since; saving then overwrote their work. Now such older edits are discarded (with a note) and
    the saved review is shown.
  - **The last save always won.** The review page now sends the version it loaded. If someone saved
    the review after it was opened, the save is refused (409): "Aatu Assistentti saved this review
    after you opened it", with the choice to **load their version** or **overwrite with my
    version**. Saving only checklist checks also counts as a new version.
  - New column `Weeks.updatedBy` records who saved a review last (migration
    `20261011120000-add-updatedBy-to-weeks.js`); a first step towards the audit log in #1129.
- **Grading a student who has another assigned instructor now asks for confirmation** (#1127). The
  review page shows the assigned instructor ("(you)", or a warning when it is someone else).
  Changing points, grade, feedback or checklist checks of someone else's student asks "Save
  anyway?"; changing only the instructor notes does not. The backend enforces the same rule.
- **A failed review save no longer empties the form** (helps #1145): the form used to be cleared
  before sending, so a failed save (e.g. a conflict or an expired login) lost the typed review. It
  is now cleared only after a successful save.
- **Email delivery failures were reported badly** (#1141). Reproduced with the Mailpit setup:
  - A mass email where the mail server rejected one recipient answered 400 "Email rejected by SMTP
    server.", although the others did get it; resending would have mailed them twice. Now it
    answers 200, the notification says "Email sent to N of M recipients. Not delivered to: …" with
    each name, address and reason, and is shown as an error so it is noticed.
  - When every recipient was rejected it answered 500 "Unexpected error". Now it answers 400 "No
    email was sent. Not delivered to: …".
  - Students without an email address were dropped silently; they are now listed as not
    delivered.
  - A single notification to a rejected address answered 500; now 400 naming the address. A
    recipient without an email address is reported instead of failing.
- **Mass email page when some recipients did not get the email** (follow-up to #1141): instead of
  going back to the course page, where the notification disappeared after a few seconds, the page
  now stays open. A box lists who did not get the email and why (until dismissed), the message is
  kept, and exactly those students are selected, so the email can be resent once their addresses
  are fixed. When everybody got the email, the page goes back to the course page as before. The
  response's not-delivered entries now include `studentInstanceId`.
- **Collapsing the "Add comment" box erased the written comment** (#1162). The draft is now kept
  until the comment is sent.
- **Checklist topics and feedback text came out in a random order when grading** (#1125, #1130).
  The course details endpoint loaded checklist items without sorting them; it now sorts them by
  the order set in the checklist editor, which also fixes the order of the feedback text built
  from the checklist.
- **Comment and instructor note text areas can be resized vertically again** (#1126). The
  Markdown preview keeps its height and scrolls.
- **Prerequisites between new checkboxes** (#1124). New checkboxes all had the same id, so the
  prerequisite dropdown could not tell them apart (fixed in #1186); a new checkbox could also be
  chosen as its own prerequisite, which then failed as a loop. A test now covers making one new
  checkbox require another and saving.
- **Checkboxes with the same name broke the checklist editor** (#1163): typing into the second
  one changed the first, and deleting either did not update the screen. The editor identified rows
  by name, both in its actions and as the React key. Rows are now identified by their position in
  the category, and keyed by their id. Tests reproduce both symptoms.
- **Builds with `VITE_SHOW_VERSION` set crashed on load** (`App.jsx`, used by `Dockerfile.test`):
  `__BUILD_TIME__` and `__GIT_REVISION__` were no longer defined after the move to Vite. They are
  now defined in `vite.config.ts` (the git revision can be passed as `GIT_REVISION` in Docker).
- A duplicated `data-testid` prop in `StudentTableRow.jsx`.
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

None of the bugs found by the tests are open.

