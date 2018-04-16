const courseInstanceController = require('../controllers').courseInstances

module.exports = (app) => {

  app.post('/api/courseinstances/update', courseInstanceController.getNew)  // User story (issue) #106 will replace this
  app.post('/api/courseinstances/update/next', courseInstanceController.getNewer) // User story (issue) #106 will replace this
  app.post('/api/course/register/:ohid', courseInstanceController.registerToCourseInstance)
  app.post('/api/course/student', courseInstanceController.findByUserStudentInstance)
  app.post('/api/course/teacher', courseInstanceController.findByUserTeacherInstance)
  app.get('/api/courseinstances', courseInstanceController.list) // Skolen kurssit on julkista tietoa eli periaattessa ok.
  app.get('/api/courseinstances/:ohid', courseInstanceController.retrieve) // En tiedä joten ei käy
  app.put('/api/courseinstances/:id', courseInstanceController.update) // Sama.. en tiedä, mutta tätä ei julkisesti pitäisi pystyä tehdä ainakaan apilta saatujen oikeiden tietojen muuttamiseksi
  app.post('/api/courseinstances/coursepage', courseInstanceController.coursePage) // Tämä kysely suoritetaan kun mennään coursepage komponenttiin frontendissä.
  app.put('/api/courseinstances/:id', courseInstanceController.update) // Not public stuff could relate to issue #109
  app.get('/api/courses/:ohid', courseInstanceController.retrieveCourseStuff) // apparently same as /api/course/iunstances/:ohid
}
