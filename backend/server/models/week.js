module.exports = (sequelize, DataTypes) => {
  const Week = sequelize.define(
    'Week',
    {
      points: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      grade: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      weekNumber: DataTypes.INTEGER,
      feedback: DataTypes.TEXT,
      instructorNotes: DataTypes.TEXT,
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
