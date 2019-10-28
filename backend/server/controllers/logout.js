const logger = require('../utils/logger')

module.exports = {
  /**
   *
   * @param req
   * @param res
   */
  logout(req, res) {
    try {
      const logoutUrl = req.headers.shib_logout_url
      const { returnUrl } = req.body
      if (!logoutUrl) return res.send({ logoutUrl: returnUrl })
      return res.send({ logoutUrl: `${logoutUrl}?return=${returnUrl}` })
    } catch (error) {
      logger.error('login error', { error: error.message })
      res.status(500).send({
        error: 'Unexpected error'
      })
    }
  }
}
