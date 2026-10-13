import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { gotoWithSession, loginAs, newPageAs } from '../fixtures/auth'
import { ASSISTANT, COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { chooseDropdownOption, expectNoLoader, expectSuccess } from '../fixtures/helpers'

const course = COURSES.staff
const studentInstance = STUDENT_INSTANCES.staff
const ASSISTANT_NAME = `${ASSISTANT.first_names} ${ASSISTANT.last_name}`

const openStaffPage = async (page: Page) => {
  await gotoWithSession(page, `/labtool/ModifyCourseInstanceStaff/${course.ohid}`)
  await expect(page.getByRole('heading', { name: 'Add and remove assistants' })).toBeVisible()
  await expectNoLoader(page)
}

const userRow = (page: Page, name: string) => page.getByRole('row').filter({ hasText: name })

const openCoursePage = async (page: Page) => {
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
  await expectNoLoader(page)
}

test.describe.serial('course staff', () => {
  test('a teacher adds an assistant to the course', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openStaffPage(page)

    await expect(userRow(page, `${TEACHER.first_names} ${TEACHER.last_name}`)).toContainText('Teacher')
    const row = userRow(page, ASSISTANT_NAME)
    await expect(row.getByRole('button', { name: 'Remove assistant' })).toHaveCount(0)

    await row.getByRole('button', { name: 'Add assistant' }).click()

    await expectSuccess(page, NOTIFICATIONS.assistantAdded)
    await expect(row).toContainText('Assistant')
    await expect(row.getByRole('button', { name: 'Remove assistant' })).toBeVisible()
  })

  test('a teacher assigns a student to the assistant', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openCoursePage(page)

    const studentRow = page.getByTestId(`student-row-${studentInstance}`)
    // the instructor column is hidden while nobody has an instructor
    await expect(page.getByRole('columnheader', { name: 'Instructor' })).toHaveCount(0)

    await studentRow.locator('.ui.checkbox').first().click()
    await expect(page.locator(`#select${studentInstance}`)).toBeChecked()
    const bulkForm = page.locator('.TeacherBulkForm')
    await bulkForm.getByText('Modify selected students').click()
    await chooseDropdownOption(page, bulkForm.locator('#assistantDropdown'), ASSISTANT_NAME)
    await bulkForm.getByRole('button', { name: 'Change instructor' }).click()

    await expect(page.getByRole('columnheader', { name: 'Instructor' })).toBeVisible()
    await expect(studentRow).toContainText(ASSISTANT_NAME)

    await openCoursePage(page)
    await expect(page.getByTestId(`student-row-${studentInstance}`)).toContainText(ASSISTANT_NAME)
  })

  test('the assistant sees the course and the assigned student', async ({ page }) => {
    await loginAs(page, ASSISTANT)
    await page.goto('/labtool/mypage')
    await expect(page.getByRole('heading', { name: 'My Courses (Teacher)' })).toBeVisible()
    await page.getByRole('link', { name: new RegExp(`^${course.name}`) }).first().click()

    await expect(page).toHaveURL(new RegExp(`/labtool/courses/${course.ohid}$`))
    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    const studentRow = page.getByTestId(`student-row-${studentInstance}`)
    await expect(studentRow).toContainText(`${REGISTERED_STUDENT.first_names} ${REGISTERED_STUDENT.last_name}`)
    await expect(studentRow).toContainText(ASSISTANT_NAME)
  })

  test('a teacher removes the assistant', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await openStaffPage(page)

    const row = userRow(page, ASSISTANT_NAME)
    await row.getByRole('button', { name: 'Remove assistant' }).click()

    await expectSuccess(page, NOTIFICATIONS.assistantRemoved)
    await expect(row.getByRole('button', { name: 'Add assistant' })).toBeVisible()

    const assistant = await newPageAs(browser, ASSISTANT)
    await assistant.page.goto('/labtool/mypage')
    await expect(assistant.page.getByRole('heading', { name: `${ASSISTANT.last_name}, ${ASSISTANT.first_names}` })).toBeVisible()
    await expect(assistant.page.getByText(course.name)).toHaveCount(0)
    await assistant.context.close()
  })
})
