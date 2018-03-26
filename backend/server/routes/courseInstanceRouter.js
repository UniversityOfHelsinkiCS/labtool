const courseInstanceController = require('../controllers').courseInstances

module.exports = (app) => {

  app.post('/api/courseinstances/update', courseInstanceController.getNew) //For updating DB with data from opetushallitus
  app.post('/api/courseinstances/update/next', courseInstanceController.getNewer)
  app.post('/api/course/register/:ohid', courseInstanceController.registerToCourseInstance)
  app.post('/api/course/testi/:studentid', courseInstanceController.findByUserStudentInstance)
  app.post('/api/course/test/:studentid', courseInstanceController.findByUserTeacherInstance)
  app.get('/api/courseinstances', courseInstanceController.list) // Skolen kurssit on julkista tietoa eli periaattessa ok.
  app.post('/api/courseinstances/', courseInstanceController.create) // Ei käy
  app.get('/api/courseinstances/:id', courseInstanceController.retrieve) // En tiedä joten ei käy
  app.put('/api/courseinstances/:id', courseInstanceController.update) // Sama.. en tiedä, mutta tätä ei julkisesti pitäisi pystyä tehdä ainakaan apilta saatujen oikeiden tietojen muuttamiseksi
  app.delete('/api/courseinstances/:id', courseInstanceController.destroy) // EI... me ei tiedetä ja me ei haluta antaa mahdollisuutta.

}
