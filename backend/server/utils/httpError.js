/**
 * An error with an HTTP status. Thrown from a handler, it is answered by the error handler in app.js
 * as `{ message }` with that status, so handlers need no try/catch of their own.
 */
class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const badRequest = message => new HttpError(400, message)
const forbidden = (message = 'You are not authorized to perform this action.') => new HttpError(403, message)
const notFound = message => new HttpError(404, message)

module.exports = {
  HttpError,
  badRequest,
  forbidden,
  notFound
}
