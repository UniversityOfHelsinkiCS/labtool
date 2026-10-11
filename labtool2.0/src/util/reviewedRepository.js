/**
 * The repository a code review was done against (#1132): the reviewee's repository when the reviewer added
 * their link, or when the review was assigned. Older reviews have neither and fall back to the current one.
 * changed: the reviewee's repository is no longer the reviewed one.
 */
export const reviewedRepository = (codeReview, currentRepository) => {
  const snapshot = codeReview.repoAtLinkAdded || codeReview.repoAtAssignment || null
  return {
    repository: snapshot || currentRepository || null,
    current: currentRepository || null,
    changed: Boolean(snapshot && currentRepository && snapshot !== currentRepository)
  }
}
