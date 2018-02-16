'use strict';
module.exports = (sequelize, DataTypes) => {
  var course = sequelize.define('course', {
    name: DataTypes.STRING,
    label: DataTypes.STRING
  }, {});
  course.associate = function (models) {
    // associations can be defined here
    course.hasMany(models.course_instances, {
      foreignKey: 'courseId',
      as: 'course_instances',
    })
  };
  return course;
};