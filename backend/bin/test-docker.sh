#!/bin/sh
# Runs the backend API test suite in Docker against a throwaway Postgres (docker-compose.test.yml,
# compose project "labtool-test", no published ports). Extra arguments are passed to mocha, e.g.
#   sh bin/test-docker.sh test/users.spec.js
# Exits with the test exit code and always tears the stack down.
cd "$(dirname "$0")/../.." || exit 1

compose() {
  docker compose -f docker-compose.test.yml "$@"
}

cleanup() {
  compose down -v --remove-orphans >/dev/null 2>&1
}
trap 'cleanup; exit 130' INT TERM

compose build backend || { cleanup; exit 1; }
compose run --rm backend npm test -- "$@"
code=$?
cleanup
exit $code
