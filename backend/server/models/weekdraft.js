module.exports = (sequelize, DataTypes) => {
  const WeekDraft = sequelize.define(
    'WeekDraft',
    {
      weekNumber: DataTypes.INTEGER,
      data: DataTypes.JSONB
    },
    {}
  )
  WeekDraft.associate = (models) => {
    WeekDraft.belongsTo(models.StudentInstance, {
      foreignKey: 'studentInstanceId',
      onDelete: 'CASCADE'
    })
  }
  return WeekDraft
}
