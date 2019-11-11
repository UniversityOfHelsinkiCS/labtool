module.exports = (sequelize, DataTypes) => {
  const Week = sequelize.define(
    'Week',
    {
      points: DataTypes.DOUBLE,
      weekNumber: DataTypes.INTEGER,
      feedback: DataTypes.STRING,
      instructorNotes: DataTypes.STRING,
      notified: DataTypes.BOOLEAN
    },
    {}
  )
  Week.associate = (models) => {
    Week.belongsTo(models.StudentInstance, {
      foreignKey: 'studentInstanceId',
      onDelete: 'CASCADE'
    })
    Week.hasMany(models.Comment, {
      foreignKey: 'weekId',
      as: 'comments'
    })
    Week.hasMany(models.ReviewCheck, {
      foreignKey: 'weekId',
      as: 'checks',
      allowNull: true
    })
  }
  return Week
}
