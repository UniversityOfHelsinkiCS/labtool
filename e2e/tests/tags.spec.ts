import { test, expect, Page } from '@playwright/test'
import { gotoWithSession, loginAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { chooseDropdownOption, expectNoLoader, expectSuccess } from '../fixtures/helpers'

const course = COURSES.tags
const tagged = STUDENT_INSTANCES.tags
const untagged = STUDENT_INSTANCES.tagsSecond
const TAG = 'e2e-needs-help'

const row = (page: Page, studentInstance: number) => page.getByTestId(`student-row-${studentInstance}`)
const tagLabel = (page: Page, studentInstance: number) => row(page, studentInstance).getByRole('button', { name: TAG, exact: true })

const openCoursePage = async (page: Page) => {
  await page.goto(`/labtool/courses/${course.ohid}`)
  await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
  await expectNoLoader(page)
}

test.describe.serial('tags', () => {
  test('a teacher creates a course tag', async ({ page }) => {
    await loginAs(page, TEACHER)
    await gotoWithSession(page, `/labtool/ManageTags/${course.ohid}`)
    await expect(page.getByRole('heading', { name: 'Add, modify or remove tags' })).toBeVisible()
    await expectNoLoader(page)
    await expect(page.getByRole('heading', { name: 'You are creating a new tag.' })).toBeVisible()

    await page.getByPlaceholder('Tag name').fill(TAG)
    await page.locator('select[name="color"]').selectOption('orange')
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expectSuccess(page, NOTIFICATIONS.tagSaved)
    await expect(page.getByRole('heading', { name: 'Course tags', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: TAG, exact: true })).toBeVisible()
  })

  test('a teacher tags a student, filters by the tag and removes it', async ({ page }) => {
    await loginAs(page, TEACHER)
    await openCoursePage(page)

    await expect(page.locator('.tagFilter')).toHaveCount(0)

    // tag
    await row(page, tagged).locator('#tagModify').click()
    await chooseDropdownOption(page, row(page, tagged).locator('#tagDropdown'), TAG)
    await expectSuccess(page, NOTIFICATIONS.studentTagged)
    await expect(tagLabel(page, tagged)).toBeVisible()
    await expect(tagLabel(page, untagged)).toHaveCount(0)

    // filter
    const filter = page.locator('.tagFilter').getByRole('button', { name: TAG, exact: true })
    await filter.click()
    await expect(row(page, tagged)).toBeVisible()
    await expect(row(page, untagged)).toHaveCount(0)
    await filter.click()
    await expect(row(page, untagged)).toBeVisible()

    // persisted
    await openCoursePage(page)
    await expect(tagLabel(page, tagged)).toBeVisible()

    // untag with the remove button next to the label
    await row(page, tagged).locator('.ui.buttons', { hasText: TAG }).getByRole('button').filter({ has: page.locator('i.remove.icon') }).click()
    await expectSuccess(page, NOTIFICATIONS.studentUntagged)
    await expect(tagLabel(page, tagged)).toHaveCount(0)

    await openCoursePage(page)
    await expect(tagLabel(page, tagged)).toHaveCount(0)
    await expect(page.locator('.tagFilter')).toHaveCount(0)
  })
})
