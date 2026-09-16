import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/auth'
import { COURSE, NOTIFICATIONS, TEACHER, UNREGISTERED_STUDENT } from '../fixtures/data'

const PROJECT_NAME = 'Johans e2e projekti'
const GITHUB_URL = 'https://github.com/johan/e2e-project'

test.describe.serial('joining a course', () => {
  test('a student can find a course, register for it, and stay registered', async ({ page }) => {
    // login
    await loginAs(page, UNREGISTERED_STUDENT)
    await page.goto('/labtool/mypage')

    // unregistered
    await expect(page.getByRole('heading', { name: 'My Courses (Student)' })).toBeVisible()
    await expect(page.getByText(COURSE.name)).toHaveCount(0)

    // browse
    await page.getByRole('link', { name: 'Courses' }).click()
    await expect(page).toHaveURL(/\/labtool\/courses$/)

    // find
    const courseRow = page.locator('tr', { hasText: COURSE.name })
    await expect(courseRow).toBeVisible()
    await expect(courseRow.getByText('Active registration')).toBeVisible()

    // open
    await courseRow.locator(`a[href="/labtool/courses/${COURSE.ohid}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`/labtool/courses/${COURSE.ohid}$`))

    // register
    await page.getByRole('button', { name: 'Register' }).click()
    await expect(page).toHaveURL(new RegExp(`/labtool/courseregistration/${COURSE.ohid}$`))
    await expect(page.getByRole('heading', { name: new RegExp(`Register for ${COURSE.name}`) })).toBeVisible()

    // submit
    await page.locator('input[name="projectName"]').fill(PROJECT_NAME)
    await page.locator('input[name="github"]').fill(GITHUB_URL)
    await page.getByRole('button', { name: 'Submit' }).click()

    // confirmed
    await expect(page.locator('.notification.success')).toHaveText(NOTIFICATIONS.registrationSuccess)
    await expect(page).toHaveURL(/\/labtool\/mypage$/)
    await expect(page.getByText(COURSE.name).first()).toBeVisible()

    // persisted
    await page.goto(`/labtool/courses/${COURSE.ohid}`)
    await expect(page.getByRole('heading', { name: PROJECT_NAME })).toBeVisible()
    await expect(page.locator('a', { hasText: GITHUB_URL })).toBeVisible()
    await expect(page.getByText('Total Points:')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Register' })).toHaveCount(0)
  })

  test('the teacher sees the newly registered student on the course', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/courses/${COURSE.ohid}`)

    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()

    const studentRow = page.locator('tr', { hasText: UNREGISTERED_STUDENT.last_name })
    await expect(studentRow).toBeVisible()
    await expect(studentRow).toContainText(UNREGISTERED_STUDENT.student_number)
    await expect(page.getByText('2 active students')).toBeVisible()
  })
})
