module.exports = (sequelize, DataTypes) => {
  const CourseInstance = sequelize.define(
    'CourseInstance',
    {
      name: DataTypes.STRING,
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      active: DataTypes.BOOLEAN,
      weekAmount: DataTypes.INTEGER,
      weekMaxPoints: DataTypes.DOUBLE,
      currentWeek: DataTypes.INTEGER,
      currentCodeReview: DataTypes.INTEGER,
      codeReviewActive: DataTypes.BOOLEAN,
      ohid: DataTypes.STRING
    },
    {}
  )
  CourseInstance.associate = models => {
    CourseInstance.hasMany(models.StudentInstance, {
      foreignKey: 'courseInstanceId',
      as: 'courseInstances'
    })
    CourseInstance.hasMany(models.Checklist, {
      foreignKey: 'courseInstanceId',
      as: 'checklists'
    })
  }

  return CourseInstance
}
