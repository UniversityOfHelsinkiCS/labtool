module.exports = (sequelize, DataTypes) => {
  const Course_instances_students_users = sequelize.define('Course_instances_students_users', {}, {})

  Course_instances_students_users.associate = (models) => {

    Course_instances_students_users.belongsTo(models.Users, {
      foreignKey: 'usersId',
      onDelete: 'CASCADE'
    })

    Course_instances_students_users.belongsTo(models.Course_instances, {
      foreignKey: 'course_instanceId',
      onDelete: 'CASCADE'
    })
  }
  return Course_instances_students_users
}