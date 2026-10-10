import { test, expect } from '@playwright/test'
import { gotoWithSession, loginAs } from '../fixtures/auth'
import { TEACHER } from '../fixtures/data'

// FIXME: course import cannot be tested on the e2e stack yet.
//
// The backend asks the fake Kurki (Kurki_simulation) for the current and the next term
// (backend/server/helpers/applicationHelper.js CurrentTermAndYear(), e.g. 2026S and 2027K), but
// Kurki_simulation/responses only has files up to 2020, so Kurki answers 500 and the import page
// shows "Error while listing importable courses." instead of a course list.
//
// To enable: give Kurki_simulation responses for the current terms (or a fallback for unknown
// terms) whose course details list `paaopettaja` as a teacher, and remove the fixme. The steps
// below have not been run yet.
test.fixme('a sysop imports a course from Kurki', async ({ page }) => {
  await loginAs(page, TEACHER)
  await gotoWithSession(page, '/labtool/courseimport')
  await expect(page.getByRole('heading', { name: 'Import courses' })).toBeVisible()

  const firstCourse = page.locator('tbody tr').first()
  const courseName = (await firstCourse.locator('td').nth(2).innerText()).trim()
  await firstCourse.locator('.ui.checkbox').click()
  await page.getByRole('button', { name: 'Import' }).click()

  await expect(page.locator('.notification.success')).toHaveText('Courses imported successfully')
  await expect(page).toHaveURL(/\/labtool\/courses$/)
  await expect(page.getByRole('link', { name: courseName })).toBeVisible()
})
