'use strict'
module.exports = (sequelize, DataTypes) => {
  var TeacherInstance = sequelize.define('TeacherInstance', {}, {})
  TeacherInstance.associate = (models) => {


    TeacherInstance.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })

    TeacherInstance.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })
  }

  return TeacherInstance
  // associations can be defined here
}