module.exports = (sequelize, DataTypes) => {
  const TeacherInstance = sequelize.define(
    'TeacherInstance',
    {
      admin: {
        type: DataTypes.BOOLEAN
      }
    },
    {}
  )
  TeacherInstance.associate = models => {
    TeacherInstance.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })

    TeacherInstance.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })

    TeacherInstance.hasMany(models.AssistantInstance, {
      foreignKey: 'teacherInstanceId'
    })
  }

  return TeacherInstance
  // associations can be defined here
}
