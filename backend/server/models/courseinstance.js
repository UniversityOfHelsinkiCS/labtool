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
      ohid: DataTypes.STRING,
      amountOfCodeReviews: DataTypes.INTEGER
    },
    {}
  )
  CourseInstance.associate = models => {
    CourseInstance.hasMany(models.StudentInstance, {
      foreignKey: 'courseInstanceId',
      as: 'courseInstances'
    })
  }

  return CourseInstance
}
