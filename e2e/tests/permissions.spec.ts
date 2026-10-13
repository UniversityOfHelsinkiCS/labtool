import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs } from '../fixtures/auth'
import { ASSISTANT, COURSES, REGISTERED_STUDENT, SECOND_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader } from '../fixtures/helpers'

// The backend refuses what the user may not do; these tests check that the UI does not offer it
// either: a page of the course staff opened directly, e.g. from a shared link, says "no access"
// instead of showing forms, crashing (the error guard in fixtures/test.ts fails the test on an uncaught
// page error) or showing a loader forever.
const course = COURSES.permissions
const ownStudentInstance = STUDENT_INSTANCES.permissions
const otherStudent = STUDENT_INSTANCES.permissionsSecond
const NO_ACCESS = 'You do not have access to this page.'
const OTHER_STUDENT_NAME = `${SECOND_STUDENT.first_names} ${SECOND_STUDENT.last_name}`

type TeacherPage = {
  name: string
  path: string
  /** Nothing of the teacher UI is shown. */
  expectNoTeacherUi: (page: Page) => Promise<void>
}

const noSaveButton = async (page: Page) => expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0)

const teacherPages: TeacherPage[] = [
  {
    name: 'course settings',
    path: `/labtool/ModifyCourseInstancePage/${course.ohid}`,
    expectNoTeacherUi: async page => {
      await expect(page.getByRole('heading', { name: /Edit course/ })).toHaveCount(0)
      await expect(page.locator('input[name="weekAmount"]')).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Mark course as invalid' })).toHaveCount(0)
      await noSaveButton(page)
    }
  },
  {
    name: 'the review page of another student',
    path: `/labtool/reviewstudent/${course.ohid}/${otherStudent}/1`,
    expectNoTeacherUi: async page => {
      await expect(page.locator('input[name="points"]')).toHaveCount(0)
      await expect(page.getByText(OTHER_STUDENT_NAME)).toHaveCount(0)
      await noSaveButton(page)
    }
  },
  {
    name: 'the review page of their own registration',
    path: `/labtool/reviewstudent/${course.ohid}/${ownStudentInstance}/1`,
    expectNoTeacherUi: async page => {
      await expect(page.locator('input[name="points"]')).toHaveCount(0)
      await noSaveButton(page)
    }
  },
  {
    name: 'the code review grading page',
    path: `/labtool/reviewstudentcr/${course.ohid}/${otherStudent}/1`,
    expectNoTeacherUi: async page => {
      await expect(page.locator('input[name="points"]')).toHaveCount(0)
      await noSaveButton(page)
    }
  },
  {
    name: 'the reviews of another student',
    path: `/labtool/browsereviews/${course.ohid}/${otherStudent}`,
    expectNoTeacherUi: async page => {
      await expect(page.getByText(OTHER_STUDENT_NAME)).toHaveCount(0)
      await expect(page.locator('.studentHistory')).toHaveCount(0)
    }
  },
  {
    name: 'mass email',
    path: `/labtool/massemail/${course.ohid}`,
    expectNoTeacherUi: async page => {
      await expect(page.getByRole('heading', { name: 'Send email to students' })).toHaveCount(0)
      await expect(page.getByRole('button', { name: 'Send', exact: true })).toHaveCount(0)
    }
  },
  {
    name: 'code review settings',
    path: `/labtool/ModifyCourseInstanceCodeReviews/${course.ohid}`,
    expectNoTeacherUi: async page => {
      await expect(page.getByTestId(/^student-row-/)).toHaveCount(0)
      await expect(page.getByText(OTHER_STUDENT_NAME)).toHaveCount(0)
      await noSaveButton(page)
    }
  },
  {
    name: 'course staff',
    path: `/labtool/ModifyCourseInstanceStaff/${course.ohid}`,
    expectNoTeacherUi: async page => {
      await expect(page.getByRole('heading', { name: 'Add and remove assistants' })).toHaveCount(0)
      await expect(page.getByPlaceholder(/^Filter by name/)).toHaveCount(0)
    }
  },
  {
    name: 'checklist creation',
    path: `/labtool/checklist/${course.ohid}/create`,
    expectNoTeacherUi: async page => {
      await expect(page.getByRole('heading', { name: /checklist/i })).toHaveCount(0)
      await noSaveButton(page)
    }
  },
  {
    name: 'tag management',
    path: `/labtool/ManageTags/${course.ohid}`,
    expectNoTeacherUi: async page => {
      await expect(page.getByPlaceholder('Tag name')).toHaveCount(0)
      await noSaveButton(page)
    }
  }
]

test.describe('a student opening a teacher-only page directly', () => {
  for (const teacherPage of teacherPages) {
    test(`gets "no access" on ${teacherPage.name}`, async ({ page }) => {
      await loginAs(page, REGISTERED_STUDENT)
      await page.goto(teacherPage.path)

      await expect(page.getByText(NO_ACCESS)).toBeVisible()
      await teacherPage.expectNoTeacherUi(page)
      await expectNoLoader(page)
    })
  }

  test('gets the reason instead of a loader on course import', async ({ page }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await page.goto('/labtool/courseimport')

    await expect(page.getByText(/You are not allowed to import courses\./)).toBeVisible()
    await expectNoLoader(page)
  })
})

test.describe('responsible-teacher-only actions', () => {
  const openSettings = async (page: Page) => {
    await page.goto(`/labtool/ModifyCourseInstancePage/${course.ohid}`)
    await expect(page.getByRole('heading', { name: `Edit course: ${course.name}` })).toBeVisible()
    await expectNoLoader(page)
  }

  test('an assistant edits the course settings but cannot mark the course invalid', async ({ page }) => {
    await loginAs(page, ASSISTANT)
    await openSettings(page)

    await expect(page.locator('input[name="weekAmount"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mark course as invalid' })).toHaveCount(0)
  })

  test('the responsible teacher is offered marking the course invalid', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openSettings(page)

    await expect(page.getByRole('button', { name: 'Mark course as invalid' })).toBeVisible()
  })
})
