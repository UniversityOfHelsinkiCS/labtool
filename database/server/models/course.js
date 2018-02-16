'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course = sequelize.define('Course', {
    name: DataTypes.STRING,
    label: DataTypes.STRING
  }, {});
  Course.associate = function(models) {
    // associations can be defined here
    Course.hasMany(models.Course_instances,{
      foreignKey: 'courseId',
      as: 'course_instances'
    })
  };
  return Course;
};