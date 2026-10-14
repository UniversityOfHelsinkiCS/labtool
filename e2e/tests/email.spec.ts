import { test, expect } from '../fixtures/test'
import { loginAs } from '../fixtures/auth'
import {
  BOUNCING_STUDENT_EMAIL,
  COURSES,
  NOTIFICATIONS,
  SEEDED_WEEKS,
  STUDENT_INSTANCES,
  TEACHER
} from '../fixtures/data'
import { expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'
import { mailsWithSubject } from '../fixtures/mailpit'

// The e2e backend sends email through the stack's Mailpit (SMTP_HOST in docker-compose.e2e.yml), so
// these tests check what was really delivered. Addresses as stored by the seeders:
const STUDENT_ADDRESS = 'maarit.opiskelija@helsinki.invalid' // REGISTERED_STUDENT, demo seed
const SECOND_STUDENT_ADDRESS = 'sanni.toinen@example.com'
const TEACHER_ADDRESS = 'paa.opettaja@helsinki.invalid'

const course = COURSES.email

const recipientsOfMailsFor = async (courseName: string) =>
  (await mailsWithSubject(courseName)).flatMap(mail => mail.recipients)

test('a teacher sends an email notification about a reviewed week', async ({ page }) => {
  await loginAs(page, TEACHER)
  await page.goto(`/labtool/browsereviews/${course.ohid}/${STUDENT_INSTANCES.email}`)
  await expectNoLoader(page)

  const week1 = page.locator('#reviewWeek1')
  await openAccordion(week1)
  await expect(week1.getByText(SEEDED_WEEKS.email.feedback)).toBeVisible()

  await week1.getByRole('button', { name: 'Send email notification' }).click()

  await expectSuccess(page, NOTIFICATIONS.emailSent)
  await expect.poll(() => recipientsOfMailsFor(course.name)).toContain(STUDENT_ADDRESS)
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
  // checked by default, so the instructors get a copy
  await expect(page.locator('.ui.checkbox', { hasText: 'Send a copy to all instructors' })).toHaveClass(/\bchecked\b/)
  await page.getByRole('button', { name: 'Send', exact: true }).click()

  await expectSuccess(page, NOTIFICATIONS.emailSent)
  await expect(page).toHaveURL(new RegExp(`/labtool/courses/${course.ohid}$`))
  await expect
    .poll(async () => (await mailsWithSubject(`${course.name} new message from instructor`))[0]?.recipients)
    .toEqual(expect.arrayContaining([STUDENT_ADDRESS, SECOND_STUDENT_ADDRESS, TEACHER_ADDRESS]))
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

// Issue #1141: recipients the mail server rejects. The others still get the email, and the teacher is
// told exactly who did not.
const BOUNCING_STUDENT_NAME = 'Pauli Palautuva'

test.describe('mass email when the mail server rejects an address (#1141)', () => {
  const bounce = COURSES.bounce

  const openMassEmail = async page => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/massemail/${bounce.ohid}`)
    await expect(page.getByRole('heading', { name: 'Send email to students' })).toBeVisible()
    await expectNoLoader(page)
  }

  test('the other students get the email and the teacher is told who did not', async ({ page }) => {
    await openMassEmail(page)
    await page.getByRole('button', { name: 'Select all active students' }).click()
    await expect(page.locator(`#select${STUDENT_INSTANCES.bounceRejected}`)).toBeChecked()
    await page.getByPlaceholder('Type email here...').fill('Does this reach everyone?')
    await page.getByRole('button', { name: 'Send', exact: true }).click()

    const error = page.locator('.notification.error')
    await expect(error).toContainText('Not delivered to:')
    await expect(error).toContainText(`${BOUNCING_STUDENT_NAME} (${BOUNCING_STUDENT_EMAIL}, rejected by the mail server)`)
    await expect.poll(() => recipientsOfMailsFor(bounce.name)).toContain(STUDENT_ADDRESS)
    expect(await recipientsOfMailsFor(bounce.name)).not.toContain(BOUNCING_STUDENT_EMAIL)

    // the teacher stays on the page with the message kept and only the failed student selected
    await expect(page).toHaveURL(new RegExp(`/labtool/massemail/${bounce.ohid}$`))
    const notDelivered = page.locator('.notDelivered')
    await expect(notDelivered).toContainText('The email was sent, but these recipients did not get it')
    await expect(notDelivered).toContainText(
      `${BOUNCING_STUDENT_NAME} (${BOUNCING_STUDENT_EMAIL}): rejected by the mail server`
    )
    await expect(page.getByPlaceholder('Type email here...')).toHaveValue('Does this reach everyone?')
    await expect(page.locator(`#select${STUDENT_INSTANCES.bounceRejected}`)).toBeChecked()
    await expect(page.locator(`#select${STUDENT_INSTANCES.bounce}`)).not.toBeChecked()
  })

  test('nothing is sent when every address is rejected, and the teacher is told why', async ({ page }) => {
    await openMassEmail(page)
    await page.locator('.ui.checkbox', { has: page.locator(`#select${STUDENT_INSTANCES.bounceRejected}`) }).click()
    await expect(page.locator(`#select${STUDENT_INSTANCES.bounceRejected}`)).toBeChecked()
    // without the default copy to instructors, the only recipient is the rejected one
    await page.locator('.ui.checkbox', { hasText: 'Send a copy to all instructors' }).click()
    await page.getByPlaceholder('Type email here...').fill('Only to the bouncing student')
    await page.getByRole('button', { name: 'Send', exact: true }).click()

    const error = page.locator('.notification.error')
    await expect(error).toContainText('No email was sent')
    await expect(error).toContainText(`${BOUNCING_STUDENT_NAME} (${BOUNCING_STUDENT_EMAIL}, rejected by the mail server)`)
    await expect(page).toHaveURL(new RegExp(`/labtool/massemail/${bounce.ohid}$`))
    await expect(page.locator('.notDelivered')).toContainText('The email was not sent to anybody')
  })
})
