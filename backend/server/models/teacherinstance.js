'use strict'
module.exports = (sequelize, DataTypes) => {
  var TeacherInstance = sequelize.define('TeacherInstance', {}, {})
  TeacherInstance.associate = function (models) {

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
    // associations can be defined here
  }
  return TeacherInstance
}