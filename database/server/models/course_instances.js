module.exports = (sequelize, DataTypes) => {
  const courseInst = sequelize.define('Course_instances', {
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
  courseInst.associate = (models) => {

    courseInst.belongsTo(models.Course, {
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
    })

    courseInst.hasMany(models.Course_instances_students_users, {
      foreignKey: 'course_instancesId',
      as: 'course_instances_students_usersItems'
    })
  }

  return courseInst
}