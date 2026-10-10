import { test, expect } from '@playwright/test'
import { loginOnceAs } from '../fixtures/auth'
import { REGISTERED_STUDENT } from '../fixtures/data'

test('a user logs out', async ({ page }) => {
  await loginOnceAs(page, REGISTERED_STUDENT)

  const logoutButton = page.getByRole('button', { name: /^Logout \(Maarit Mirja O\)$/ })
  await expect(logoutButton).toBeVisible()
  await expect(page.getByRole('heading', { name: 'My Courses (Student)' })).toBeVisible()

  await logoutButton.click()

  await expect(page.getByRole('heading', { name: 'Select user to log in as' })).toBeVisible()
  // the nav keeps a plain "Logout" button, but no longer names a user
  await expect(page.getByRole('button', { name: /^Logout \(/ })).toHaveCount(0)
  expect(await page.evaluate(() => window.localStorage.getItem('fake-shibbo-data'))).toBeNull()

  // still logged out after navigating
  await page.goto('/labtool/courses')
  await expect(page.getByRole('heading', { name: 'Select user to log in as' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'My Courses (Student)' })).toHaveCount(0)
})
