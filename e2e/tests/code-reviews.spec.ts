import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, REGISTERED_STUDENT, SECOND_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { chooseDropdownOption, expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'

const course = COURSES.codeReview
const reviewer = STUDENT_INSTANCES.codeReview // REGISTERED_STUDENT
const reviewee = STUDENT_INSTANCES.codeReviewSecond // SECOND_STUDENT
const revieweeRepo = `http://github.com/e2e/project-${reviewee}`
const REVIEW_LINK = `https://github.com/e2e/project-${reviewee}/issues/1`
const POINTS = '2'

const fullName = (user: { first_names: string; last_name: string }) => `${user.first_names} ${user.last_name}`

const openCodeReviewPage = async (page: Page) => {
  await page.goto(`/labtool/ModifyCourseInstanceCodeReviews/${course.ohid}`)
  await expect(page.getByRole('heading', { name: course.name })).toBeVisible()
  await expectNoLoader(page)
}

/** The code review round selector in the student table header. */
const codeReviewSelector = (page: Page) => page.locator('thead').getByRole('listbox')

/** The "select a student or add a repo link" dropdown in a student's row. */
const revieweeDropdown = (page: Page, studentInstance: number) => page.getByTestId(`student-row-${studentInstance}`).locator('.ui.search.dropdown')

test.describe.serial('code reviews', () => {
  test('a teacher creates a code review round, assigns reviewers and makes it visible', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openCodeReviewPage(page)
    await expect(page.locator('.visibilityReminder')).toContainText('create a new one')

    await chooseDropdownOption(page, codeReviewSelector(page), 'New code review')

    await chooseDropdownOption(page, revieweeDropdown(page, reviewer), fullName(SECOND_STUDENT))
    await chooseDropdownOption(page, revieweeDropdown(page, reviewee), fullName(REGISTERED_STUDENT))
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expectSuccess(page, NOTIFICATIONS.codeReviewsSaved)

    // the new round exists but is not yet visible to students
    await openCodeReviewPage(page)
    await chooseDropdownOption(page, codeReviewSelector(page), 'Code review 1')
    await expect(page.getByTestId(`student-row-${reviewer}`)).toContainText(`Current review: ${fullName(SECOND_STUDENT)}`)
    await expect(page.getByTestId(`student-row-${reviewee}`)).toContainText(`Current review: ${fullName(REGISTERED_STUDENT)}`)
    await expect(page.getByText('This code review is currently not visible to students.')).toBeVisible()

    await page.getByRole('button', { name: 'Activate the code review' }).click()
    await expectSuccess(page, NOTIFICATIONS.courseUpdated)
  })

  test('the student sees whom to review and submits a link to the review', async ({ page }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expectNoLoader(page)

    const codeReview = page.locator('#reviewCodeReview1')
    await openAccordion(codeReview)
    await expect(codeReview.getByRole('link', { name: revieweeRepo })).toBeVisible()
    await expect(codeReview).toContainText('Not graded yet')

    await codeReview.locator('input[name="reviewLink"]').fill(REVIEW_LINK)
    await codeReview.getByRole('button', { name: 'Submit' }).click()

    await expectSuccess(page, NOTIFICATIONS.codeReviewLinkAdded)
    await expect(codeReview.getByText('Your review:')).toBeVisible()
    await expect(codeReview.getByRole('link', { name: REVIEW_LINK })).toBeVisible()
    await expect(codeReview.locator('input[name="reviewLink"]')).toHaveCount(0)
  })

  test('the teacher grades the code review and the student sees the points', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    // a submitted, ungraded review is waiting in the code review column
    await expect(page.getByTestId(`student-row-${reviewer}`).locator('.codeReviewPoints i.star.icon')).toBeVisible()

    await page.goto(`/labtool/browsereviews/${course.ohid}/${reviewer}`)
    await expectNoLoader(page)
    const codeReview = page.locator('#reviewCodeReview1')
    await openAccordion(codeReview)
    await expect(codeReview.getByRole('link', { name: REVIEW_LINK })).toBeVisible()
    await expect(codeReview).toContainText('Not graded yet')

    await codeReview.locator('input[name="points"]').fill(POINTS)
    await codeReview.getByRole('button', { name: 'Grade' }).click()

    await expectSuccess(page, NOTIFICATIONS.codeReviewGraded)
    await expect(codeReview.locator('.title')).toContainText(`points ${POINTS}`)

    const student = await newPageAs(browser, REGISTERED_STUDENT)
    await student.page.goto(`/labtool/courses/${course.ohid}`)
    await expect(student.page.locator('#reviewCodeReview1 .title')).toContainText(`points ${POINTS}`)
    await expect(student.page.locator('.ui.green.label', { hasText: 'Total Points' })).toContainText(POINTS)
    await student.context.close()
  })
})
