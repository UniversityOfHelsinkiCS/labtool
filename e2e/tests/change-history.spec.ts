import { test, expect, Page } from '@playwright/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { ASSISTANT, COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess } from '../fixtures/helpers'

// Issues #1129 and #1132: course staff see who changed a student's grading or repository, and when.
// Uses weeks 3-4 of the grading course; grading-safety.spec.ts uses weeks 1-2.

const course = COURSES.grading
const student = STUDENT_INSTANCES.grading
const reviewUrl = (week: number) => `/labtool/reviewstudent/${course.ohid}/${student}/${week}`
const browseReviewsUrl = `/labtool/browsereviews/${course.ohid}/${student}`

const gradeWeek = async (page: Page, week: number, points: string, feedback: string) => {
  await page.goto(reviewUrl(week))
  await expectNoLoader(page)
  await expect(page.getByRole('heading', { name: `Week ${week}` })).toBeVisible()
  await page.locator('input[name="points"]').fill(points)
  await page.locator('textarea[name="comment"]').fill(feedback)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expectSuccess(page, NOTIFICATIONS.weekReviewed)
}

// the last test reads the changes the first two make
test.describe.serial('change history', () => {
  test('the review page shows who changed the grading, with the old and new texts', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await gradeWeek(page, 3, '1', 'First version of the feedback')

    const assistant = await newPageAs(browser, ASSISTANT)
    await gradeWeek(assistant.page, 3, '2', 'Second version of the feedback')
    await assistant.context.close()

    await page.goto(reviewUrl(3))
    await expectNoLoader(page)
    const history = page.locator('.changeHistory')
    await expect(history).toContainText('Instructors only: not shown to the student')
    const entries = history.locator('.changeHistoryEntry')
    await expect(entries.nth(0)).toContainText('Aatu Assistentti')
    await expect(entries.nth(0)).toContainText('Points 1 → 2')
    await expect(entries.nth(1)).toContainText('Pää Opettaja')
    await expect(entries.nth(1)).toContainText('Initial review')
    await expect(entries.nth(1)).toContainText('Points 1')
    await expect(entries.nth(1)).not.toContainText('→')

    await entries.nth(0).getByText('Show old and new text').click()
    await expect(entries.nth(0)).toContainText('First version of the feedback')
    await expect(entries.nth(0)).toContainText('Second version of the feedback')

    // another week has its own history
    await page.goto(reviewUrl(4))
    await expectNoLoader(page)
    await expect(page.locator('.changeHistory')).toContainText('No changes recorded yet')
  })

  test('a student changing their repository shows in the change history', async ({ page, browser }) => {
    const moved = 'https://github.com/e2e/moved-project'
    await loginAs(page, REGISTERED_STUDENT)
    await page.goto(`/labtool/courseregistration/${course.ohid}`)
    await expectNoLoader(page)
    await page.locator('input[name="github"]').fill(moved)
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.locator('.notification.success')).toBeVisible()

    const teacher = await newPageAs(browser, TEACHER)
    await teacher.page.goto(browseReviewsUrl)
    await expectNoLoader(teacher.page)
    const latest = teacher.page.locator('.studentHistory .changeHistoryEntry').first()
    await expect(latest).toContainText('Repository · ')
    await expect(latest).toContainText(`Repository http://github.com/e2e/project-${student} → ${moved}`)
    await expect(latest).toContainText('Maarit Mirja Opiskelija')
    await teacher.context.close()
  })

  test('Browse reviews shows the whole change history of the student, filterable', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    await page.locator(`a[href="${browseReviewsUrl}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`${browseReviewsUrl}$`))
    await expectNoLoader(page)

    const subjects = page.locator('.studentHistory .changeHistorySubject')
    await expect(subjects).toHaveText(['Repository · ', 'Week 3 · ', 'Week 3 · '])

    await page.locator('.changeHistoryFilters').getByRole('button', { name: 'Week reviews' }).click()
    await expect(subjects).toHaveText(['Week 3 · ', 'Week 3 · '])
    await page.locator('.changeHistoryFilters').getByRole('button', { name: 'Repository' }).click()
    await expect(subjects).toHaveText(['Repository · '])
  })
})
