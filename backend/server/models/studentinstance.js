module.exports = (sequelize, DataTypes) => {
  const StudentInstance = sequelize.define('StudentInstance', {
    github: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: {msg: 'not a valid url'}
      }
    },
    projectName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlphanumeric: {msg: 'projectName not accepted'}
      }
    }
  }, {})
  StudentInstance.associate = (models) => {

    StudentInstance.hasMany(models.Week, {
      foreignKey: 'studentInstanceId',
      as: 'weeks'
    })

    StudentInstance.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    })

    StudentInstance.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })
  }

  return StudentInstance
}
