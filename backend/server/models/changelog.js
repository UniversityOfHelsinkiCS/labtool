module.exports = (sequelize, DataTypes) => {
  // A change to a student's grading or repository link (#1129, #1132); see helpers/changeLog.js.
  const ChangeLog = sequelize.define(
    'ChangeLog',
    {
      kind: { type: DataTypes.STRING, allowNull: false },
      number: { type: DataTypes.INTEGER, allowNull: true },
      changes: { type: DataTypes.JSONB, allowNull: false }
    },
    {}
  )
  ChangeLog.associate = (models) => {
    ChangeLog.belongsTo(models.CourseInstance, { foreignKey: 'courseInstanceId', onDelete: 'CASCADE' })
    ChangeLog.belongsTo(models.StudentInstance, { foreignKey: 'studentInstanceId', onDelete: 'CASCADE' })
    ChangeLog.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'SET NULL' })
  }
  return ChangeLog
}
