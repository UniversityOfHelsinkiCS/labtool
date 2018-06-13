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
    {}
  )
  Checklist.associate = function(models) {
    Checklist.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })
  }
  return Checklist
}
