const helper = require('../helpers/courseImportHelper')
const { badRequest, forbidden } = require('../utils/httpError')

const requirePermissionToImport = async (req) => {
  if (!(await helper.hasPermissionToImport(req.decoded.id))) {
    throw forbidden('You are not allowed to import courses.')
  }
}

/** Kurki failures are answered with the given message, other errors propagate. */
const answeringKurkiErrorWith = async (message, action) => {
  try {
    return await action()
  } catch (error) {
    if (error instanceof helper.KurkiError) {
      throw badRequest(message)
    }
    throw error
  }
}

module.exports = {
  /**
   * Check if user has permission to import courses.
   *   permissions: any logged in user
   *
   * @param {*} req
   * @param {*} res
   */
  async hasPermission(req, res) {
    res.status(200).send({ allowed: await helper.hasPermissionToImport(req.decoded.id) })
  },

  /**
   * List importable courses.
   *   permissions: any logged in user that is allowed to import courses
   *
   * @param {*} req
   * @param {*} res
   */
  async list(req, res) {
    await requirePermissionToImport(req)

    const nonActive = await answeringKurkiErrorWith(
      'Error while listing importable courses.',
      () => helper.getInactive()
    )
    res.status(200).send(helper.formatCoursesForList(nonActive))
  },

  /**
   * Import N courses. Courses that are not importable from Kurki (unknown or already imported) are ignored.
   *   permissions: any logged in user that is allowed to import courses
   *
   * @param {*} req
   * @param {*} res
   */
  async import(req, res) {
    await requirePermissionToImport(req)
    if (!Array.isArray(req.body.courses)) {
      throw badRequest('Missing field "courses".')
    }

    await answeringKurkiErrorWith('Error while importing courses.', async () => {
      const nonActive = await helper.getInactive({ refresh: true })
      const toImport = req.body.courses.filter(course => nonActive.find(c => c.id === course.hid))
      // one at a time: a failure stops the import instead of leaving other imports running
      for (const course of toImport) {
        await helper.createCourse(course)
      }
    })
    res.status(200).send()
  }
}
