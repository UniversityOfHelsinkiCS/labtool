'use strict'
module.exports = (sequelize, DataTypes) => {
  var StudentInstance = sequelize.define('StudentInstance', {
    github: DataTypes.STRING,
    projectName: DataTypes.STRING
  }, {})
  StudentInstance.associate = (models) => {

    StudentInstance.hasMany(models.Week, {
      foreignKey: 'studentInstanceId',
      as: 'studentInstances'
    })

    StudentInstance.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })

    StudentInstance.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })
  }

  return StudentInstance
}