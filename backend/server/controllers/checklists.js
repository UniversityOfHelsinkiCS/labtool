module.exports = {
  create(req, res) {
    try {
      // TODO validate
      // TODO implement backend functionality.
      res.status(200).send({
        message: 'checklist created succesfully.',
        data: req.body
      })
    } catch (e) {
      res.status(500).send('Unexpected error')
      console.log(e)
    }
  }
}