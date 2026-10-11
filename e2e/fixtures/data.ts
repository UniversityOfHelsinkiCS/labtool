// Shared constants for the e2e suite. Ids and names must match
// backend/server/seeders/20260916000000-e2e-fixtures.js.

export type Course = {
  id: number
  ohid: string
  name: string
  weekAmount: number
  weekMaxPoints: number
  currentWeek: number
}

const course = (id: number, ohid: string, name: string): Course => ({
  id,
  ohid,
  name,
  weekAmount: 7,
  weekMaxPoints: 3,
  currentWeek: 1
})

/** Course used by the registration, grading and smoke specs. */
export const COURSE = course(90001, 'E2E.TEST.COURSE.1', 'E2E Test Course')

/** One course per spec, so that specs do not depend on each other or on run order. */
export const COURSES = {
  settings: course(90002, 'E2E.SETTINGS.COURSE.1', 'E2E Settings Course'),
  checklist: course(90003, 'E2E.CHECKLIST.COURSE.1', 'E2E Checklist Course'),
  codeReview: course(90004, 'E2E.CODEREVIEW.COURSE.1', 'E2E Code Review Course'),
  tags: course(90005, 'E2E.TAGS.COURSE.1', 'E2E Tags Course'),
  comments: course(90006, 'E2E.COMMENTS.COURSE.1', 'E2E Comments Course'),
  draft: course(90007, 'E2E.DRAFT.COURSE.1', 'E2E Draft Course'),
  staff: course(90008, 'E2E.STAFF.COURSE.1', 'E2E Staff Course'),
  drop: course(90009, 'E2E.DROP.COURSE.1', 'E2E Drop Course'),
  email: course(90010, 'E2E.EMAIL.COURSE.1', 'E2E Email Course'),
  bounce: course(90011, 'E2E.BOUNCE.COURSE.1', 'E2E Bounce Course'),
  grading: course(90012, 'E2E.GRADING.COURSE.1', 'E2E Grading Course')
}

/** Student instance ids per course (REGISTERED_STUDENT unless noted otherwise). */
export const STUDENT_INSTANCES = {
  checklist: 90003,
  codeReview: 90004,
  codeReviewSecond: 90014, // SECOND_STUDENT
  tags: 90005,
  tagsSecond: 90015, // SECOND_STUDENT
  comments: 90006,
  draft: 90007,
  staff: 90008,
  drop: 90009, // SECOND_STUDENT
  email: 90010,
  emailSecond: 90020, // SECOND_STUDENT
  bounce: 90011,
  bounceRejected: 90021, // BOUNCING_STUDENT_EMAIL is rejected by Mailpit
  grading: 90012, // no assigned instructor
  gradingAssigned: 90022 // SECOND_STUDENT, assigned to ASSISTANT
}

/** Weeks seeded as already reviewed. */
export const SEEDED_WEEKS = {
  comments: { points: '2', feedback: 'Seeded feedback for the comments spec.' },
  email: { points: '1.5', feedback: 'Seeded feedback for the email spec.' }
}

export type FakeUser = {
  username: string
  student_number: string
  first_names: string
  last_name: string
  email: string | null
}

export const TEACHER: FakeUser = {
  username: 'paaopettaja',
  student_number: '014822548',
  first_names: 'Pää',
  last_name: 'Opettaja',
  email: 'paa.ohjaaja@example.com'
}

export const REGISTERED_STUDENT: FakeUser = {
  username: 'tiraopiskelija1',
  student_number: '014578343',
  first_names: 'Maarit Mirja',
  last_name: 'Opiskelija',
  email: 'maarit.mirja@example.com'
}

export const UNREGISTERED_STUDENT: FakeUser = {
  username: 'tiraopiskelija2',
  student_number: '014553242',
  first_names: 'Johan Wilhelm',
  last_name: 'Studerande',
  email: 'johan.wilhelm@example.com'
}

// Users created by the e2e seeder. Login finds them by username, so their names and email
// addresses come from the database rather than from these headers.
export const SECOND_STUDENT: FakeUser = {
  username: 'e2eopiskelija',
  student_number: '019000001',
  first_names: 'Sanni',
  last_name: 'Toinen',
  email: 'sanni.toinen@example.com'
}

export const ASSISTANT: FakeUser = {
  username: 'e2eassistentti',
  student_number: '019000002',
  first_names: 'Aatu',
  last_name: 'Assistentti',
  email: 'aatu.assistentti@example.com'
}

export const EMAIL_CHANGER: FakeUser = {
  username: 'e2esahkoposti',
  student_number: '019000003',
  first_names: 'Eemeli',
  last_name: 'Postinen',
  email: 'eemeli.vanha@example.com'
}

/** Seeded without an email address, so the app asks for one right after login. */
export const NO_EMAIL_USER: FakeUser = {
  username: 'e2eilmanpostia',
  student_number: '019000004',
  first_names: 'Iida',
  last_name: 'Postiton',
  email: null
}

export const REGISTERED_STUDENT_INSTANCE_ID = 90001

export const NOTIFICATIONS = {
  registrationSuccess: 'Course registration successful!',
  weekReviewed: 'Week reviewed successfully!',
  weekDraftSaved: 'Week draft saved successfully!',
  invalidInputs: 'Invalid inputs.',
  courseUpdated: 'Course instance updated successfully!',
  commentCreated: 'Comment created successfully!',
  assistantAdded: 'Added a new assistant successfully!',
  assistantRemoved: 'Removed an assistant successfully!',
  codeReviewsSaved: 'Code reviews saved successfully',
  codeReviewLinkAdded: 'Review link submitted successfully',
  codeReviewGraded: 'Code review graded successfully',
  tagSaved: 'Tag saved successfully',
  studentTagged: 'Student tagged successfully',
  studentUntagged: 'Student tag removed successfully',
  emailUpdated: 'Your email address has been updated',
  emailSent: 'Email sent successfully.',
  projectInfoUpdated: 'Project info updated successfully!',
  removedFromCourse: 'You have removed yourself from the course',
  coursesImported: 'Courses imported successfully',
  checklistSaved: (week: number) => `Checklist saved successfully for week ${week}.`
}

/** Address of the seeded student whose email the e2e stack's Mailpit rejects (issue #1141). */
export const BOUNCING_STUDENT_EMAIL = 'bounce@rejected.test'
