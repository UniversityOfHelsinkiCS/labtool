module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    name: DataTypes.STRING,
    label: DataTypes.STRING
  });
  Course.associate = (models) => {
    Course.hasMany(models.Course_instances, {
      foreignKey: 'courseId',
      as: 'course_instances'
    })
  };
  return Course;
};