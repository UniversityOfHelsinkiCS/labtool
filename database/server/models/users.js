'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define('users', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    firsts: DataTypes.STRING,
    lastname: DataTypes.STRING,
    token: DataTypes.STRING
  }, {});
  users.associate = function(models) {
    // associations can be defined here
  };
  return users;
};