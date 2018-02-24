'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    firsts: DataTypes.STRING,
    lastname: DataTypes.STRING,
    token: DataTypes.STRING
  }, {});
  User.associate = (models) => {
    User.hasMany(models.StudentInstance, {
      foreignKey: 'userId',
      as: 'users'
    })
  }
  return User;
};