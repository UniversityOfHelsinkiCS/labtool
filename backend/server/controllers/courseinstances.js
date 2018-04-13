//import Course from '../../../labtool2.0/src/components/pages/Course';

//import Course from '../../../labtool2.0/src/components/pages/Course';
const db = require('../models')
const CourseInstance = require('../models').CourseInstance
const StudentInstance = require('../models').StudentInstance
const TeacherInstance = require('../models').TeacherInstance
const User = require('../models').User
const helper = require('../helpers/course_instance_helper')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const StudentInstanceController = require('../controllers').studentInstances
const TeacherInstance = require('../models').TeacherInstance
const Week = require('../models').Week


module.exports = {


  //TODO: search courseInstance where it is connected to user either by studentIstance or teacherInstance
  findByUserTeacherInstance(req, res) {//token verification might not work..? and we don't knpw if search works
    const errors = []
    console.log('***REQ BODY***: ', req.body)
    let token = helper.tokenVerify(req)
    const id = parseInt(req.body.userId)//TODO: CHECK THAT THIS IS SANITICED ID
    console.log('TOKEN VERIFIED: ', token)
    console.log('req.params.UserId: ', parseInt(req.body.userId))
    if (token.verified) {
      db.sequelize.queryeacherInstanceController(`SELECT * FROM "CourseInstances" AS CI JOIN "TeacherInstances" AS TI ON CI.id = TI.courseInstanceId WHERE TI."userId" = ${token.data.id}`)
        .then(instance =>
          res.status(200).send(instance[0]))
        .catch(error => res.status(400).send(error))
    } else {
      errors.push('token verification failed')
      res.status(400).send(errors)
    }

  },
  /** */
  async coursePage(req, res) {

    const courseInst = req.body.course
    const token = helper.tokenVerify(req)

    const palautus = {
      role: "Unregistered",
      data: undefined
    }

    if (token.verified) {
      const user = token.data.id
      const teacher = await TeacherInstance.findAll({
        where: {
          userId: user,
          courseInstanceId: courseInst
        }
      })

      if (teacher[0] === undefined) {
        console.log('TYHJÄ!')
        const student = await StudentInstance.findAll({
          where: {
            userId: user,
            courseInstanceId: courseInst
          },
          include: [{
            model: Week, as: 'weeks'
          }]
        })
        try {
          palautus.data = student
          palautus.role = "student"
          res.status(200).send(palautus)
        } catch (error) {
          res.status(400).send(error)
        }
        res.status(200).send(student)
      } else {
        console.log('EI OLE TYHJÄ JEE')
        const teacherPalautus = await StudentInstance.findAll({
          where: {
            courseInstanceId: courseInst
          },
          include: [{
            model: Week, as: 'weeks'
          }]
        })
        try {
          palautus.data = teacherPalautus
          palautus.role = "teacher"
          res.status(200).send(palautus)
        } catch (e) {
          res.status(200).send(e)
        }
      }
    } else {
      res.status(400).send("something went wrong")
    }




    //console.log('teacher[0]: ', teacher[0])
    /*     const teacher = TeacherInstanceController.retrieve(request, res)
     */   // console.log('teacher: ', teacher)
  },
  /**
   * sequelize.query("SELECT * FROM 'property'", { type:Sequelize.QueryTypes.SELECT})
   .then(function(properties) {
      res.json(properties)
  })
   */
  findByUserStudentInstance(req, res) {//token verification might not work..? and we don't knpw if search works
    console.log('db: ', db)
    const errors = []
    console.log('searching by studentInstance...')
    console.log('***REQ BODY***: ', req.body)
    let token = helper.tokenVerify(req)
    console.log('TOKEN VERIFIED: ', token)
    const id = parseInt(req.body.userId)
    console.log('req.params.UserId: ', id)
    /*CourseInstance.findAll({
      include:[{
        model: StudentInstance,
      }],
      where: {userId: id},
      logging: console.log
    })*/
    //	SELECT * FROM "CourseInstances" AS CI JOIN "StudentInstances" AS SI ON CI.id = SI.id WHERE SI."userId" = 1;
    if (token.verified) {
      if (Number.isInteger(token.data.id)) {
        db.sequelize.query(`SELECT * FROM "CourseInstances" AS CI JOIN "StudentInstances" AS SI ON CI.id = SI.courseInstanceId WHERE SI."userId" = ${token.data.id}`)
          .then(instance =>
            res.status(200).send(instance[0]))
          .catch(error => res.status(400).send(error))
      } else {
        errros.push('something went wrong')
        res.status(400).send(errors)
      }
    } else {
      errors.push('token verification failed')
      res.status(400).send(errors)
    }
    // db.sequelize.query(`SELECT * FROM "CourseInstances" AS CI JOIN "StudentInstances" AS SI ON CI.id = SI.id WHERE SI."userId" = ${id}`)
    //   // CourseInstance.findAll({
    //   //   include: [{
    //   //     model: StudentInstance,
    //   //   }],
    //   //   where: {
    //   //     userid: {
    //   //       [Op.eq]: id
    //   //     }
    //   //   }
    //   // })
    //   .then(instance =>
    //     res.status(200).send(instance))
    //   .catch(error => res.status(400).send(error))

  },

  registerToCourseInstance(req, res) {
    const errors = []
    if (req.authenticated.success == false) {
      res.send(401)
      res.end
    }

    CourseInstance.findOne({
      where: {
        ohid: req.params.ohid
      }
    })
      .then(course => {
        if (!course) {
          return res.status(400).send({
            message: 'course instance not found',
          })
        }
        User.findById(req.decoded.id).then(user => {
          if (!user) {
            return res.status(400).send({
              message: 'something went wrong (clear these specific error messages later): user not found',
            })
          }
          let thisPromiseJustMakesThisCodeEvenMoreHorrible = new Promise((resolve, reject) => {
            helper.checkWebOodi(req, res, user, resolve)  // this does not work.

            setTimeout(function () {
              resolve('shitaintright') // Yay! everything went to hell.
            }, 5000)  // set a high timeout value since you really want to wait x)
          })

          thisPromiseJustMakesThisCodeEvenMoreHorrible.then((successMessageIfYouLikeToThinkThat) => {
            console.log('Yay! ' + successMessageIfYouLikeToThinkThat)
            console.log(req.body)

            if (successMessageIfYouLikeToThinkThat === 'found') {
              StudentInstance.findOrCreate({
                where: {
                  userId: user.id,
                  courseInstanceId: course.dataValues.id
                },
                defaults: {
                  userId: user.id,
                  courseInstanceId: course.dataValues.id,
                  github: req.body.github || '',                     // model would like to validate this to be an URL but seems like crap
                  projectName: req.body.projectName || '',           // model would like to validate this to alphanumeric but seems like this needs specific nulls or empties or whatever
                }
              }).then(student => {
                if (!student) {
                  res.status(400).send({
                    message: 'something went wrong: if somehow we could not find or create a record we see this'
                  })
                } else {
                  res.status(200).send({
                    message: 'something went right',
                    whatever: student
                  })
                }

              }).catch(function (error) {
                res.status(400).send({
                  message: error.errors
                })
              })

            } else {

              res.status(400).send({
                message: 'something went wrong'
              })

            }
          })

        })
      })
  },

  async update(req, res) {
    console.log('REQ body: ', req.body)
    console.log('REQ params: ', req.params)
    try {
      let ci = await CourseInstance.find({
        where: {
          ohid: req.params.ohid
        }
      })

      console.log('getting token')

      let token = helper.tokenVerify(req)


      console.log('got token')

      const TI = await TeacherInstance.findOne({
        where: {
          courseInstanceId: ci.id,
          userId: token.data.id
        }
      })

      console.log('got TI')

      if (TI) {

        console.log("Grats you are teacher")

        const updated = await ci.update({
          name: req.body.name || ci.name,
          start: req.body.start || ci.start,
          end: req.body.end || ci.end,
          active: true,
          weekAmount: req.body.weekAmount || ci.weekAmount,
          weekMaxPoints: req.body.weekMaxpoints || ci.weekMaxPoints,
          currentWeek: req.body.currentWeek || ci.currentWeek,
        })

        res.status(200).send(updated)
      } else {
        res.status(400).send('error')
      }

      


    } catch (error) {
      console.log('Always errors')
      res.status(400).send(error)
    }
  },

  list(req, res) {
    return CourseInstance.findAll()
      .then(instance => res.status(200).send(instance))
      .catch(error => res.status(400).send(error))
  },

  retrieve(req, res) {
    const errors = []
    CourseInstance
      .find({
        where: {
          ohid: req.params.ohid
        }
      }, {})
      .then(courseInstance => {
        if (!courseInstance) {
          return res.status(404).send({
            message: 'Course not Found',
          })
        }
        return res.status(200).send(courseInstance)
      })
      .catch(error => res.status(400).send(error))

  },

  getNew(req, res) {
    console.log('update current...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    console.log('autentikaatio: ', auth)
    const termAndYear = helper.CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.1') {
        res.send('gtfo')

      } else {
        const request = require('request')
        const options = {
          method: 'get',
          uri: `https://opetushallinto.cs.helsinki.fi/labtool/courses?year=${termAndYear.currentYear}&term=${termAndYear.currentTerm}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          strictSSL: false
        }
        request(options, function (err, resp, body) {
          const json = JSON.parse(body)
          console.log('json palautta...')
          console.log(json)
          json.forEach(instance => {
            CourseInstance.findOrCreate({
              where: { ohid: instance.id },
              defaults: {
                name: instance.name,
                start: instance.starts,
                end: instance.ends,
                ohid: instance.id
              }
            })
          })
          if (req.decoded) {
            res.status(204).send({ 'hello': 'hello' }) // nodejs crashes if someone just posts here without valid token.
          }
        }
        )
      }
    }
  }
  ,

  getNewer(req, res) {
    console.log('update next...')
    const auth = process.env.TOKEN || 'notset' //You have to set TOKEN in .env file in order for this to work
    const termAndYear = helper.CurrentTermAndYear()
    console.log('term and year: ', termAndYear)
    if (auth === 'notset') {
      res.send('Please restart the backend with the correct TOKEN environment variable set')
    } else {
      if (this.remoteAddress === '127.0.0.1') {
        res.send('gtfo')

      } else {

        const request = require('request')
        const options = {
          method: 'get',
          uri: `https://opetushallinto.cs.helsinki.fi/labtool/courses?year=${termAndYear.nextYear}&term=${termAndYear.nextTerm}`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          strictSSL: false
        }
        request(options, function (err, resp, body) {
          const json = JSON.parse(body)
          console.log(json)
          json.forEach(instance => {
            CourseInstance.findOrCreate({
              where: { ohid: instance.id },
              defaults: {
                name: instance.name,
                start: instance.starts,
                end: instance.ends,
                ohid: instance.id
              }
            })
          })
          if (req.decoded) {
            res.status(204).send({ 'hello': 'hello' })  // nodejs crashes if someone just posts here without valid token.
          }
        })
      }
    }
  },

  retrieveCourseStuff(req, res) {
    return CourseInstance
      .findOne({
        where: {
          ohid: req.params.ohid
        },
      })
      .then(course => {
        if (!course) {
          return res.status(404).send({
            message: 'Course not Found',
          })
        }
        return res.status(200).send(course)
      })
      .catch(error => res.status(400).send(error))
  },

}