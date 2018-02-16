'use strict';
module.exports = (sequelize, DataTypes) => {
  var Course_instances = sequelize.define('Course_instances', {
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    active: DataTypes.BOOLEAN,
    week_amount: DataTypes.INTEGER,
    week_max_points: DataTypes.INTEGER,
    current_week: DataTypes.INTEGER
  }, {});
  Course_instances.associate = function(models) {
    // associations can be defined here
    Course_instances.belongsTo(models.Course,{
      foeignKey: 'courseId',
      onDelete: 'CASCADE',
    })
  };
  return Course_instances;
};