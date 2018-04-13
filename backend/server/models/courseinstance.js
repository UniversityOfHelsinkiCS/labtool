module.exports = (sequelize, DataTypes) => {
  const CourseInstance = sequelize.define('CourseInstance', {
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    active: DataTypes.BOOLEAN,
    weekAmount: DataTypes.INTEGER,
    weekMaxPoints: DataTypes.INTEGER,
    currentWeek: DataTypes.INTEGER,
    ohid: DataTypes.STRING
  }, {})
  CourseInstance.associate = (models) => {
    CourseInstance.hasMany(models.StudentInstance, {
      foreignKey: 'courseInstanceId',
      as: 'courseInstances'
    })

  }

  // example of a prototype function 
  CourseInstance.prototype.getUserInstance = async function (chid, uid) {
    try {
      const shite = await CourseInstance.findOne({
        where: {
          ohid: chid
        }
      })
      let shit = []
      const dog = await require('../models').TeacherInstance
      const dwag = await new dog()
      let ohshit = await dwag.getUserCourses(shite.dataValues.id, uid, shit)
      await shit.push({course: Object.assign(shite.toJSON(), JSON.parse(JSON.stringify(ohshit)))})

      await console.log(shit)
      return shit

    } catch (eeeeeeeeeeeeee) {
      console.log(eeeeeeeeeeeeee)
    }
  }
}

  return CourseInstance
}