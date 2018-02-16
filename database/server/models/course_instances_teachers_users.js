'use strict';
module.exports = (sequelize, DataTypes) => {
  var course_instances_teachers_users = sequelize.define('course_instances_teachers_users', {}, {});
  course_instances_teachers_users.associate = function(models) {
    // associations can be defined here
  };
  return course_instances_teachers_users;
};