// Links that users store are rendered as hrefs, so only plain web links are accepted:
// anything else (javascript:, data:, ...) would run or open on the labtool origin.

const isHttpUrl = value => typeof value === 'string' && /^https?:\/\/[^\s/?#]+\.[^\s/?#]+([/?#]\S*)?$/i.test(value)

// https://github.com/owner/repo, optionally followed by a path inside the repository
const isGithubRepoUrl = value => typeof value === 'string'
  && /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/\S*)?$/i.test(value)

module.exports = { isHttpUrl, isGithubRepoUrl }
