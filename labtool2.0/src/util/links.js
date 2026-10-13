// Same rules as backend/server/helpers/links.js. Links are rendered as hrefs, so anything but a
// plain web link (javascript:, data:, ...) is not rendered as a link at all.

export const isHttpUrl = value =>
  typeof value === 'string' && /^https?:\/\/[^\s/?#]+\.[^\s/?#]+([/?#]\S*)?$/i.test(value)

// https://github.com/owner/repo, optionally followed by a path inside the repository
export const isGithubRepoUrl = value =>
  typeof value === 'string' &&
  /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/\S*)?$/i.test(value)

/** The url itself if it is an http(s) link, otherwise undefined (renders an <a> without href). */
export const safeHref = url => (isHttpUrl(url) ? url : undefined)
