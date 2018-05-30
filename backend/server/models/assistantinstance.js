module.exports = (sequelize, DataTypes) => {
  const AssistantInstance = sequelize.define('AssistantInstance', {})
  AssistantInstance.associate = models => {
    AssistantInstance.belongsTo(models.TeacherInstance, {
      foreignKey: 'teacherInstanceId',
      onDelete: 'CASCADE'
    })

    AssistantInstance.belongsTo(models.StudentInstance, {
      foreignKey: 'studentInstanceId',
      onDelete: 'CASCADE'
    })
  }

  return AssistantInstance
  // associations can be defined here
}
