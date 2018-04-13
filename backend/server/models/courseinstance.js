const TeacherInstance = require('../models').TeacherInstance

module.exports = (sequelize, DataTypes) => {
  const CourseInstance = sequelize.define('CourseInstance', {
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    active: DataTypes.BOOLEAN,
    weekAmount: DataTypes.INTEGER,
    weekMaxPoints: DataTypes.DOUBLE,
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
  CourseInstance.prototype.isTeacher = async function (ciid, uid) {
    try {
      const TI = await TeacherInstance.findOne({
        where: {
          courseInstanceId: ciid,
          userId: uid
        }
      })
      if (TI) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log(e)
      return false
    }
  }
  return CourseInstance
}