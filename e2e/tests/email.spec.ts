import { test, expect } from '@playwright/test'
import { gotoWithSession, loginAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, SEEDED_WEEKS, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'

// The backend (server/controllers/email.js) only logs "Simulated sending email." unless
// NODE_ENV is production or staging; the e2e stack runs with NODE_ENV=development, so no mail
// leaves the stack. The "Email sending simulated." notification proves that branch was taken.

const course = COURSES.email

test('a teacher sends an email notification about a reviewed week', async ({ page }) => {
  await loginAs(page, TEACHER)
  await gotoWithSession(page, `/labtool/browsereviews/${course.ohid}/${STUDENT_INSTANCES.email}`)
  await expectNoLoader(page)

  const week1 = page.locator('#reviewWeek1')
  await openAccordion(week1)
  await expect(week1.getByText(SEEDED_WEEKS.email.feedback)).toBeVisible()

  await week1.getByRole('button', { name: 'Send email notification' }).click()

  await expectSuccess(page, NOTIFICATIONS.emailSimulated)
  await expect(week1.getByText('Notified')).toBeVisible()
  await expect(week1.getByRole('button', { name: 'Send email notification' })).toHaveCount(0)

  // persisted
  await page.reload()
  await expectNoLoader(page)
  await openAccordion(page.locator('#reviewWeek1'))
  await expect(page.locator('#reviewWeek1').getByText('Notified')).toBeVisible()
})

test('a teacher sends a mass email to the students of a course', async ({ page }) => {
  await loginAs(page, TEACHER)
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Send email to multiple students' }).click()
  await expect(page).toHaveURL(new RegExp(`/labtool/massemail/${course.ohid}$`))
  await expect(page.getByRole('heading', { name: 'Send email to students' })).toBeVisible()
  await expectNoLoader(page)

  await expect(page.getByTestId(`student-row-${STUDENT_INSTANCES.email}`)).toBeVisible()
  await expect(page.getByTestId(`student-row-${STUDENT_INSTANCES.emailSecond}`)).toBeVisible()
  await page.getByRole('button', { name: 'Select all active students' }).click()
  await expect(page.locator(`#select${STUDENT_INSTANCES.email}`)).toBeChecked()
  await expect(page.locator(`#select${STUDENT_INSTANCES.emailSecond}`)).toBeChecked()

  await page.getByPlaceholder('Type email here...').fill('The deadline for week 2 has been moved by one day.')
  await page.locator('.ui.checkbox', { hasText: 'Send a copy to all instructors' }).click()
  await page.getByRole('button', { name: 'Send', exact: true }).click()

  await expectSuccess(page, NOTIFICATIONS.emailSimulated)
  await expect(page).toHaveURL(new RegExp(`/labtool/courses/${course.ohid}$`))
})

test('a mass email needs at least one recipient', async ({ page }) => {
  await loginAs(page, TEACHER)
  await page.goto(`/labtool/massemail/${course.ohid}`)
  await expect(page.getByRole('heading', { name: 'Send email to students' })).toBeVisible()
  await expectNoLoader(page)

  await page.getByPlaceholder('Type email here...').fill('Nobody should get this.')
  await page.getByRole('button', { name: 'Send', exact: true }).click()

  await expect(page.locator('.notification.error')).toContainText('Could not send e-mail')
  await expect(page).toHaveURL(new RegExp(`/labtool/massemail/${course.ohid}$`))
})
