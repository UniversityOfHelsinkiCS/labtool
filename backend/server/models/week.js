module.exports = (sequelize, DataTypes) => {
  const Week = sequelize.define(
    'Week',
    {
      points: DataTypes.DOUBLE,
      weekNumber: DataTypes.INTEGER,
      feedback: DataTypes.STRING
    },
    {}
  )
  Week.associate = models => {
    Week.belongsTo(models.StudentInstance, {
      foreignKey: 'studentInstanceId',
      onDelete: 'CASCADE'
    })
    Week.hasMany(models.Comment, {
      foreignKey: 'weekId',
      as: 'comments'
    })
  }
  return Week
}
