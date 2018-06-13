'use strict'
module.exports = (sequelize, DataTypes) => {
  const StudentTag = sequelize.define(
    'StudentTag',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      studentInstanceId: DataTypes.INTEGER,
      tagId: DataTypes.INTEGER
    },
    {}
  )
  return StudentTag
}
