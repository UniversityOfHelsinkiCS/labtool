module.exports = (sequelize, DataTypes) => {
  const Week = sequelize.define('Week', {
    points: DataTypes.INTEGER,
    comment: DataTypes.STRING,
    weekNumber: DataTypes.INTEGER
  }, {})
  Week.associate = (models) => {

    Week.belongsTo(models.StudentInstance, {
      foreignKey: 'studentInstanceId',
      onDelete: 'CASCADE',
    })
  }
  return Week
}