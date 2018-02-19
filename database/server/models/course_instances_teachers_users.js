'use strict'
module.exports = (sequelize, DataTypes) => {
  var Course_instances_teachers_users = sequelize.define('Course_instances_teachers_users', {}, {})
  Course_instances_teachers_users.associate = function(models) {
    // associations can be defined here
  }
  return Course_instances_teachers_users
}