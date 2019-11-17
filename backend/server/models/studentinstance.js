module.exports = (sequelize, DataTypes) => {
  const StudentInstance = sequelize.define(
    'StudentInstance',
    {
      github: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: { msg: 'GitHub link is not a valid URL.' },
          is: {
            args: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
            msg: 'GitHub link contains invalid characters.'
          }
        }
      },
      projectName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: /^[a-zåäöšžA-ZÅÄÖŠŽ\'\s0-9-]+$/gm
          }
        }
      },
      dropped: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      validRegistration: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      repoExists: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null
      },
      issuesDisabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null
      },
      issuesDisabledCheckedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
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

    StudentInstance.hasMany(models.WeekDraft, {
      foreignKey: 'studentInstanceId',
      as: 'weekdrafts'
    })
  }

  return StudentInstance
}
