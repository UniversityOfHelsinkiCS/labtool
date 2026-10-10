import { test, expect } from '@playwright/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { clickAndWaitForApi, expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'

const course = COURSES.draft
const studentInstance = STUDENT_INSTANCES.draft

const DRAFT_POINTS = '1.25'
const DRAFT_FEEDBACK = 'Half done, finishing the review later.'
const DRAFT_NOTES = 'Remember to check the CI setup.'
const FINAL_POINTS = '2.75'

test.describe.serial('week review drafts', () => {
  test('a teacher saves a week review as a draft', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/reviewstudent/${course.ohid}/${studentInstance}/1`)
    await expect(page.getByRole('heading', { name: 'Week 1' })).toBeVisible()
    await expectNoLoader(page)

    await page.locator('input[name="points"]').fill(DRAFT_POINTS)
    await page.locator('textarea[name="comment"]').fill(DRAFT_FEEDBACK)
    await page.locator('textarea[name="instructorNotes"]').fill(DRAFT_NOTES)
    await page.getByRole('button', { name: 'Save as draft' }).click()

    await expectSuccess(page, NOTIFICATIONS.weekDraftSaved)
    await expect(page).toHaveURL(new RegExp(`/labtool/courses/${course.ohid}$`))

    // the week cell offers to continue from the draft, and no points are recorded yet
    const weekCell = page.getByTestId(`week-review-${studentInstance}-1`)
    await expect(weekCell.locator('i.pause.icon')).toBeVisible()
    await expect(page.getByTestId(`student-row-${studentInstance}`)).not.toContainText(DRAFT_POINTS)
  })

  test('the student does not see the draft', async ({ browser }) => {
    const student = await newPageAs(browser, REGISTERED_STUDENT)
    await student.page.goto(`/labtool/courses/${course.ohid}`)
    await expect(student.page.locator('.ui.green.label', { hasText: 'Total Points' })).toBeVisible()
    await expect(student.page.locator('#reviewWeek1')).toHaveCount(0)
    await expect(student.page.getByText(DRAFT_FEEDBACK)).toHaveCount(0)
    await student.context.close()
  })

  test('a teacher continues from the draft and publishes the review', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()

    await clickAndWaitForApi(page, () => page.getByTestId(`week-review-${studentInstance}-1`).click(), ['courseinstances/coursepage', 'weeks/getDraft'])
    await expect(page.getByRole('heading', { name: 'Week 1' })).toBeVisible()

    await expect(page.locator('input[name="points"]')).toHaveValue(DRAFT_POINTS)
    await expect(page.locator('textarea[name="comment"]')).toHaveValue(DRAFT_FEEDBACK)
    await expect(page.locator('textarea[name="instructorNotes"]')).toHaveValue(DRAFT_NOTES)

    await page.locator('input[name="points"]').fill(FINAL_POINTS)
    await expect(page.locator('input[name="points"]')).toHaveValue(FINAL_POINTS)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expectSuccess(page, NOTIFICATIONS.weekReviewed)
    const weekCell = page.getByTestId(`week-review-${studentInstance}-1`)
    await expect(weekCell).toContainText(FINAL_POINTS)
    await expect(weekCell.locator('i.pause.icon')).toHaveCount(0)

    const student = await newPageAs(browser, REGISTERED_STUDENT)
    await student.page.goto(`/labtool/courses/${course.ohid}`)
    const week1 = student.page.locator('#reviewWeek1')
    await expect(week1).toContainText(`points ${FINAL_POINTS}`)
    await openAccordion(week1)
    await expect(week1.getByText(DRAFT_FEEDBACK)).toBeVisible()
    // instructor notes stay hidden from the student
    await expect(week1).not.toContainText(DRAFT_NOTES)
    await student.context.close()
  })
})
