import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { clickAndWaitForApi, expectError, expectNoLoader, expectSuccess } from '../fixtures/helpers'

const course = COURSES.projectInfo
const studentInstance = STUDENT_INSTANCES.projectInfo
const SEEDED_REPO = `http://github.com/e2e/project-${studentInstance}`
const NEW_NAME = 'Renamed e2e project'
const NEW_REPO = 'https://github.com/e2e/renamed-project'
// the backend's answer to a repository link that is not an http(s) address (courseinstances.js)
const INVALID_LINK_MESSAGE = 'GitHub link must be a web address starting with http:// or https://.'

/** Opens the project info form through the edit button on the student's course page. */
const openProjectInfo = async (page: Page) => {
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expectNoLoader(page)
  // the link itself has no size, its floated button does
  const editButton = page.locator(`a[href="/labtool/courseregistration/${course.ohid}"]`).getByRole('button')
  await expect(editButton).toBeVisible()
  await clickAndWaitForApi(page, () => editButton.click(), ['courseinstances/coursepage'])
  await expect(page.getByRole('heading', { name: `Update your info for ${course.name}` })).toBeVisible()
}

test.describe.serial('a student edits their project info', () => {
  test('an invalid repository link is refused with the message from the backend', async ({ page }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await openProjectInfo(page)
    await expect(page.locator('input[name="github"]')).toHaveValue(SEEDED_REPO)

    // a valid URL for the browser's type="url" check, but not an http(s) address
    await page.locator('input[name="github"]').fill('ftp://github.com/e2e/renamed-project')
    await page.getByRole('button', { name: 'Submit' }).click()

    await expectError(page, INVALID_LINK_MESSAGE)
    await expect(page).toHaveURL(new RegExp(`/labtool/courseregistration/${course.ohid}$`))

    // nothing was saved
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expectNoLoader(page)
    await expect(page.getByRole('link', { name: SEEDED_REPO })).toBeVisible()
  })

  test('a valid change is saved and the teacher sees it', async ({ page, browser }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await openProjectInfo(page)

    await page.locator('input[name="projectName"]').fill(NEW_NAME)
    await page.locator('input[name="github"]').fill(NEW_REPO)
    await page.getByRole('button', { name: 'Submit' }).click()

    await expectSuccess(page, NOTIFICATIONS.projectInfoUpdated)
    await expect(page).toHaveURL(new RegExp(`/labtool/courses/${course.ohid}$`))
    await expect(page.getByRole('heading', { name: NEW_NAME })).toBeVisible()
    await expect(page.getByRole('link', { name: NEW_REPO })).toBeVisible()

    const teacher = await newPageAs(browser, TEACHER)
    await teacher.page.goto(`/labtool/courses/${course.ohid}`)
    await expect(teacher.page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    const row = teacher.page.getByTestId(`student-row-${studentInstance}`)
    await expect(row).toContainText(NEW_NAME)
    await expect(row.locator(`a[href="${NEW_REPO}"]`).first()).toBeVisible()
    await teacher.context.close()
  })
})
