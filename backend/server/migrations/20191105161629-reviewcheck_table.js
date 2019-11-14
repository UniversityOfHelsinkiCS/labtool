

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('ReviewChecks', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        checklistItemId: {
          type: Sequelize.INTEGER
        },
        checked: {
          type: Sequelize.BOOLEAN
        },
        weekId: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          allowNull: true,
          references: {
            model: 'Weeks',
            key: 'id',
            as: 'weekId'
          }
        }
      })

      const weeks = await queryInterface.sequelize.query('SELECT "id", "checks", "weekNumber", "studentInstanceId" FROM "Weeks"', { type: queryInterface.sequelize.QueryTypes.SELECT })
      await Promise.all(weeks.map((week) => {
        if (!week.checks) {
          return Promise.resolve()
        }

        return Promise.all(Object.keys(week.checks).map((check) => {
          if (Number.isInteger(Number(check))) {
            return queryInterface.sequelize.query(`INSERT INTO "ReviewChecks" ("checklistItemId", "checked", "weekId") VALUES (${Number(check)}, ${week.checks[check]}, ${week.id})`)
          }
          return async () => {
            const ids = await queryInterface.sequelize.query(`SELECT cli.id AS id FROM "ChecklistItems" AS cli, "Checklists" AS cl, "CourseInstances" AS ci, "StudentInstances" as si, "Weeks" as week WHERE cli."name" = '${check}' AND cli."checklistId" = cl.id AND cl."courseInstanceId" = ci.id AND si."courseInstanceId" = ci.id AND week."studentInstanceId" = si.id AND week.id = ${week.id}`, { type: queryInterface.sequelize.QueryTypes.SELECT })
            if (ids.length !== 1) {
              console.log(`Failed to find checklist item for ${check} (week id: ${week.weekId})`)
              return
            }
            await queryInterface.sequelize.query(`INSERT INTO "ReviewChecks" ("checklistId", "checked", "weekId") VALUES (${ids[0].id}, ${week.checks[check]}, ${week.id})`)
          }
        }))
      }))

      await queryInterface.removeColumn('Weeks', 'checks')

      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Weeks', 'checks', {
        type: Sequelize.JSONB
      })

      const promises = []

      const checks = await queryInterface.sequelize.query('SELECT * FROM "ReviewChecks"', { type: queryInterface.sequelize.QueryTypes.SELECT })
      const checksByWeek = groupBy(checks, 'weekId')
      checksByWeek.forEach((checks, weekId) => {
        const checksObject = {}
        checks.forEach((check) => {
          checksObject[check.id] = check.checked
        })
        promises.push(queryInterface.sequelize.query(`UPDATE "Weeks" SET "checks"='${JSON.stringify(checksObject)}' WHERE id=${weekId}`))
      })

      await Promise.all(promises)

      await queryInterface.dropTable('ReviewChecks')

      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

const groupBy = (array, key) => {
  const map = new Map()
  array.forEach((object) => {
    const value = object[key]
    const array = map.has(value) ? map.get(value) : []
    map.set(value, array.concat(object))
  })
  return map
}
