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
      ohid: DataTypes.STRING
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
