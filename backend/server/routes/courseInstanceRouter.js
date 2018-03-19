const courseInstanceController = require('../controllers').courseInstances
/*const jwt = require('jsonwebtoken')
let express = require('express')*/

module.exports = (app) => {
  /*const apiRoutes = express.Router()
  apiRoutes.use(function (req, res, next) {
    const token = req.body.token || req.query.token
    if (token) {
      jwt.verify(token, app.get(process.env.SECRET), function (err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token' })
        } else {
          req.decoded = decoded
          next()
        }
      })
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided'
      })
    }
  })*/
  app.post('/api/course/register/:ohid/:id', courseInstanceController.testi)
  app.get('/api/courseinstances', courseInstanceController.list) // Skolen kurssit on julkista tietoa eli periaattessa ok.
  app.post('/api/courseinstances/', courseInstanceController.create) // Ei käy
  app.get('/api/courseinstances/:id', courseInstanceController.retrieve) // En tiedä joten ei käy
  app.put('/api/courseinstances/:id', courseInstanceController.update) // Sama.. en tiedä, mutta tätä ei julkisesti pitäisi pystyä tehdä ainakaan apilta saatujen oikeiden tietojen muuttamiseksi
  app.delete('/api/courseinstances/:id', courseInstanceController.destroy) // EI... me ei tiedetä ja me ei haluta antaa mahdollisuutta.
  app.post('/api/courseinstances/update', courseInstanceController.getNew) //For updating DB with data from opetushallitus
  app.post('/api/courseinstances/update/next', courseInstanceController.getNewer)
}
