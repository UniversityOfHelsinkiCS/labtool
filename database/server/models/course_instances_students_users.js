'use strict';
module.exports = (sequelize, DataTypes) => {
  var course_instances_students_users = sequelize.define('course_instances_students_users', {}, {});
  course_instances_students_users.associate = function(models) {
    // associations can be defined here
  };
  return course_instances_students_users;
};