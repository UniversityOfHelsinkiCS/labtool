import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures/auth'
import { COURSE, NOTIFICATIONS, REGISTERED_STUDENT, REGISTERED_STUDENT_INSTANCE_ID, TEACHER } from '../fixtures/data'

const POINTS = '2.5'
const FEEDBACK = 'Great progress this week, keep the tests coming.'

test.describe.serial('grading a week', () => {
  test('rejects points above the week maximum', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/reviewstudent/${COURSE.ohid}/${REGISTERED_STUDENT_INSTANCE_ID}/1`)

    await expect(page.getByRole('heading', { name: 'Week 1' })).toBeVisible()

    await page.locator('input[name="points"]').fill(String(COURSE.weekMaxPoints + 1))
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.locator('.notification.error')).toHaveText(NOTIFICATIONS.invalidInputs)
    await expect(page).toHaveURL(new RegExp(`/labtool/reviewstudent/${COURSE.ohid}/${REGISTERED_STUDENT_INSTANCE_ID}/1$`))
  })

  test('a teacher grades week 1 and the student sees the result', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/courses/${COURSE.ohid}`)

    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    const studentRow = page.getByTestId(`student-row-${REGISTERED_STUDENT_INSTANCE_ID}`)
    await expect(studentRow).toContainText(REGISTERED_STUDENT.last_name)

    await page.getByTestId(`week-review-${REGISTERED_STUDENT_INSTANCE_ID}-1`).click()
    await expect(page).toHaveURL(new RegExp(`/labtool/reviewstudent/${COURSE.ohid}/${REGISTERED_STUDENT_INSTANCE_ID}/1$`))
    await expect(page.getByRole('heading', { name: 'Week 1' })).toBeVisible()

    await page.locator('input[name="points"]').fill(POINTS)
    await page.locator('textarea[name="comment"]').fill(FEEDBACK)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.locator('.notification.success')).toHaveText(NOTIFICATIONS.weekReviewed)
    await expect(page).toHaveURL(new RegExp(`/labtool/courses/${COURSE.ohid}$`))

    await expect(page.getByTestId(`student-row-${REGISTERED_STUDENT_INSTANCE_ID}`)).toContainText(POINTS)

    const studentContext = await browser.newContext()
    const studentPage = await studentContext.newPage()
    await loginAs(studentPage, REGISTERED_STUDENT)
    await studentPage.goto(`/labtool/courses/${COURSE.ohid}`)

    const week1 = studentPage.locator('#reviewWeek1')
    await expect(week1).toBeVisible()
    await expect(week1).toContainText(`points ${POINTS}`)

    await week1.getByText('Week 1', { exact: false }).first().click()
    await expect(week1).toContainText(FEEDBACK)
    await expect(studentPage.locator('.ui.green.label', { hasText: 'Total Points' })).toContainText(POINTS)

    await studentContext.close()
  })
})
