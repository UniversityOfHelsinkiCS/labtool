import { test, expect, Page } from '@playwright/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { ASSISTANT, COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess } from '../fixtures/helpers'

// Issues #1129 and #1132: course staff see who changed a student's grading or repository, and when.
// Uses weeks 3-4 of the grading course; grading-safety.spec.ts uses weeks 1-2.

const course = COURSES.grading
const student = STUDENT_INSTANCES.grading
const reviewUrl = (week: number) => `/labtool/reviewstudent/${course.ohid}/${student}/${week}`

const gradeWeek = async (page: Page, week: number, points: string, feedback: string) => {
  await page.goto(reviewUrl(week))
  await expectNoLoader(page)
  await expect(page.getByRole('heading', { name: `Week ${week}` })).toBeVisible()
  await page.locator('input[name="points"]').fill(points)
  await page.locator('textarea[name="comment"]').fill(feedback)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expectSuccess(page, NOTIFICATIONS.weekReviewed)
}

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
  const [latest, first] = [history.locator('.changeHistoryEntry').nth(0), history.locator('.changeHistoryEntry').nth(1)]
  await expect(latest).toContainText('Aatu Assistentti')
  await expect(latest).toContainText('Points 1 → 2')
  await expect(first).toContainText('Pää Opettaja')
  await expect(first).toContainText('Points – → 1')

  await latest.getByText('Show old and new text').click()
  await expect(latest).toContainText('First version of the feedback')
  await expect(latest).toContainText('Second version of the feedback')

  // another week has its own history
  await page.goto(reviewUrl(4))
  await expectNoLoader(page)
  await expect(page.locator('.changeHistory')).toContainText('No changes recorded yet')
})

test('course staff see when a student changes their repository', async ({ page }) => {
  const moved = 'https://github.com/e2e/moved-project'
  await loginAs(page, REGISTERED_STUDENT)
  await page.goto(`/labtool/courseregistration/${course.ohid}`)
  await expectNoLoader(page)
  await page.locator('input[name="github"]').fill(moved)
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page.locator('.notification.success')).toBeVisible()

  const teacher = await page.context().browser()!.newContext()
  const teacherPage = await teacher.newPage()
  await loginAs(teacherPage, TEACHER)
  await teacherPage.goto(`/labtool/browsereviews/${course.ohid}/${student}`)
  await expectNoLoader(teacherPage)
  const history = teacherPage.locator('.changeHistory', { hasText: 'Repository history' })
  await expect(history).toContainText(`Repository http://github.com/e2e/project-${student} → ${moved}`)
  await expect(history).toContainText('Maarit Mirja Opiskelija')
  await teacher.close()
})
