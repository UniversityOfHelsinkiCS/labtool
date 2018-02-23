const CourseInstanceStudentUser = require('../models').Course_instances_students_users

module.exports = {
    create(req, res) {
        return CourseInstanceStudentUser
            .create({
                usersId: req.body.usersId,
                course_instancesId: req.body.course_instancesId
            })
    },
    list(req, res) {
        return CourseInstanceStudentUser
            .findAll({})
            .then(course => res.status(200).send(course))
            .catch(error => res.status(400).send(error))
    }
}