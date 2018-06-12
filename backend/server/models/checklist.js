'use strict'
module.exports = (sequelize, DataTypes) => {
  var Checklist = sequelize.define(
    'Checklist',
    {
      week: DataTypes.INTEGER,
      list: DataTypes.JSONB,
      courseName: DataTypes.STRING,
      master: DataTypes.BOOLEAN
    },
    {
      hooks: {
        // This will automatically destroy any pre-existing row before inserting to avoid duplicates.
        // Updating happens by destroying the old, then inserting the new.
        beforeCreate: (newChecklist, options) => {
          Checklist.destroy({
            where: {
              courseInstanceId: newChecklist.courseInstanceId,
              week: newChecklist.week,
              master: false
            }
          })
        }
      }
    }
  )
  Checklist.associate = function(models) {
    Checklist.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })
  }
  return Checklist
}
