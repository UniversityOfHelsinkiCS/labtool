module.exports = (sequelize, DataTypes) => {
  var Users = sequelize.define('Users', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    firsts: DataTypes.STRING,
    lastname: DataTypes.STRING,
    token: DataTypes.STRING
  }, {})
  Users.associate = (models) => {
    Users.hasMany(models.Course_instances_students_users, {
      foreignKey: 'userId',
      as: 'course_instances_students_users'
    })
  }
  return Users
}