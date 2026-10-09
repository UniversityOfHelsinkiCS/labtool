# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Labtool is a grading tool for programming projects at the University of Helsinki CS department. Monorepo with:

- `backend/` — Express + Sequelize 5 (Postgres) API on port 3001
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

`test/helpers/setup.js` (loaded via `test/mocha.opts`) runs migrations, truncates all tables before every test and blocks real network with nock. Fixtures come from `test/helpers/factories.js` (`createScenario()`: course with teacher, assistant, two students, outsider and a teacher of another course); `as(user)` in `test/helpers/api.js` signs JWTs like login does. Kurki is mocked with nock; SMTP is stubbed at `nodemailer.createTransport` (`test/helpers/mailer.js`). `it.skip` tests document known app bugs. CI (`.github/workflows/tests.yml`, on pull requests and before staging/production deploys) runs frontend lint + tests, backend lint, the backend API tests and the e2e suite.

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

- `app.js` wires middleware in order: Shibboleth header charset fix → bearer token extraction → env checks (`TOKEN`, `SECRET`, `ADMIN_PW` must be set or every request returns an error message) → CORS → `authenticate`. `authenticate` never rejects; it sets `req.authenticated = { success, error }` and `req.decoded` (JWT payload `{ username, id }`). **Each controller must check `req.authenticated.success` itself** and enforce permissions, typically via `server/helpers/auth.js` (`enforceCurrentUser`, `enforceCurrentUserIsStudentOnCourse`, ...) and per-controller helpers (`controllerBeforeAuthCheckAction`).
- Layering: `server/routes/*.js` (each exports `(app) => {...}` and is registered explicitly in `app.js`) → `server/controllers/*` (exported via `controllers/index.js`) → `server/helpers/*` → `server/models/*` (auto-loaded by `models/index.js`).
- Authentication is Shibboleth: in production the proxy injects `uid`, `givenname`, `sn`, `mail`, `hypersonstudentid` headers and `POST /api/login` does `findOrCreate` on the user and returns a JWT. With `USE_FAKE_LOGIN=ThisIsNotProduction` (backend) and `VITE_USE_FAKE_LOGIN=ThisIsNotProduction` (frontend), the frontend sends these headers itself from localStorage (`fake-shibbo-data`); fake users are in `labtool2.0/src/util/fakeLoginUsers.js`.
- Migrations live in `backend/server/migrations` (used both by sequelize-cli via `.sequelizerc` and by Umzug, which runs pending migrations automatically on server start in `server/utils/database.js`). `backend/migrations/` and `backend/config/` are legacy duplicates — use the `server/` versions.
- DB config: `server/config/config.js`; staging/production use `DATABASE_URL`. `KURKI_URL` points course import at the fake Kurki or the real importer.

### Frontend

- All API calls go through a custom Redux middleware in `src/util/apiConnection.js`. Services (`src/services/*.js`) call `callController(route, prefix, data, method)`, which dispatches `${prefix}ATTEMPT`; the `handleRequest` middleware performs the axios call with the stored JWT and dispatches `${prefix}SUCCESS` (with `response`) or `${prefix}FAILURE`. Reducers (`src/reducers/*`, all combined in `src/store.js`) react to these prefixed action types. To add an endpoint: add a service function with a new prefix, then handle `PREFIX_SUCCESS`/`FAILURE` in the relevant reducers.
- API base URL: `VITE_API_URL` if set, else `http://localhost:3001/api` in dev, else `/labtool-backend/api` in prod.
- Network errors are treated as Shibboleth session expiry and trigger a page reload (rate limited).
- Pages are in `src/components/pages/`; tests in `src/tests/` (some use snapshots in `__snapshots__`). Vite config transforms JSX inside `.js` files too, and uses the classic JSX runtime (files need `import React`).
