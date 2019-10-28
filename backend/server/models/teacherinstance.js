module.exports = (sequelize, DataTypes) => {
  const TeacherInstance = sequelize.define(
    'TeacherInstance',
    {
      instructor: {
        type: DataTypes.BOOLEAN
      }
    },
    {}
  )
  TeacherInstance.associate = (models) => {
    TeacherInstance.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })

    TeacherInstance.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })

    TeacherInstance.hasMany(models.StudentInstance, {
      foreignKey: 'teacherInstanceId',
      as: 'students'
    })
  }

  return TeacherInstance
  // associations can be defined here
}
