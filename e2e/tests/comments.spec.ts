import { test, expect, Locator, Page } from '@playwright/test'
import { loginAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, REGISTERED_STUDENT, SEEDED_WEEKS, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'

const course = COURSES.comments
const studentInstance = STUDENT_INSTANCES.comments

const STUDENT_QUESTION = 'Could you clarify the feedback about the tests?'
const TEACHER_REPLY = 'Sure: add tests for the edge cases too.'
const HIDDEN_NOTE = 'Instructor-only note: follow up next week.'

const addComment = async (page: Page, week: Locator, text: string, { hidden = false } = {}) => {
  const addCommentAccordion = week.locator('.accordion', { has: page.getByText('Add comment', { exact: true }) })
  await openAccordion(addCommentAccordion)
  await addCommentAccordion.getByPlaceholder('Your comment...').fill(text)
  if (hidden) {
    await addCommentAccordion.locator('.ui.checkbox', { hasText: 'Add comment for instructors only' }).click()
  }
  await addCommentAccordion.getByRole('button', { name: 'Add Reply' }).click()
  await expectSuccess(page, NOTIFICATIONS.commentCreated)
}

const comment = (week: Locator, text: string) => week.locator('.comment', { hasText: text })

test.describe.serial('comments on a reviewed week', () => {
  test('a student comments on the review and notifies the instructor', async ({ page }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expectNoLoader(page)

    const week1 = page.locator('#reviewWeek1')
    await openAccordion(week1)
    await expect(week1.getByText(SEEDED_WEEKS.comments.feedback)).toBeVisible()
    await expect(week1.getByText('No comments')).toBeVisible()

    await addComment(page, week1, STUDENT_QUESTION)

    const question = comment(week1, STUDENT_QUESTION)
    await expect(question).toBeVisible()
    await expect(question).toContainText(`${REGISTERED_STUDENT.first_names} ${REGISTERED_STUDENT.last_name}`)

    // the backend only simulates sending outside production/staging
    await question.getByRole('button', { name: 'Send email notification' }).click()
    await expectSuccess(page, NOTIFICATIONS.emailSimulated)
    await expect(question.getByText('Notified')).toBeVisible()
  })

  test('the teacher sees the new comment, replies and adds an instructor-only note', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
    await expect(page.getByTestId(`week-review-${studentInstance}-1`).locator('i.comments.icon')).toBeVisible()

    await page.goto(`/labtool/browsereviews/${course.ohid}/${studentInstance}`)
    await expectNoLoader(page)
    const week1 = page.locator('#reviewWeek1')
    await openAccordion(week1)
    await expect(comment(week1, STUDENT_QUESTION)).toBeVisible()

    await addComment(page, week1, TEACHER_REPLY)
    await expect(comment(week1, TEACHER_REPLY)).toBeVisible()

    await addComment(page, week1, HIDDEN_NOTE, { hidden: true })
    const note = comment(week1, HIDDEN_NOTE)
    await expect(note).toBeVisible()
    await expect(note).toContainText('Hidden')

    // replying marked the student's comment as read
    await expect(week1.getByText('You have read all comments')).toBeVisible()
  })

  test('the student sees the reply but not the instructor-only note', async ({ page }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await page.goto(`/labtool/courses/${course.ohid}`)
    await expectNoLoader(page)

    const week1 = page.locator('#reviewWeek1')
    await openAccordion(week1)
    await expect(comment(week1, STUDENT_QUESTION)).toBeVisible()
    await expect(comment(week1, TEACHER_REPLY)).toBeVisible()
    await expect(comment(week1, TEACHER_REPLY)).toContainText(`${TEACHER.first_names} ${TEACHER.last_name}`)
    await expect(week1.getByText(HIDDEN_NOTE)).toHaveCount(0)
  })
})
