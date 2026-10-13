import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { ASSISTANT, COURSES, NOTIFICATIONS, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess } from '../fixtures/helpers'

// Issue #1127: a review save must not silently overwrite another instructor's work, and changing the
// grading of a student who has another assigned instructor asks for confirmation.

const course = COURSES.grading
const reviewUrl = (studentInstance: number, week: number) =>
  `/labtool/reviewstudent/${course.ohid}/${studentInstance}/${week}`

const openReview = async (page: Page, studentInstance: number, week: number) => {
  await page.goto(reviewUrl(studentInstance, week))
  await expectNoLoader(page)
  await expect(page.getByRole('heading', { name: `Week ${week}` })).toBeVisible()
}

const fillReview = async (page: Page, points: string, feedback: string) => {
  await page.locator('input[name="points"]').fill(points)
  await page.locator('textarea[name="comment"]').fill(feedback)
}

const save = (page: Page) => page.getByRole('button', { name: 'Save', exact: true }).click()

test.describe('two instructors grading the same review', () => {
  test('the second save is stopped, and the instructor can load the other version', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await openReview(page, STUDENT_INSTANCES.grading, 1)
    await fillReview(page, '1', 'Feedback from the teacher')

    // meanwhile the assistant reviews the same week and saves first
    const assistant = await newPageAs(browser, ASSISTANT)
    await openReview(assistant.page, STUDENT_INSTANCES.grading, 1)
    await fillReview(assistant.page, '2', 'Feedback from the assistant')
    await save(assistant.page)
    await expectSuccess(assistant.page, NOTIFICATIONS.weekReviewed)
    await assistant.context.close()

    await save(page)
    const changed = page.locator('.reviewChanged')
    await expect(changed).toContainText('This review was changed by someone else')
    await expect(changed).toContainText('Aatu Assistentti saved this review after you opened it.')
    await expect(page).toHaveURL(new RegExp(`${reviewUrl(STUDENT_INSTANCES.grading, 1)}$`))

    await changed.getByRole('button', { name: 'Load their version' }).click()
    await expectNoLoader(page)
    await expect(page.locator('input[name="points"]')).toHaveValue('2')
    await expect(page.locator('textarea[name="comment"]')).toHaveValue('Feedback from the assistant')
  })

  test('the instructor can overwrite the other version on purpose', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await openReview(page, STUDENT_INSTANCES.grading, 2)
    await fillReview(page, '1', 'Feedback from the teacher')

    const assistant = await newPageAs(browser, ASSISTANT)
    await openReview(assistant.page, STUDENT_INSTANCES.grading, 2)
    await fillReview(assistant.page, '2', 'Feedback from the assistant')
    await save(assistant.page)
    await expectSuccess(assistant.page, NOTIFICATIONS.weekReviewed)
    await assistant.context.close()

    await save(page)
    await page.locator('.reviewChanged').getByRole('button', { name: 'Overwrite with my version' }).click()
    await expectSuccess(page, NOTIFICATIONS.weekReviewed)

    await openReview(page, STUDENT_INSTANCES.grading, 2)
    await expect(page.locator('input[name="points"]')).toHaveValue('1')
    await expect(page.locator('textarea[name="comment"]')).toHaveValue('Feedback from the teacher')
  })
})

test.describe('a student with an assigned instructor', () => {
  test('someone else is warned and asked to confirm before saving', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openReview(page, STUDENT_INSTANCES.gradingAssigned, 1)
    await expect(page.locator('.assignedInstructor')).toContainText(
      "Assigned instructor: Aatu Assistentti. You are not this student's instructor"
    )

    await fillReview(page, '2', 'Graded by the teacher')
    await save(page)

    const dialog = page.locator('.ui.modal')
    await expect(dialog).toContainText('Aatu Assistentti is the instructor of this student, not you.')
    await dialog.getByRole('button', { name: 'Save anyway' }).click()
    await expectSuccess(page, NOTIFICATIONS.weekReviewed)

    // the student list marks the week as changed by someone other than the assigned instructor
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    const cell = page.locator('td', { has: page.getByTestId(`week-review-${STUDENT_INSTANCES.gradingAssigned}-1`) })
    await expect(cell).toHaveClass(/pointsChangedByOthers/)
    await cell.hover()
    await expect(page.locator('.pointsChangedByOthersInfo')).toContainText(
      'Changed by someone other than the assigned instructor (Aatu Assistentti)'
    )
    await expect(page.locator('.pointsChangedByOthersInfo')).toContainText('Pää Opettaja: points 2')
  })

  test('the assigned instructor saves without a question', async ({ page }) => {
    await loginAs(page, ASSISTANT)
    await openReview(page, STUDENT_INSTANCES.gradingAssigned, 2)
    await expect(page.locator('.assignedInstructor')).toContainText('Assigned instructor: Aatu Assistentti (you)')

    await fillReview(page, '3', 'Graded by the assigned instructor')
    await save(page)
    await expectSuccess(page, NOTIFICATIONS.weekReviewed)
    await expect(page.locator('.ui.modal')).toHaveCount(0)
  })
})
