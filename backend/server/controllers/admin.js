module.exports = {
  /**
   * The backend admin page. There is nothing on it.
   *   permissions: basic auth as admin (ADMIN_PW)
   * @param req
   * @param res
   */
  list(req, res) {
    res.send('You have logged in as a backend admin. Sadly there is nothing here.')
  },

  /**
   * Form posts of the admin page: redirect back to the page.
   *   permissions: basic auth as admin (ADMIN_PW)
   * @param req
   * @param res
   */
  process(req, res) {
    res.redirect('back') // Shorthand for req.get('referer')
  }
}
