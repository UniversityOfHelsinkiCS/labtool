const {
  Tag, StudentTag, TeacherInstance, StudentInstance, CourseInstance, Week, User, Comment, CodeReview
} = require('../models')
const { isSysop, isCourseStaff, requireCourseStaff } = require('../helpers/auth')
const { badRequest, forbidden, notFound } = require('../utils/httpError')

/**
 * Global tags are shown on every course, so only sysops and teachers responsible for a course
 * (not assistants) may change or remove them.
 */
const canManageGlobalTags = async (userId) => {
  if (await isSysop(userId)) {
    return true
  }
  const responsibleTeacher = await TeacherInstance.findOne({ attributes: ['id'], where: { userId, instructor: false } })
  return !!responsibleTeacher
}

const withoutTimestamps = { exclude: ['createdAt', 'updatedAt'] }

/** The student with what the course page shows of it, sent after tagging or untagging. */
const findStudentWithTags = id => StudentInstance.findOne({
  where: { id },
  attributes: withoutTimestamps,
  include: [
    {
      model: Week,
      attributes: withoutTimestamps,
      as: 'weeks',
      include: [
        {
          model: Comment,
          attributes: withoutTimestamps,
          as: 'comments'
        }
      ]
    },
    {
      model: CodeReview,
      attributes: withoutTimestamps,
      as: 'codeReviews'
    },
    {
      model: User,
      attributes: withoutTimestamps
    },
    {
      model: Tag,
      attributes: ['id', 'name', 'color']
    }
  ]
})

/** The student of a tagging request, when the current user is staff on the student's course. */
const findStudentForStaff = async (req, notFoundMessage) => {
  if (!req.body.tagId) {
    throw badRequest('No tag selected.')
  }
  const id = Number(req.body.studentId)
  const student = Number.isInteger(id) ? await StudentInstance.findByPk(id) : null
  if (!student) {
    throw badRequest(notFoundMessage)
  }
  await requireCourseStaff(req, student.courseInstanceId, 'You have to be a teacher to do this.')
  return student
}

