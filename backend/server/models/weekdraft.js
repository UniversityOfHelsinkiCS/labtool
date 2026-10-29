module.exports = (sequelize, DataTypes) => {
  const WeekDraft = sequelize.define(
    'WeekDraft',
    {
      weekNumber: DataTypes.INTEGER,
      data: DataTypes.JSONB,
      // user who saved the draft last
      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
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
