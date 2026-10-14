# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Changelog

Record every change in `CHANGELOG.md` (newest first, under today's date: Added / Fixed / Security / Documentation). When a test finds a bug that isn't fixed, add it under "Known bugs"; when it is fixed, move it to "Fixed".

## Overview

Labtool is a grading tool for programming projects at the University of Helsinki CS department. Monorepo with:

- `backend/` — Express + Sequelize 6 (Postgres) API on port 3001
- `labtool2.0/` — React 17 + Redux + Semantic UI frontend, built with Vite (port 3000)
- `Kurki_simulation/` — fake course-registry ("Kurki") service used for course imports in dev/e2e (port 3002)
- `e2e/` — Playwright end-to-end tests

## Commands

Local dev runs entirely in Docker:

```
docker compose build
docker compose up          # or `docker compose watch` to sync source changes into containers
```

The dev backend container drops, recreates, migrates and seeds the DB on every start (`npm run dropdb; createdb; migrate; add_test_data; watch`), so dev data is not persistent across restarts.

Frontend (`labtool2.0/`):

```
npm run lint
npm test                              # vitest run
npx vitest run src/tests/CoursePage.test.js   # single test file
npx vitest run -t "test name"         # single test by name
npm run build                         # outputs to build/, base path /labtool/
```

Backend (`backend/`):

```
npm run lint
npm run migrate / npm run add_test_data / npm run reset_db
```

Backend API integration tests (`backend/test/*.spec.js`, mocha + supertest against the exported `app`, real Postgres):

```
npm run test:docker                            # builds docker-compose.test.yml (project labtool-test, no published ports), runs suite, tears down
npm run test:docker -- test/users.spec.js      # single file
npm test                                       # when Postgres is reachable directly (DB_HOST/DB_PORT/DB_PASSWORD, db labtool_test)
npm test -- test/users.spec.js -g "sysop"      # single file / test name
```

`test/helpers/setup.js` (loaded via `backend/.mocharc.js`) runs migrations, truncates all tables before every test and blocks real network with nock. Fixtures come from `test/helpers/factories.js` (`createScenario()`: course with teacher, assistant, two students, outsider and a teacher of another course); `as(user)` in `test/helpers/api.js` signs JWTs like login does. Kurki is mocked with nock; SMTP is stubbed at `nodemailer.createTransport` (`test/helpers/mailer.js`). CI (`.github/workflows/tests.yml`, on pull requests and before staging/production deploys) runs frontend lint + tests, backend lint, the backend API tests and the e2e suite.

E2E (`e2e/`, first time: `npm install && npx playwright install chromium`):

```
npm run e2e                 # up stack, run suite, tear down
npm run e2e:up              # stack on :3010 (frontend) / :3011 (backend), separate from dev stack
npx playwright test tests/smoke.spec.ts   # single spec against running stack
npm run e2e:down
```

E2E fixtures come from `backend/server/seeders/20260916000000-e2e-fixtures.js`, which only inserts data when `E2E_SEED=true`.

## Architecture

### Backend

- `app.js` wires middleware in order: Shibboleth header charset fix → bearer token extraction → env checks (`TOKEN`, `SECRET`, `ADMIN_PW` must be set or every request returns an error message) → CORS → `authenticate` → `requireAuth`. `authenticate` sets `req.authenticated` and `req.decoded` (JWT payload `{ username, id }`); `requireAuth` answers 401 to every `/api` request without a valid token except the public paths listed in it (`/api`, `/api/ping`, login, fake login, logout) and CORS preflights. Handlers can therefore rely on `req.decoded` and only enforce permissions, via `server/helpers/auth.js` (`isCourseStaff`, `isSysop`, `getTeacherId`, `findStudentInstance`, and `requireCourseStaff` / `requireSysop` / `requireCurrentUser` / `requireStudentOnCourse` / `requireCanReview`, which throw a 403).
- Errors: handlers `throw` an `HttpError` (`server/utils/httpError.js`: `badRequest`, `forbidden`, `notFound`) instead of writing error responses; the error handler at the end of `app.js` answers `{ message }` with its status, and any other error is logged and answered with a generic 500 `{ message }` (never the error itself). Rejected promises of async handlers reach it automatically, so handlers need no try/catch. A few error bodies the frontend reads stay explicit (week review 409 conflict, `NOTES_LOCKED`, mass email `notDelivered`, checklist `data.copying`). Success responses are often read field by field by the reducers, so keep their shape.
- Layering: `server/routes/*.js` (each exports `(app) => {...}` and is registered explicitly in `app.js`) → `server/controllers/*` (exported via `controllers/index.js`) → `server/helpers/*` → `server/models/*` (auto-loaded by `models/index.js`).
- Authentication is Shibboleth: in production the proxy injects `uid`, `givenname`, `sn`, `mail`, `hypersonstudentid` headers and `POST /api/login` does `findOrCreate` on the user and returns a JWT. With `USE_FAKE_LOGIN=ThisIsNotProduction` (backend) and `VITE_USE_FAKE_LOGIN=ThisIsNotProduction` (frontend), the frontend sends these headers itself from localStorage (`fake-shibbo-data`); fake users are in `labtool2.0/src/util/fakeLoginUsers.js`.
- Migrations live in `backend/server/migrations` (used both by sequelize-cli via `.sequelizerc` and by Umzug, which runs pending migrations automatically on server start in `server/utils/database.js`). `backend/migrations/` and `backend/config/` are symlinks to the `server/` versions.
- DB config: `server/config/config.js`; staging/production use `DATABASE_URL`. `KURKI_URL` points course import at the fake Kurki or the real importer.
- Change history (`server/helpers/changeLog.js`, table `ChangeLogs`): week review saves, code review grading and repository link changes write a row with who/when and `{ field: { from, to } }` (full texts) plus changed checklist items; read via `GET /api/changelog/:studentInstanceId` (course staff). Code reviews keep `repoAtAssignment` / `repoAtLinkAdded`.
- Email (`server/controllers/email.js`): sent for real in production/staging, or whenever `SMTP_HOST` (+ `SMTP_PORT`) is set; otherwise simulated. The dev and e2e compose stacks set it to a Mailpit container (inbox http://localhost:8025 dev / :8026 e2e) that rejects recipients outside the seed data's domains, e.g. `@rejected.test`.

### Frontend

- All API calls go through a custom Redux middleware in `src/util/apiConnection.js`. Services (`src/services/*.js`) call `callController(route, prefix, data, method)`, which dispatches `${prefix}ATTEMPT`; the `handleRequest` middleware performs the axios call with the stored JWT and dispatches `${prefix}SUCCESS` (with `response`) or `${prefix}FAILURE`. Reducers (`src/reducers/*`, all combined in `src/store.js`) react to these prefixed action types. To add an endpoint: add a service function with a new prefix, then handle `PREFIX_SUCCESS`/`FAILURE` in the relevant reducers.
- API base URL: `VITE_API_URL` if set, else `http://localhost:3001/api` in dev, else `/labtool-backend/api` in prod.
- Network errors are treated as Shibboleth session expiry and trigger a page reload (rate limited).
- Read the message of a failed request with `errorMessage(action.response, fallback)` from `src/util/errorMessage.js`; it handles `{ message }`, older string / `{ error }` bodies and failures without a response.
- Pages are in `src/components/pages/`; tests in `src/tests/` (some use snapshots in `__snapshots__`). Vite config transforms JSX inside `.js` files too, and uses the classic JSX runtime (files need `import React`).
