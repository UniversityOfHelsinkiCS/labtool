
module.exports = (sequelize, DataTypes) => {
  const Checklist = sequelize.define(
    'Checklist',
    {
      week: DataTypes.INTEGER,
      courseName: DataTypes.STRING,
      master: DataTypes.BOOLEAN,
      maxPoints: DataTypes.DOUBLE
    },
    /*{
      hooks: {
        // This will automatically destroy any pre-existing row before inserting to avoid duplicates.
        // Updating happens by destroying the old, then inserting the new.
        beforeCreate: (newChecklist, _options) => {
          Checklist.destroy({
            where: {
              courseInstanceId: newChecklist.courseInstanceId,
              week: newChecklist.week,
              master: false
            }
          })
        }
      }
    }*/
  )
  Checklist.associate = function (models) {
    Checklist.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })
  }
  return Checklist
}
