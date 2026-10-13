import { Browser, Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { ADMIN_CANDIDATE, NOTIFICATIONS, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess } from '../fixtures/helpers'

// TEACHER is a sysop (admin); ADMIN_CANDIDATE is seeded without admin rights.
const CANDIDATE_NAME = `${ADMIN_CANDIDATE.first_names} ${ADMIN_CANDIDATE.last_name}`

const openUserList = async (page: Page) => {
  await page.goto('/labtool/admin')
  await expect(page.getByRole('heading', { name: 'Welcome to the admin interface.' })).toBeVisible()
  await page.getByRole('button', { name: 'Manage users' }).click()
  await expect(page.getByRole('button', { name: 'Hide users' })).toBeVisible()
  await expectNoLoader(page)
  return page.getByRole('row').filter({ hasText: CANDIDATE_NAME })
}

/** Opens the admin page as the candidate in a fresh browser and checks whether they get in. */
const expectAdminAccess = async (browser: Browser, hasAccess: boolean) => {
  const candidate = await newPageAs(browser, ADMIN_CANDIDATE)
  await candidate.page.goto('/labtool/admin')
  if (hasAccess) {
    await expect(candidate.page.getByRole('heading', { name: 'Welcome to the admin interface.' })).toBeVisible()
    await expect(candidate.page.getByRole('link', { name: 'Admin' })).toBeVisible()
  } else {
    // redirected to my page
    await expect(
      candidate.page.getByRole('heading', { name: `${ADMIN_CANDIDATE.last_name}, ${ADMIN_CANDIDATE.first_names}` })
    ).toBeVisible()
    await expect(candidate.page).not.toHaveURL(/\/labtool\/admin$/)
    await expect(candidate.page.getByRole('heading', { name: 'Welcome to the admin interface.' })).toHaveCount(0)
    await expect(candidate.page.getByRole('link', { name: 'Admin' })).toHaveCount(0)
  }
  await candidate.context.close()
}

test.describe.serial('admin rights', () => {
  test('a user without admin rights cannot open the admin page', async ({ browser }) => {
    await expectAdminAccess(browser, false)
  })

  test('a sysop grants admin rights and the user gets the admin page', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    const row = await openUserList(page)
    await expect(row).toContainText('Not admin')

    page.once('dialog', dialog => {
      expect(dialog.message()).toBe(`Are you sure you want to grant admin rights to ${CANDIDATE_NAME}?`)
      return dialog.accept()
    })
    await row.getByRole('button', { name: 'Make admin' }).click()

    await expectSuccess(page, NOTIFICATIONS.userUpdated)
    await expect(row.getByRole('button', { name: 'Remove admin' })).toBeVisible()
    await expect(row).not.toContainText('Not admin')

    await expectAdminAccess(browser, true)
  })

  test('the sysop revokes the admin rights and the user loses the admin page', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    const row = await openUserList(page)
    await expect(row.getByRole('button', { name: 'Remove admin' })).toBeVisible()

    page.once('dialog', dialog => dialog.accept())
    await row.getByRole('button', { name: 'Remove admin' }).click()

    await expectSuccess(page, NOTIFICATIONS.userUpdated)
    await expect(row).toContainText('Not admin')

    await expectAdminAccess(browser, false)
  })
})
