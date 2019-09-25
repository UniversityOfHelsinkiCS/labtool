const helper = require('../helpers/checklist_helper')
const { TeacherInstance, Checklist } = require('../models')
const logger = require('../utils/logger')

module.exports = {
  async create(req, res) {
    await helper.controller_before_auth_check_action(req, res)
    try {
      if (!req.authenticated.success) {
        res.status(403).send('you have to be authenticated to do this')
        return
      }
      if (typeof req.body.week !== 'number' || typeof req.body.courseInstanceId !== 'number') {
        res.status(400).send('Missing or malformed inputs.')
        return
      }
      try {
        Object.keys(req.body.checklist).forEach((cl) => {
          if (!Array.isArray(req.body.checklist[cl])) {
            res.status(400).send('Supplied JSON should be an object with strings as keys and arrays as values.')
            return
          }
          req.body.checklist[cl].forEach((row) => {
            if (typeof row.name !== 'string') {
              res.status(400).send('All objects in array must have field "name" with string value.')
              return
            }
            if (typeof row.checkedPoints !== 'number') {
              res.status(400).send('All objects in array must have field "points when checked" with number value.')
              return
            }
            if (typeof row.uncheckedPoints !== 'number') {
              res.status(400).send('All objects in array must have field "points when unchecked" with number value.')
              return
            }
            Object.keys(row).forEach((key) => {
              switch (key) {
                case 'name':
                  break
                case 'checkedPoints':
                  break
                case 'uncheckedPoints':
                  break
                case 'textWhenOn':
                  if (typeof row[key] !== 'string') {
                    res.status(400).send('textWhenOn must have a string value or be undefined.')
                  }
                  break
                case 'textWhenOff':
                  if (typeof row[key] !== 'string') {
                    res.status(400).send('textWhenOff must have a string value or be undefined.')
                  }
                  break
                default:
                  res.status(400).send(`Found unexpected key: ${key}`)
              }
            })
          })
        })
      } catch (e) {
        res.status(400).send('Cannot parse checklist JSON.')
        return
      }
      const teacherInstance = await TeacherInstance.findOne({
        attributes: ['id'],
        where: {
          userId: req.decoded.id,
          courseInstanceId: req.body.courseInstanceId
        }
      })
      if (!teacherInstance) {
        res.status(403).send('You must be a teacher of the course to perform this action.')
        return
      }
      // No validation is done to prevent creating a checklist for a week that doesn't exist.
      // Arguably, this is a feature, since the number of weeks can change.
      const result = await Checklist.create({
        week: req.body.week,
        courseName: 'doot',
        list: req.body.checklist,
        courseInstanceId: req.body.courseInstanceId
      })
      res.status(200).send({
        message: `checklist saved successfully for week ${req.body.week}.`,
        result,
        data: req.body
      })
    } catch (e) {
      logger.error('checklist creation error', { error: e.message })
      res.status(500).send('Unexpected error')
    }
  },
  async getOne(req, res) {
    // There is no validation, since checklists are not secret/sensitive.
    try {
      if (typeof req.body.week !== 'number' || typeof req.body.courseInstanceId !== 'number') {
        res.status(400).send({
          message: 'Missing or malformed inputs.',
          data: req.body
        })
        return
      }
      const checklist = await Checklist.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        where: {
          courseInstanceId: req.body.courseInstanceId,
          week: req.body.week
        }
      })
      if (checklist) {
        res.status(200).send(checklist)
      } else {
        res.status(404).send({
          message: 'No matching checklist found.',
          data: req.body
        })
      }
    } catch (e) {
      logger.error('get checklist error', { error: e.message })
      res.status(500).send(e)
    }
  }
}
