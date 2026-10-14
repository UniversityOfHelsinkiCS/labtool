import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { gotoWithSession, loginAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { expectError, expectNoLoader, expectSuccess, openAccordion } from '../fixtures/helpers'

// The backend answers errors as { message }; the frontend shows that text in the red notification
// (labtool2.0/src/util/errorMessage.js). These are requests the browser's own form checks let
// through, so only the backend can refuse them.
const course = COURSES.messages
const TAG = 'e2e-duplicate'

const openManageTags = async (page: Page) => {
  await gotoWithSession(page, `/labtool/ManageTags/${course.ohid}`)
  await expect(page.getByRole('heading', { name: 'Add, modify or remove tags' })).toBeVisible()
  await expectNoLoader(page)
}

const saveTag = async (page: Page, name: string) => {
  await page.getByPlaceholder('Tag name').fill(name)
  await page.locator('select[name="color"]').selectOption('teal')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
}

test('a tag name of only spaces is refused with the message from the backend', async ({ page }) => {
  await loginAs(page, TEACHER)
  await openManageTags(page)

  await saveTag(page, '   ')

  await expectError(page, 'Tag name cannot be empty')
  await expect(page.getByRole('heading', { name: 'Course tags', exact: true })).toHaveCount(0)
})

test('a duplicate tag name is refused with the message from the backend', async ({ page }) => {
  await loginAs(page, TEACHER)
  await openManageTags(page)
  await saveTag(page, TAG)
  await expectSuccess(page, NOTIFICATIONS.tagSaved)
  await expect(page.getByRole('button', { name: TAG, exact: true })).toBeVisible()

  await saveTag(page, TAG)

  await expectError(page, `Tag ${TAG} already exists`)
  await expect(page.getByRole('button', { name: TAG, exact: true })).toHaveCount(1)
})

test('a code review link that is not a web address is refused with the message from the backend', async ({
  page
}) => {
  await loginAs(page, REGISTERED_STUDENT)
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expectNoLoader(page)
  const codeReview = page.locator('#reviewCodeReview1')
  await openAccordion(codeReview)
  await expect(codeReview.getByRole('link', { name: `http://github.com/e2e/project-${STUDENT_INSTANCES.messagesSecond}` })).toBeVisible()

  await codeReview.locator('input[name="reviewLink"]').fill('github.com/e2e/project/issues/1')
  await codeReview.getByRole('button', { name: 'Submit' }).click()

  await expectError(page, 'Review link could not be submitted: The link must start with either "http://" or "https://".')
  // still waiting for a link
  await expect(codeReview.locator('input[name="reviewLink"]')).toBeVisible()
  await expect(codeReview.getByText('Your review:')).toHaveCount(0)
})