module.exports = {
  /**
   * Creates or edits a tag
   *   permissions: must be an instructor on any course for a new global tag,
   *     or on the specific course for a given course. Editing an existing tag also needs
   *     the rights to that tag: staff on its course, or canManageGlobalTags for a global tag.
   *
   * @param req
   * @param res
   */
  async createOrUpdate(req, res) {
    const isStaff = req.body.courseInstanceId
      ? await isCourseStaff(req.decoded.id, req.body.courseInstanceId)
      : (await TeacherInstance.count({ where: { userId: req.decoded.id } })) > 0
    if (!isStaff) {
      throw forbidden('You need to be a teacher or instructor to do this.')
    }

    const tag = {
      color: req.body.color || 'gray',
      name: typeof req.body.text === 'string' ? req.body.text.trim() : '',
      courseInstanceId: req.body.courseInstanceId || null
    }

    if (tag.name.length === 0) {
      throw badRequest('Tag name cannot be empty')
    }

    if (req.body.id) {
      const oldTag = await Tag.findOne({ where: { id: req.body.id } })
      if (!oldTag) {
        throw notFound('There is no tag with that ID.')
      }
      const mayEdit = oldTag.courseInstanceId === null
        ? await canManageGlobalTags(req.decoded.id)
        : await isCourseStaff(req.decoded.id, oldTag.courseInstanceId)
      if (!mayEdit) {
        throw forbidden(oldTag.courseInstanceId === null
          ? 'Only teachers responsible for a course can edit global tags.'
          : 'You need to be a teacher or instructor on the course of this tag.')
      }

      if (tag.courseInstanceId !== null && oldTag.courseInstanceId === null) {
        // if old tag was global, duplicate that tag to every other
        // course it was used in
        const studentTags = await StudentTag.findAll({
          where: {
            tagId: oldTag.id
          }
        })

        const students = await Promise.all(studentTags.map(st => StudentInstance.findByPk(st.studentInstanceId)))
        const studentsMap = {}
        students.forEach((student) => {
          studentsMap[student.id] = student
        })

        const courses = await Promise.all(students.map(student => CourseInstance.findByPk(student.courseInstanceId)))
        const uniqueCourseIds = [...new Set(courses.map(course => course.id))].filter(id => id !== tag.courseInstanceId)

        // go over StudentTag list by course instance ID
        await Promise.all(uniqueCourseIds.map(async (id) => {
          const theseStudentTags = studentTags.filter(st => studentsMap[st.studentInstanceId].courseInstanceId === id)
          if (theseStudentTags.length) {
            // copy the tag for this course, then
            const copyTag = await Tag.create({
              ...tag,
              courseInstanceId: id
            })

            // update all student tag instances
            await Promise.all(theseStudentTags.map(st => StudentTag.update(
              {
                tagId: copyTag.id
              },
              {
                where: {
                  id: st.id
                }
              }
            )
            ))
          }
        }))
      } else if (tag.courseInstanceId === null && oldTag.courseInstanceId !== null) {
        // converting to a global tag
        // if there already is a global tag with the same name and color,
        // merge the two tags (the existing global tag stays)

        const mergeTag = await Tag.findOne({ where: {
          name: tag.name,
          color: tag.color,
          courseInstanceId: null
        } })

        if (mergeTag) {
          await StudentTag.update(
            {
              tagId: mergeTag.id
            },
            {
              where: {
                tagId: oldTag.id
              }
            }
          )

          await oldTag.destroy()
          return res.status(200).send({
            id: mergeTag.id,
            name: mergeTag.name,
            color: mergeTag.color,
            courseInstanceId: null,
            deleteId: oldTag.id
          })
        }
      }
    }

    if (req.body.id) {
      const newTag = await Tag.update(
        tag,
        {
          where: {
            id: req.body.id
          },
          returning: true,
          plain: true
        }
      )
      return res.status(200).send(newTag[1].dataValues)
    }
    const existingTag = await Tag.findOne({
      where: {
        courseInstanceId: tag.courseInstanceId,
        name: tag.name
      }
    })
    if (existingTag) {
      throw badRequest(`Tag ${tag.name} already exists`)
    }
    const newTag = await Tag.create(tag)
    return res.status(200).send(newTag)
  },

  /**
   * Removes a tag
   *   permissions: canManageGlobalTags for a global tag,
   *     or an instructor on the specific course for a course tag
   *
   * @param req
   * @param res
   */
  async remove(req, res) {
    const tag = req.body.id ? await Tag.findOne({ where: { id: req.body.id } }) : null
    if (!tag) {
      throw notFound('There is no tag with that ID.')
    }

    if (tag.courseInstanceId === null) {
      if (!(await canManageGlobalTags(req.decoded.id))) {
        throw forbidden('Only teachers responsible for a course can remove global tags.')
      }
    } else {
      await requireCourseStaff(req, tag.courseInstanceId, 'You have to be a teacher or instructor to do this.')
    }

    const { id } = tag
    await tag.destroy()
    return res.status(200).send(id.toString())
  },

  /**
   * Get all tags
   *   permissions: any logged in user
   *
   * @param req
   * @param res
   */
  async getAll(req, res) {
    res.status(200).send(await Tag.findAll())
  },

  /**
   * Add tag to a student
   *   permissions: must be a teacher/instructor on the course of that student
   *
   * @param req
   * @param res
   */
  async addTagToStudentInstance(req, res) {
    const student = await findStudentForStaff(req, 'Did not found student with that ID.')

    const foundTag = await Tag.findByPk(req.body.tagId)
    if (!foundTag) {
      throw badRequest('Did not find a tag with that ID.')
    }
    // a course tag only goes to students of its course; global tags (courseInstanceId null) to anybody
    if (foundTag.courseInstanceId !== null && foundTag.courseInstanceId !== student.courseInstanceId) {
      throw badRequest('The tag is not a tag of the course of the student.')
    }

    await StudentTag.findOrCreate({
      where: {
        tagId: foundTag.id,
        studentInstanceId: student.id
      }
    })
    res.status(200).send(await findStudentWithTags(student.id))
  },

  /**
   * Remove tag from a student
   *   permissions: must be a teacher/instructor on the course of that student
   *
   * @param req
   * @param res
   */
  async removeTagFromStudentInstance(req, res) {
    const student = await findStudentForStaff(req, 'did not found student with that id')

    const studentTag = await StudentTag.findOne({
      where: {
        studentInstanceId: student.id,
        tagId: req.body.tagId
      }
    })
    if (!studentTag) {
      throw badRequest('Did not find the given student tag.')
    }
    await studentTag.destroy()
    res.status(200).send(await findStudentWithTags(student.id))
  }
}
