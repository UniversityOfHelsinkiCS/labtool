const courseInstanceController = require('../controllers').courseInstances
const weekController = require('../controllers').weeks
const assistantController = require('../controllers').assistants

module.exports = (app) => {
  app.post('/api/courseinstances/update', courseInstanceController.getNew) // User story (issue) #106 will replace this
  app.post('/api/courseinstances/update/next', courseInstanceController.getNewer) // User story (issue) #106 will replace this
  app.post('/api/course/register/:ohid', courseInstanceController.registerToCourseInstance)
  app.post('/api/course/student', courseInstanceController.findByUserStudentInstance)
  app.post('/api/course/teacher', courseInstanceController.findByUserTeacherInstance)
  app.get('/api/course/assistant/student/:id', assistantController.findAssistantByStudentInstance) // Get assistant for studentInstance
  app.get('/api/course/assistant/teacher/:id', assistantController.findStudentsByTeacherInstance) // Get student for assistantInstance
  app.post('/api/course/assistant/create', assistantController.create)
  app.get('/api/courseinstances', courseInstanceController.list) // Skolen kurssit on julkista tietoa eli periaattessa ok.
  app.get('/api/courseinstances/:ohid', courseInstanceController.retrieve) // En tiedä joten ei käy
  app.post('/api/courseinstances/coursepage', courseInstanceController.coursePage) // Tämä kysely suoritetaan kun mennään coursepage komponenttiin frontendissä.
  app.put('/api/courseinstances/:id', courseInstanceController.update) // Not public stuff could relate to issue #109
  app.get('/api/courses/:ohid', courseInstanceController.retrieveCourseStuff) // apparently same as /api/course/instances/:ohid
  app.post('/api/weeks/create', weekController.create)
  app.post('/api/weeks/getDraft', weekController.getDraft)
  app.post('/api/weeks/saveDraft', weekController.saveDraft)
  app.post('/api/comment', courseInstanceController.addComment)
  app.post('/api/comments', courseInstanceController.getCommentsForWeek)
  app.post('/api/studentinstance/update', courseInstanceController.updateStudentInstance)
  app.post('/api/courseinstances/:id', courseInstanceController.findByStudentInstanceId) // Get courses by studentInstanceId
}
