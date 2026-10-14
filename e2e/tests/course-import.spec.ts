import { test, expect } from '../fixtures/test'
import { gotoWithSession, loginAs } from '../fixtures/auth'
import { expectNoLoader, expectSuccess } from '../fixtures/helpers'
import { NOTIFICATIONS, TEACHER } from '../fixtures/data'

// The fake Kurki (Kurki_simulation) generates two courses for every term it has no response file
// for, with TEACHER (paaopettaja) as their teacher, so the current term always has courses to
// import. Imported courses are removed by the e2e seeder before every run.
const IMPORTED_COURSE = 'Tietokantasovellus'

test('a sysop imports a course from Kurki and becomes its teacher', async ({ page }) => {
  await loginAs(page, TEACHER)
  await gotoWithSession(page, '/labtool/courseimport')
  await expect(page.getByRole('heading', { name: 'Import courses' })).toBeVisible()

  // the earliest generated course with this name is from the current term
  const row = page.locator('tbody tr', { hasText: IMPORTED_COURSE }).first()
  await expect(row).toBeVisible()
  await expect(row).toContainText(TEACHER.username)
  const courseName = (await row.locator('td').nth(2).innerText()).trim()

  await row.locator('.ui.checkbox').click()
  await page.getByRole('button', { name: 'Import', exact: true }).click()

  await expectSuccess(page, NOTIFICATIONS.coursesImported)
  await expect(page).toHaveURL(/\/labtool\/courses$/)

  // the course is listed and the Kurki teacher is a teacher on it
  const courseLink = page.getByRole('link', { name: courseName, exact: true })
  await expect(courseLink).toBeVisible()
  await courseLink.click()
  await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
  await expectNoLoader(page)

  // and it can no longer be imported
  await page.goto('/labtool/courseimport')
  await expect(page.getByRole('heading', { name: 'Import courses' })).toBeVisible()
  await expectNoLoader(page)
  await expect(page.locator('tbody tr', { hasText: courseName })).toHaveCount(0)
})
