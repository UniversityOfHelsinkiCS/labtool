import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { ASSISTANT, COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'

// The final review is stored as the week after the last one. Its results stay hidden from students
// until the teacher shows them in the course settings. The student is assigned to the teacher, so
// only the teacher edits the review notes; the assistant adds review notes of their own.
const course = COURSES.finalReview
const studentInstance = STUDENT_INSTANCES.finalReview
const finalWeek = course.weekAmount + 1
const reviewUrl = `/labtool/reviewstudent/${course.ohid}/${studentInstance}/${finalWeek}`

const POINTS = '2'
const GRADE = '4'
const FEEDBACK = 'A solid project, well done.'
const TEACHER_NOTES = 'Teacher notes: grade 4 agreed with the assistant.'
const ASSISTANT_NOTE = 'Assistant note: the tests were thorough.'

const openSettings = async (page: Page) => {
  await page.goto(`/labtool/ModifyCourseInstancePage/${course.ohid}`)
  await expect(page.getByRole('heading', { name: `Edit course: ${course.name}` })).toBeVisible()
  await expectNoLoader(page)
}

const openReview = async (page: Page) => {
  await page.goto(reviewUrl)
  await expectNoLoader(page)
  await expect(page.getByRole('heading', { name: 'Final Review', exact: true }).first()).toBeVisible()
}

const visibilityStatus = (page: Page) => page.locator('.finalReviewVisibilityStatus')

const openStudentCoursePage = async (page: Page) => {
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expectNoLoader(page)
  await expect(page.locator('.ui.green.label', { hasText: 'Total Points' })).toBeVisible()
}

test.describe.serial('final review', () => {
  test('a teacher enables the final review; its results start hidden', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openSettings(page)
    await expect(page.locator('.finalReviewVisibility')).toHaveCount(0)

    await page.locator('.ui.checkbox', { hasText: 'Course has a final review' }).click()
    await expect(visibilityStatus(page)).toHaveText('Final review results are hidden from students.')
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expectSuccess(page, NOTIFICATIONS.courseUpdated)
    await openSettings(page)
    await expect(page.locator('.ui.checkbox', { hasText: 'Course has a final review' })).toHaveClass(/\bchecked\b/)
    await expect(visibilityStatus(page)).toHaveText('Final review results are hidden from students.')
  })

  test('the teacher grades the final review with a grade and review notes', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openReview(page)
    await expect(page.locator('.finalReviewHidden')).toContainText('The final review is hidden from students.')
    await expect(page.locator('.assignedInstructor')).toContainText('(you)')

    await page.locator('input[name="points"]').fill(POINTS)
    await page.locator('input[name="grade"]').fill(GRADE)
    await page.locator('textarea[name="comment"]').fill(FEEDBACK)
    await page.locator('textarea[name="instructorNotes"]').fill(TEACHER_NOTES)
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expectSuccess(page, NOTIFICATIONS.weekReviewed)
    await page.goto(`/labtool/browsereviews/${course.ohid}/${studentInstance}`)
    await expectNoLoader(page)
    const finalReview = page.locator('#reviewFinal')
    await expect(finalReview.locator('.reviewTitle')).toContainText(`points ${POINTS}`)
    await expect(finalReview.locator('.reviewTitle')).toContainText(`grade ${GRADE}`)
    await expect(finalReview.locator('.reviewTitle')).toContainText('Hidden from students')
  })

  test('an assistant adds a review note of their own', async ({ page, browser }) => {
    await loginAs(page, ASSISTANT)
    await openReview(page)

    // only the assigned instructor (the teacher) edits the review notes
    const locked = page.locator('.lockedNotes')
    await expect(locked).toContainText(`Review notes by ${TEACHER.first_names} ${TEACHER.last_name}`)
    await expect(locked).toContainText(TEACHER_NOTES)
    await expect(page.locator('textarea[name="instructorNotes"]')).toHaveCount(0)

    await locked.locator('textarea[name="reviewNote"]').fill(ASSISTANT_NOTE)
    await locked.getByRole('button', { name: 'Add note' }).click()

    await expectSuccess(page, NOTIFICATIONS.reviewNoteAdded)
    const note = locked.locator('.reviewNote')
    await expect(note).toContainText(`${ASSISTANT.first_names} ${ASSISTANT.last_name}`)
    await expect(note).toContainText(ASSISTANT_NOTE)

    // the teacher sees the note with the review
    const teacher = await newPageAs(browser, TEACHER)
    await teacher.page.goto(`/labtool/browsereviews/${course.ohid}/${studentInstance}`)
    await expectNoLoader(teacher.page)
    const finalReview = teacher.page.locator('#reviewFinal')
    await openAccordion(finalReview)
    await expect(finalReview.locator('.additionalReviewNotes')).toContainText(ASSISTANT_NOTE)
    await teacher.context.close()
  })

  test('the student does not see the hidden final review', async ({ page }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await openStudentCoursePage(page)

    await expect(page.getByText('Final Review', { exact: true })).toBeVisible()
    await expect(page.locator('#reviewFinal')).toHaveCount(0)
    await expect(page.getByText(FEEDBACK)).toHaveCount(0)
    await expect(page.getByText(`grade ${GRADE}`)).toHaveCount(0)
  })

  test('once the teacher shows the final review, the student sees it but no review notes', async ({ page, browser }) => {
    const teacher = await newPageAs(browser, TEACHER)
    await openSettings(teacher.page)
    await teacher.page.locator('.finalReviewVisibility .ui.checkbox').click()
    const confirm = teacher.page.locator('.finalReviewVisibilityConfirm')
    await expect(confirm).toContainText('Show final review results to students?')
    await confirm.getByRole('button', { name: 'Show to students' }).click()
    await expect(visibilityStatus(teacher.page)).toHaveText(
      'Students see their final review: points, grade, feedback and comments.'
    )
    await teacher.page.getByRole('button', { name: 'Save', exact: true }).click()
    await expectSuccess(teacher.page, NOTIFICATIONS.courseUpdated)
    await teacher.context.close()

    await loginAs(page, REGISTERED_STUDENT)
    await openStudentCoursePage(page)
    const finalReview = page.locator('#reviewFinal')
    await expect(finalReview.locator('.reviewTitle')).toContainText(`grade ${GRADE}`)
    await expect(finalReview.locator('.reviewTitle')).not.toContainText('Hidden from students')
    await openAccordion(finalReview)
    await expect(finalReview).toContainText(FEEDBACK)
    await expect(finalReview).not.toContainText(TEACHER_NOTES)
    await expect(finalReview).not.toContainText(ASSISTANT_NOTE)
  })
})
