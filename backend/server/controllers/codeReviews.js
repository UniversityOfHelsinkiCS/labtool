const CodeReview = require('../models').CodeReview

module.exports = {
  async bulkInsert(req, res) {
    if (!Array.isArray(req.body.codeReviews || typeof req.body.reviewNumber !== 'number')) {
      res.status(400).send('Missing or malformed inputs.')
      return
    }
    const values = req.body.codeReviews.map(codeReview => {
      if (!codeReview.reviewer || !codeReview.toReview) {
        return null
      }
      return {
        studentInstanceId: codeReview.reviewer,
        reviewNumber: req.body.reviewNumber,
        toReview: codeReview.toReview
      }
    })
    if (values.indexOf(null) !== -1) {
      res.status(400).send('Malformed codeReview.')
      return
    }
    await CodeReview.bulkCreate(values, { individualHooks: true })
    const result = await CodeReview.findAll()
    res.status(201).json(result)
  }
}
