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

## End-to-end tests

Playwright tests covering the core student and teacher flows live in `e2e/`. They run against
their own docker compose stack (`docker-compose.e2e.yml`), which uses separate ports and an
ephemeral database, so it can run alongside the normal dev stack.

First time only:

```
cd e2e
npm install
npx playwright install chromium
```

Then, to run everything in one shot — starts the stack, runs the suite, tears the stack down:

```
npm run e2e
```

It exits non-zero if any test fails, and tears the stack down either way.

While developing tests it is faster to keep the stack running between runs:

```
npm run e2e:up      # start the stack on :3010 (frontend) and :3011 (backend)
npm test            # run the suite
npm run test:ui     # or step through it interactively
npm run e2e:down    # tear the stack down
```

The suite reseeds the database before every run, so it is safe to run repeatedly. Fixtures come
from `backend/server/seeders/20260916000000-e2e-fixtures.js`, which only inserts anything when
`E2E_SEED=true` and therefore leaves the dev stack untouched.
