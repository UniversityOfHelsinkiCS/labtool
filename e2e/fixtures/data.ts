export const COURSE = {
  ohid: 'E2E.TEST.COURSE.1',
  name: 'E2E Test Course',
  weekMaxPoints: 3,
  currentWeek: 1
}

export type FakeUser = {
  username: string
  student_number: string
  first_names: string
  last_name: string
  email: string
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

export const REGISTERED_STUDENT_INSTANCE_ID = 90001

export const NOTIFICATIONS = {
  registrationSuccess: 'Course registration successful!',
  weekReviewed: 'Week reviewed successfully!',
  invalidInputs: 'Invalid inputs.'
}
