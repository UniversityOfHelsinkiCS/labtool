// An additional review note on a final review, by course staff; never shown to students.
module.exports = (sequelize, DataTypes) => {
  const ReviewNote = sequelize.define('ReviewNote', {
    weekNumber: DataTypes.INTEGER,
    text: DataTypes.TEXT
  })
  ReviewNote.associate = (models) => {
    ReviewNote.belongsTo(models.StudentInstance, { foreignKey: 'studentInstanceId', onDelete: 'CASCADE' })
    ReviewNote.belongsTo(models.User, { foreignKey: 'userId' })
  }
  return ReviewNote
}
