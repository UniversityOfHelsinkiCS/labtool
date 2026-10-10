const db = require('../../server/models')

let tableNames = null

const getTableNames = async () => {
  if (!tableNames) {
    const [rows] = await db.sequelize.query(
      `SELECT tablename FROM pg_tables
       WHERE schemaname = 'public' AND tablename <> 'SequelizeMeta'`
    )
    tableNames = rows.map(row => `"${row.tablename}"`)
  }
  return tableNames
}

/**
 * Empties every application table (keeps the migration bookkeeping table) and resets id sequences.
 */
const cleanDatabase = async () => {
  const tables = await getTableNames()
  if (tables.length > 0) {
    await db.sequelize.query(`TRUNCATE TABLE ${tables.join(', ')} RESTART IDENTITY CASCADE`)
  }
}

const closeDatabase = () => db.sequelize.close()

/**
 * Some controllers respond before their DB writes finish (fire-and-forget updates).
 * Retries the assertion function until it passes or the timeout runs out.
 */
const eventually = async (assertion, { timeout = 3000, interval = 50 } = {}) => {
  const deadline = Date.now() + timeout
  for (;;) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await assertion()
    } catch (error) {
      if (Date.now() > deadline) throw error
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }
}

module.exports = {
  db,
  cleanDatabase,
  closeDatabase,
  eventually
}
