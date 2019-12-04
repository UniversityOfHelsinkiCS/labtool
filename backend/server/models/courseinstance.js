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
      currentCodeReview: DataTypes.ARRAY(DataTypes.INTEGER),
      codeReviewActive: DataTypes.BOOLEAN,
      amountOfCodeReviews: DataTypes.INTEGER,
      ohid: DataTypes.STRING,
      finalReview: DataTypes.BOOLEAN,
      coursesPage: DataTypes.STRING,
      courseMaterial: DataTypes.STRING,
      finalReviewHasPoints: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {}
  )
  CourseInstance.associate = (models) => {
    CourseInstance.hasMany(models.StudentInstance, {
      foreignKey: 'courseInstanceId',
      as: 'courseInstances'
    })
    CourseInstance.hasMany(models.TeacherInstance, {
      foreignKey: 'courseInstanceId',
      as: 'teachercourseInstances'
    })
    CourseInstance.hasMany(models.Checklist, {
      foreignKey: 'courseInstanceId',
      as: 'checklists'
    })
  }

  return CourseInstance
}
