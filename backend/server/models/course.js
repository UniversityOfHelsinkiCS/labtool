module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    name: DataTypes.STRING,
    label: DataTypes.STRING
  })
  Course.associate = (models) => {
    Course.hasMany(models.CourseInstance, {
      foreignKey: 'courseId',
      as: 'courseInstances'
    })
  }
  return Course
}