module.exports = {
  /**
   * Logout.
   *   permissions: anyone
   *
   * @param req
   * @param res
   */
  logout(req, res) {
    const logoutUrl = req.headers.shib_logout_url
    const { returnUrl } = req.body
    if (!logoutUrl) {
      res.send({ logoutUrl: returnUrl })
      return
    }
    res.send({ logoutUrl: `${logoutUrl}?return=${returnUrl}` })
  }
}
