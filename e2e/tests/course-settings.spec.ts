import { test, expect, Page } from '@playwright/test'
import { loginAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, TEACHER } from '../fixtures/data'
import { chooseDropdownOption, expectNoLoader, expectSuccess } from '../fixtures/helpers'

const course = COURSES.settings
const MATERIAL_URL = 'https://example.com/e2e-material'

const openSettings = async (page: Page) => {
  await page.goto(`/labtool/ModifyCourseInstancePage/${course.ohid}`)
  await expect(page.getByRole('heading', { name: `Edit course: ${course.name}` })).toBeVisible()
  await expectNoLoader(page)
}

const registrationCheckbox = (page: Page) => page.locator('.ui.checkbox', { hasText: 'Course registration is active' })

test.describe.serial('course settings', () => {
  test('a teacher changes course settings and they show on the course page', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openSettings(page)

    await expect(page.locator('input[name="weekAmount"]')).toHaveValue(String(course.weekAmount))
    await expect(page.locator('input[name="weekMaxPoints"]')).toHaveValue(String(course.weekMaxPoints))

    await page.locator('input[name="weekAmount"]').fill('9')
    await page.locator('input[name="weekMaxPoints"]').fill('5')
    await chooseDropdownOption(page, page.locator('.weekDropdown'), 'Week 2')
    await page.locator('input[name="courseMaterial"]').fill(MATERIAL_URL)
    await expect(registrationCheckbox(page)).toHaveClass(/checked/)
    await registrationCheckbox(page).click()
    await expect(registrationCheckbox(page)).not.toHaveClass(/checked/)

    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expectSuccess(page, NOTIFICATIONS.courseUpdated)
    await expect(page).toHaveURL(new RegExp(`/labtool/courses/${course.ohid}$`))
    const header = page.locator('.TeachersTopView')
    await expect(header).toContainText('Week amount: 9')
    await expect(header).toContainText('Current week: 2')
    await expect(header).toContainText('Week max points: 5')
    await expect(header).toContainText('The registration is not active on this course.')
    await expect(header.getByText('Active registration')).toHaveCount(0)
  })

  test('the changed settings persist', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openSettings(page)

    await expect(page.locator('input[name="weekAmount"]')).toHaveValue('9')
    await expect(page.locator('input[name="weekMaxPoints"]')).toHaveValue('5')
    await expect(page.locator('.weekDropdown')).toContainText('Week 2')
    await expect(page.locator('input[name="courseMaterial"]')).toHaveValue(MATERIAL_URL)
    await expect(registrationCheckbox(page)).not.toHaveClass(/checked/)
  })

  test('a teacher reactivates registration from the course page', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/courses/${course.ohid}`)

    const header = page.locator('.TeachersTopView')
    await expect(header).toContainText('The registration is not active on this course.')
    await header.getByRole('button', { name: 'Activate now' }).click()

    await expect(header.getByText('Active registration')).toBeVisible()
    await expect(header).not.toContainText('The registration is not active on this course.')

    await page.reload()
    await expect(page.locator('.TeachersTopView').getByText('Active registration')).toBeVisible()
  })
})
