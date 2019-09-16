module.exports = (sequelize, DataTypes) => {
  const StudentInstance = sequelize.define(
    'StudentInstance',
    {
      github: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: { msg: 'not a valid url' }
        }
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: ['^[a-zåäöA-ZÅÄÖ\'\\-0-9]+( [a-zåäöA-ZÅÄÖ\'\\-0-9]+)*$']
        }
      },
      dropped: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {}
  )
  StudentInstance.associate = (models) => {
    StudentInstance.hasMany(models.Week, {
      foreignKey: 'studentInstanceId',
      as: 'weeks'
    })

    StudentInstance.hasMany(models.CodeReview, {
      foreignKey: 'studentInstanceId',
      as: 'codeReviews'
    })

    StudentInstance.hasMany(models.CodeReview, {
      foreignKey: 'toReview',
      as: 'toReviews'
    })

    StudentInstance.belongsToMany(models.Tag, {
      through: 'StudentTag',
      foreignKey: 'studentInstanceId'
    })

    StudentInstance.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    })

    StudentInstance.belongsTo(models.CourseInstance, {
      foreignKey: 'courseInstanceId',
      onDelete: 'CASCADE'
    })

    StudentInstance.belongsTo(models.TeacherInstance, {
      foreignKey: 'teacherInstanceId'
    })
  }

  return StudentInstance
}
