'use strict';
module.exports = (sequelize, DataTypes) => {
  var week = sequelize.define('week', {
    points: DataTypes.INTEGER
  }, {});
  week.associate = function(models) {
    // associations can be defined here
  };
  return week;
};