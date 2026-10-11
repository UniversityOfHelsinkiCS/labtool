// The final review is stored as the week after the last one (weekNumber = weekAmount + 1).
const isFinalReviewWeek = (course, weekNumber) => Boolean(course.finalReview) && weekNumber > course.weekAmount

// Final review results are hidden from students until the teacher shows them in the course settings.
const hiddenFromStudents = (course, weekNumber) => isFinalReviewWeek(course, weekNumber) && !course.finalReviewVisible

module.exports = { isFinalReviewWeek, hiddenFromStudents }
