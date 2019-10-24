'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      //Create table for checklist items
      await queryInterface.createTable('ChecklistItems', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        textWhenOff: {
          type: Sequelize.STRING
        },
        textWhenOn: {
          type: Sequelize.STRING
        },
        checkedPoints: {
          type: Sequelize.DOUBLE
        },
        uncheckedPoints: {
          type: Sequelize.DOUBLE
        },
        category: {
          type: Sequelize.STRING
        },
        checklistId: {
          type: Sequelize.INTEGER,
          onDelete: 'CASCADE',
          references: {
            model: 'Checklists',
            key: 'id',
            as: 'checklistId'
          }
        }
      })

      //Migrate JSON format checklists to ChecklistItems table
      const lists = await queryInterface.sequelize.query(`SELECT id, list FROM "Checklists"`, { type: queryInterface.sequelize.QueryTypes.SELECT })
      await Promise.all(lists.map(list => {
        const checklistId = list.id
        const checklist = list.list

        return Promise.all(Object.keys(checklist).map(category => {
          return Promise.all(checklist[category].map(checklistItem => {
            return queryInterface.sequelize.query(`INSERT INTO "ChecklistItems" ("name", "textWhenOff", "textWhenOn", "checkedPoints", "uncheckedPoints", "category", "checklistId") VALUES ('${checklistItem.name}', '${checklistItem.textWhenOff}', '${checklistItem.textWhenOn}', ${checklistItem.checkedPoints}, ${checklistItem.uncheckedPoints}, '${category}', ${checklistId})`)
          }))
        }))
      }))

      //Remove list field from Checklist
      await queryInterface.removeColumn('Checklists', 'list')

      //Remove courseName field from Checklist
      await queryInterface.removeColumn('Checklists', 'courseName')

      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  },
  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('Checklists', 'courseName', {
        type: Sequelize.STRING
      })

      await queryInterface.addColumn('Checklists', 'list', {
        type: Sequelize.JSONB
      })

      const promises = []

      const allChecklistItems = await queryInterface.sequelize.query(`SELECT * FROM "ChecklistItems"`, { type: queryInterface.sequelize.QueryTypes.SELECT })
      const checklistItemsByChecklist = groupBy(allChecklistItems, 'checklistId')
      checklistItemsByChecklist.forEach((checklistItems, checklistId) => {
        const list = {}

        const checklistItemsByCategory = groupBy(checklistItems, 'category')
        checklistItemsByCategory.forEach((checklistItems, category) => {
          list[category] = checklistItems.map(checklistItem => {
            return { name: checklistItem.name, textWhenOff: checklistItem.textWhenOff, textWhenOn: checklistItem.textWhenOn, checkedPoints: checklistItem.checkedPoints, uncheckedPoints: checklistItem.uncheckedPoints }
          })
        })

        promises.push(queryInterface.sequelize.query(`UPDATE "Checklists" SET "list"='${JSON.stringify(list)}' WHERE id=${checklistId}`))
      })

      await Promise.all(promises)

      await queryInterface.dropTable("ChecklistItems")
      
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  }
};

const groupBy = (array, key) => {
  const map = new Map()
  array.forEach(object => {
    const value = object[key]
    const array = map.has(value) ? map.get(value) : []
    map.set(value, array.concat(object))
  })
  return map
}