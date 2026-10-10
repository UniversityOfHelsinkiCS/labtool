# Labtool

**Labtool** is a tool for grading programming projects at the Department of Computer Science, University of Helsinki.  

Production in [https://study.cs.helsinki.fi/labtool/](https://study.cs.helsinki.fi/labtool/)

We have continued work which was started by the previous group (Software Engineering Project, TKT20007) during spring and early summer semesters, 2018. They rewrote the entire codebase of Labtool in `Node.js` and `React`. Previously `Ruby on Rails` was used.

Current documentation:

- Labtool's [Wiki on GitHub](https://github.com/UniversityOfHelsinkiCS/labtool/wiki)

## Running locally

Quickstart for local development:

- install docker and docker compose
- clone the repository
- build the docker images with `docker compose build`
- run `docker compose up` to start the application

The frontend is at [http://localhost:3000](http://localhost:3000) and the backend at
[http://localhost:3001](http://localhost:3001). The backend recreates and reseeds the database
on every start, and you can log in as any of the seeded users through the fake login page.

Email goes to a local [Mailpit](https://mailpit.axllent.org/) server instead of the university's
SMTP server; read it at [http://localhost:8025](http://localhost:8025). Mailpit rejects recipients
outside the domains used in the seed data (`helsinki.invalid`, `helsinki.fi`, `example.com`,
`example.org`), the way a real server rejects a bad address. To try a delivery failure, send a mass
email on the course `TKT20010.2026.S.K.SIM1`: the seeded student Pekka Palautuva has the address
`pekka.palautuva@rejected.test`. The backend sends real email whenever `SMTP_HOST` (and optionally
`SMTP_PORT`) is set; without it, email is only sent in production and staging and simulated
elsewhere.

## Tests

There are three test suites. CI (`.github/workflows/tests.yml`) runs all of them, plus linting,
on every pull request and before staging and production deploys.

Skipped tests (`it.skip`, `test.fixme`) mark known bugs in the app. Each one has a comment
explaining the bug; un-skip the test when the bug is fixed.

### Frontend unit tests

Vitest tests in `labtool2.0/src/tests/` cover components, reducers, the service functions and the
API middleware. HTTP is mocked with [msw](https://mswjs.io/), so the tests do not depend on axios
internals.

```
cd labtool2.0
npm test                                      # all tests
npx vitest run src/tests/CoursePage.test.js   # one file
npm run lint
```

### Backend API tests

Mocha and supertest tests in `backend/test/` call the API over HTTP against a real Postgres
database. Kurki is mocked and email is stubbed, so nothing leaves the machine. The easiest way to
run them is in Docker, which needs no local database:

```
cd backend
npm run test:docker                         # builds and runs docker-compose.test.yml, then tears it down
npm run test:docker -- test/users.spec.js   # one file
npm run lint
```

With a Postgres reachable directly (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`; database
`labtool_test`), `npm test` runs the suite without Docker.

### End-to-end tests

Playwright tests in `e2e/` drive the real UI through the core teacher and student flows, against
their own docker compose stack (`docker-compose.e2e.yml`) that can run alongside the dev stack.

```
cd e2e
npm install && npx playwright install chromium   # first time only
npm run e2e                                      # start the stack, run the suite, tear it down
```

See [e2e/README.md](e2e/README.md) for what the suite covers, how to develop tests against a
running stack, and how test data is seeded.
