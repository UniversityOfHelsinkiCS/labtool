import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, REGISTERED_STUDENT, SECOND_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { chooseDropdownOption, expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'

// Seeded: a visible code review 1 in which the two students review each other.
const course = COURSES.codeReviewChanges
const reviewer = STUDENT_INSTANCES.codeReviewChanges // REGISTERED_STUDENT
const reviewee = STUDENT_INSTANCES.codeReviewChangesSecond // SECOND_STUDENT
const revieweeRepo = `http://github.com/e2e/project-${reviewee}`
const OUTSIDE_REPO = 'https://github.com/e2e/outside-project'

const row = (page: Page, studentInstance: number) => page.getByTestId(`student-row-${studentInstance}`)

const openRound1 = async (page: Page) => {
  await page.goto(`/labtool/ModifyCourseInstanceCodeReviews/${course.ohid}`)
  await expect(page.getByRole('heading', { name: course.name })).toBeVisible()
  await expectNoLoader(page)
  await chooseDropdownOption(page, page.locator('thead').getByRole('listbox'), 'Code review 1')
}

/** The student's code review 1 on their course page, opened. */
const studentCodeReview = async (page: Page) => {
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expectNoLoader(page)
  const codeReview = page.locator('#reviewCodeReview1')
  await openAccordion(codeReview)
  return codeReview
}

test.describe.serial('changing code review assignments', () => {
  test('a teacher removes a code review assigned to a student', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await openRound1(page)
    await expect(row(page, reviewer)).toContainText(`Current review: ${SECOND_STUDENT.first_names} ${SECOND_STUDENT.last_name}`)

    await row(page, reviewer).locator('i.window.close.icon').click()
    const modal = page.locator('.ui.modal')
    await expect(modal).toContainText('Do you wish to remove the following code review:')
    await expect(modal).toContainText(`${REGISTERED_STUDENT.first_names} ${REGISTERED_STUDENT.last_name} reviewing`)
    await modal.getByRole('button', { name: 'Yes' }).click()

    await expectSuccess(page, NOTIFICATIONS.codeReviewRemoved)
    await expect(row(page, reviewer)).toContainText('Current review: None')
    // the other assignment of the round stays
    await expect(row(page, reviewee)).toContainText(
      `Current review: ${REGISTERED_STUDENT.first_names} ${REGISTERED_STUDENT.last_name}`
    )

    await openRound1(page)
    await expect(row(page, reviewer)).toContainText('Current review: None')

    const student = await newPageAs(browser, REGISTERED_STUDENT)
    await student.page.goto(`/labtool/courses/${course.ohid}`)
    await expectNoLoader(student.page)
    await expect(student.page.getByRole('link', { name: revieweeRepo })).toHaveCount(0)
    await student.context.close()
  })

  test('a teacher assigns a repository that is not a student on the course', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await openRound1(page)

    const dropdown = row(page, reviewer).locator('.ui.search.dropdown')
    await dropdown.click()
    await dropdown.locator('input.search').fill(OUTSIDE_REPO)
    await dropdown.getByRole('option', { name: new RegExp(`Add.*${OUTSIDE_REPO}`) }).click()
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expectSuccess(page, NOTIFICATIONS.codeReviewsSaved)

    await openRound1(page)
    await expect(row(page, reviewer)).toContainText('Current review:')
    await expect(row(page, reviewer).locator(`a[href="${OUTSIDE_REPO}"]`)).toBeVisible()

    const student = await newPageAs(browser, REGISTERED_STUDENT)
    const codeReview = await studentCodeReview(student.page)
    await expect(codeReview.locator(`a[href="${OUTSIDE_REPO}"]`)).toBeVisible()
    await expect(codeReview.locator('input[name="reviewLink"]')).toBeVisible()
    await student.context.close()
  })
})
