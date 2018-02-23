module.exports = (sequelize, DataTypes) => {
  const Course_instances = sequelize.define('Course_instances', {
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    active: DataTypes.BOOLEAN,
    week_amount: DataTypes.INTEGER,
    week_max_points: DataTypes.INTEGER,
    current_week: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER,
    ohid: DataTypes.STRING
  })
  Course_instances.associate = (models) => {

    Course_instances.belongsTo(models.Course, {
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
    })

    Course_instances.hasMany(models.Course_instances_students_users, {
      foreignKey: 'course_instancesId',
      as: 'course_instances_students_usersItems'
    })
  }

  return Course_instances
}