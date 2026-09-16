import { execSync } from 'child_process'
import path from 'path'

const composeFile = path.resolve(__dirname, '../../docker-compose.e2e.yml')

export default async () => {
  if (process.env.E2E_SKIP_RESET === 'true') {
    return
  }

  execSync(`docker compose -f ${composeFile} exec -T backend sh -c "npm run delete_test_data && npm run add_test_data"`, {
    stdio: 'inherit'
  })
}
