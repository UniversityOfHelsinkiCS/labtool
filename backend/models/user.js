'use strict'


module.exports = (sequelize, DataTypes) => {
  let user = sequelize.define('User', {
    username: DataTypes.STRING,
    firsts: DataTypes.STRING,
    lastname: DataTypes.STRING,
    studentnumber: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        // associations can be defined here
      }
    }
  })
  return user
}