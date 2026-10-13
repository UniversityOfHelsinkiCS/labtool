import { test, expect } from '../fixtures/test'
import { loginAs, newPageAs } from '../fixtures/auth'
import { COURSES, NOTIFICATIONS, REGISTERED_STUDENT, STUDENT_INSTANCES, TEACHER } from '../fixtures/data'
import { chooseDropdownOption, expectNoLoader, expectSuccess, openAccordion, waitForApi } from '../fixtures/helpers'

const course = COURSES.checklist
const studentInstance = STUDENT_INSTANCES.checklist

const TOPIC = 'Testing'
const CHECK_DESCRIPTION = 'Unit tests cover the core logic and run in CI.'
const CHECKBOX = 'Has unit tests'
const TEXT_WHEN_ON = 'Unit tests look good.'
const TEXT_WHEN_OFF = 'Please add unit tests.'

test.describe.serial('checklists', () => {
  test('a teacher creates a checklist for week 1', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/checklist/${course.ohid}/create`)
    await expect(page.getByText(course.name)).toBeVisible()
    await expectNoLoader(page)

    await Promise.all([waitForApi(page, 'checklist/getone'), chooseDropdownOption(page, page.locator('#weekDropdown'), 'Week 1')])
    await expectNoLoader(page)

    await page.getByRole('button', { name: 'Add new topic' }).click()
    await page.locator('.newTopicNameInput input').fill(TOPIC)
    await page.locator('.newTopicNameInput input').press('Enter')
    await expect(page.locator('.ui.header', { hasText: TOPIC })).toBeVisible()

    await page.getByRole('button', { name: 'Add new checkbox' }).click()
    await page.locator('.newRowNameInput input').fill(CHECKBOX)
    await page.locator('.newRowNameInput input').press('Enter')
    // each check can have a description, the kuvaus (#525)
    await page.locator('.checkDescriptionInput textarea').first().fill(CHECK_DESCRIPTION)

    const [checkedRow, uncheckedRow] = [page.locator('.checkTextRow').nth(0), page.locator('.checkTextRow').nth(1)]
    await checkedRow.locator('.numberField input').fill('3')
    await checkedRow.locator('.textField input').fill(TEXT_WHEN_ON)
    await uncheckedRow.locator('.numberField input').fill('0')
    await uncheckedRow.locator('.textField input').fill(TEXT_WHEN_OFF)
    await expect(page.locator('.totalPointsOfChecklist')).toHaveText('3')

    // the unsaved checklist can be previewed as it looks when grading
    await page.getByRole('button', { name: 'Preview' }).click()
    const preview = page.locator('.checklistPreview')
    await expect(preview.locator('.checklistCardRow', { hasText: CHECKBOX })).toContainText(CHECK_DESCRIPTION)
    await expect(preview.locator('.checklistOutputPoints')).toHaveText('points: 0')
    await preview.locator('.checklistCardRow', { hasText: CHECKBOX }).click()
    await expect(preview.locator('.checklistOutputPoints')).toHaveText('points: 3')
    await expect(preview.locator('textarea')).toHaveValue(new RegExp(TEXT_WHEN_ON))
    await preview.getByRole('button', { name: 'Close' }).click()
    await expect(preview).toBeHidden()

    await page.locator('.saveButton').first().click()
    await expectSuccess(page, NOTIFICATIONS.checklistSaved(1))
    await expect(page.locator('.saveButton').first()).toBeDisabled()

    // persisted
    await page.reload()
    await expectNoLoader(page)
    await expect(page.locator('.ui.header', { hasText: TOPIC })).toBeVisible()
    await expect(page.locator('.checkTextRow').nth(0).locator('.textField input')).toHaveValue(TEXT_WHEN_ON)
  })

  test('the checklist is used when reviewing week 1', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/reviewstudent/${course.ohid}/${studentInstance}/1`)
    await expect(page.getByRole('heading', { name: 'Week 1' })).toBeVisible()
    await expectNoLoader(page)

    await expect(page.getByRole('heading', { name: 'Checklist', exact: true })).toBeVisible()
    const card = page.locator('.checklistCard', { hasText: TOPIC })
    const row = card.locator('.checklistCardRow', { hasText: CHECKBOX })
    await expect(row.locator('.checkDescription')).toHaveText(CHECK_DESCRIPTION)
    await expect(row).toContainText('3 p / 0 p')
    await expect(page.locator('.checklistOutputPoints')).toHaveText('points: 0')
    await expect(page.locator('.checklistOutputText textarea, textarea.checklistOutputText').first()).toHaveValue(new RegExp(TEXT_WHEN_OFF))

    await row.click()
    await expect(row.locator('i.check')).toBeVisible()
    await expect(page.locator('.checklistOutputPoints')).toHaveText('points: 3')

    await page.getByRole('button', { name: /^Copy to review field/ }).click()
    await expect(page.getByRole('spinbutton')).toHaveValue('3')
    await expect(page.locator('textarea[name="comment"]')).toHaveValue(new RegExp(TEXT_WHEN_ON))

    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await expectSuccess(page, NOTIFICATIONS.weekReviewed)
    await expect(page.getByTestId(`student-row-${studentInstance}`)).toContainText('3')

    const student = await newPageAs(browser, REGISTERED_STUDENT)
    await student.page.goto(`/labtool/courses/${course.ohid}`)
    const week1 = student.page.locator('#reviewWeek1')
    await expect(week1).toContainText('points 3')
    await openAccordion(week1)
    await expect(week1.getByText(TEXT_WHEN_ON)).toBeVisible()
    await student.context.close()
  })

  test('a course without checklists copies all checklists of another course', async ({ page }) => {
    const target = COURSES.settings // has no checklists
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/checklist/${target.ohid}/create`)
    await expectNoLoader(page)

    const box = page.locator('.copyAllForm')
    await expect(box).toContainText('This course has no checklists yet')
    await chooseDropdownOption(page, box.locator('.copyAllDropdown'), course.name)
    await box.getByRole('button', { name: 'Copy all checklists' }).click()
    await expectSuccess(page, 'Copied 1 checklist: week 1.')
    await expect(box).toBeHidden()

    // the copy is saved: week 1 has the topic, the check and its description
    await page.reload()
    await expectNoLoader(page)
    await Promise.all([waitForApi(page, 'checklist/getone'), chooseDropdownOption(page, page.locator('#weekDropdown'), 'Week 1')])
    await expectNoLoader(page)
    await expect(page.locator('.ui.header', { hasText: TOPIC })).toBeVisible()
    await expect(page.locator('.checkDescriptionInput textarea').first()).toHaveValue(CHECK_DESCRIPTION)
  })
})
