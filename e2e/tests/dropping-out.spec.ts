import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, SECOND_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess } from '../fixtures/helpers'

const course = COURSES.drop
const studentInstance = STUDENT_INSTANCES.drop // SECOND_STUDENT

const openCoursePage = async (page: Page) => {
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expectNoLoader(page)
}

/** Selects the student in the teacher's table and runs one of the bulk actions. */
const bulkAction = async (page: Page, action: string) => {
  await page.getByTestId(`student-row-${studentInstance}`).locator('.ui.checkbox').first().click()
  await expect(page.locator(`#select${studentInstance}`)).toBeChecked()
  const bulkForm = page.locator('.TeacherBulkForm')
  await bulkForm.getByText('Modify selected students').click()
  await bulkForm.getByRole('button', { name: action }).click()
  await expectSuccess(page, NOTIFICATIONS.projectInfoUpdated)
}

test.describe.serial('dropping out of a course', () => {
  test('a teacher marks a student as dropped', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openCoursePage(page)
    await expect(page.getByText('1 active student', { exact: true })).toBeVisible()

    await bulkAction(page, 'Mark as dropped')

    await expect(page.getByText('0 active students, 1 dropped (1 in total)')).toBeVisible()
    await expect(page.getByTestId(`student-row-${studentInstance}`)).toHaveClass(/TableRowForDroppedOutStudent/)
  })

  test('the student sees that they have been marked as dropped', async ({ page }) => {
    await loginAs(page, SECOND_STUDENT)
    await openCoursePage(page)
    await expect(page.getByText('You have been marked as dropped out from this course')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Remove yourself from the course' })).toHaveCount(0)
  })

  test('a teacher marks the registration as mistaken', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openCoursePage(page)
    await expect(page.getByText('0 active students, 1 dropped (1 in total)')).toBeVisible()

    await bulkAction(page, 'Mistaken course registration')

    // mistaken registrations are left out of the statistics
    await expect(page.getByText('0 active students', { exact: true })).toBeVisible()
  })

  test('the student removes themselves from the course', async ({ page }) => {
    await loginAs(page, SECOND_STUDENT)
    await openCoursePage(page)
    await expect(page.getByText('Your registration has been marked as mistaken')).toBeVisible()

    page.once('dialog', dialog => dialog.accept())
    await page.getByRole('button', { name: 'Remove yourself from the course' }).click()

    await expectSuccess(page, NOTIFICATIONS.removedFromCourse)
    await page.goto('/labtool/mypage')
    await expect(page.getByRole('heading', { name: `${SECOND_STUDENT.last_name}, ${SECOND_STUDENT.first_names}` })).toBeVisible()
    await expect(page.getByText(course.name)).toHaveCount(0)

    // and can register again
    await openCoursePage(page)
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible()
  })

  test('the teacher no longer sees the student', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openCoursePage(page)
    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    await expect(page.getByTestId(`student-row-${studentInstance}`)).toHaveCount(0)
  })
})
