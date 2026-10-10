import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/auth'
import { EMAIL_CHANGER, NO_EMAIL_USER, NOTIFICATIONS } from '../fixtures/data'
import { expectSuccess } from '../fixtures/helpers'

const NEW_EMAIL = 'eemeli.uusi@example.com'
const FIRST_EMAIL = 'iida.postiton@example.com'

test.describe.serial('own email address', () => {
  test('a user changes their email address on my page', async ({ page }) => {
    await loginAs(page, EMAIL_CHANGER)
    await page.goto('/labtool/mypage')

    await expect(page.getByRole('heading', { name: `${EMAIL_CHANGER.last_name}, ${EMAIL_CHANGER.first_names}` })).toBeVisible()
    await expect(page.getByText(EMAIL_CHANGER.email!)).toBeVisible()

    await page.locator('a[href="/labtool/email"]').click()
    await expect(page.getByRole('heading', { name: 'Edit your email address:' })).toBeVisible()
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveValue(EMAIL_CHANGER.email!)

    await emailInput.fill(NEW_EMAIL)
    await page.getByRole('button', { name: 'Save' }).click()

    await expectSuccess(page, NOTIFICATIONS.emailUpdated)
    await expect(page).toHaveURL(/\/labtool\/myPage$/i)
    await expect(page.getByText(NEW_EMAIL)).toBeVisible()

    await page.reload()
    await expect(page.getByText(NEW_EMAIL)).toBeVisible()
    await expect(page.getByText(EMAIL_CHANGER.email!)).toHaveCount(0)
  })

  test('a user without an email address must give one before using the app', async ({ page }) => {
    await loginAs(page, NO_EMAIL_USER)
    await page.goto('/labtool/courses')

    // every route shows the email form until an address is saved
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveValue('')
    await expect(page.getByRole('heading', { name: 'Courses' })).toHaveCount(0)

    await emailInput.fill(FIRST_EMAIL)
    await page.getByRole('button', { name: 'Save' }).click()

    // the app continues to the page that was requested
    await expectSuccess(page, NOTIFICATIONS.emailUpdated)
    await expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
    await expect(emailInput).toHaveCount(0)

    await page.goto('/labtool/mypage')
    await expect(page.getByText(FIRST_EMAIL)).toBeVisible()
  })
})
