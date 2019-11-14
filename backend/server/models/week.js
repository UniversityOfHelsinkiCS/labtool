module.exports = (sequelize, DataTypes) => {
  const Week = sequelize.define(
    'Week',
    {
      points: DataTypes.DOUBLE,
      weekNumber: DataTypes.INTEGER,
      feedback: DataTypes.TEXT,
      instructorNotes: DataTypes.TEXT,
      notified: DataTypes.BOOLEAN,
      checks: DataTypes.JSONB
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
  }
  return Week
}
