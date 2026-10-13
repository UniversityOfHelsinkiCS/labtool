/**
 * The message of a failed API call (the axios error a *_FAILURE action carries as `response`).
 * The backend answers errors with { message }; older answers were a plain string or { error }.
 * A network error or a timeout has no response at all, so the fallback is used.
 */
export const errorMessage = (failure, fallback) => {
  const data = failure && failure.response && failure.response.data
  if (typeof data === 'string' && data) {
    return data
  }
  if (data && typeof data.message === 'string' && data.message) {
    return data.message
  }
  if (data && typeof data.error === 'string' && data.error) {
    return data.error
  }
  return fallback
}

/** Error data in a failure's response body, e.g. a 409 conflict, or undefined. */
export const errorData = failure => (failure && failure.response ? failure.response.data : undefined)
