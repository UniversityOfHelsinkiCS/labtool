import { test, expect } from '../fixtures/test'
import { loginAs } from '../fixtures/auth'
import { COURSES, REGISTERED_STUDENT, TEACHER } from '../fixtures/data'
import { expectNoLoader, expectSuccess } from '../fixtures/helpers'

// a course registered or imported by mistake can be marked invalid (#905)
const course = COURSES.staff

test.describe.serial('marking a course invalid', () => {
  test('the teacher marks the course invalid in the course settings', async ({ page }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/ModifyCourseInstancePage/${course.ohid}`)
    await expectNoLoader(page)

    await page.getByRole('button', { name: 'Mark course as invalid' }).click()
    const confirm = page.locator('.markInvalidConfirm')
    await expect(confirm).toContainText('Mark the course as invalid?')
    await confirm.getByRole('button', { name: 'Mark invalid' }).click()
    await expectSuccess(page, 'The course is marked invalid.')
    await expect(page.locator('.invalidCourse')).toContainText('This course is marked invalid')

    await page.goto(`/labtool/courses/${course.ohid}`)
    await expectNoLoader(page)
    await expect(page.locator('.invalidCourseBanner')).toContainText('This course is marked invalid')

    // struck through in the teacher's own courses, hidden by default in the course list
    await page.goto('/labtool/mypage')
    await expectNoLoader(page)
    await expect(page.locator('.invalidCourseName', { hasText: course.name })).toBeVisible()
    await page.goto('/labtool/courses')
    await expectNoLoader(page)
    await expect(page.getByText(course.name)).toHaveCount(0)
    await page.locator('.showInvalidCourses').click()
    await expect(page.locator('.invalidCourseName', { hasText: course.name })).toBeVisible()
  })

  test('the course disappears from its students', async ({ page }) => {
    await loginAs(page, REGISTERED_STUDENT)
    await page.goto('/labtool/mypage')
    await expectNoLoader(page)
    await expect(page.getByText(course.name)).toHaveCount(0)
    await page.goto('/labtool/courses')
    await expectNoLoader(page)
    await expect(page.getByText(course.name)).toHaveCount(0)
    await expect(page.locator('.showInvalidCourses')).toHaveCount(0)
  })

  test('the teacher restores the course and the students see it again', async ({ page, browser }) => {
    await loginAs(page, TEACHER)
    await page.goto(`/labtool/ModifyCourseInstancePage/${course.ohid}`)
    await expectNoLoader(page)
    await page.getByRole('button', { name: 'Restore course' }).click()
    await page.locator('.markInvalidConfirm').getByRole('button', { name: 'Restore course' }).click()
    await expectSuccess(page, 'The course is in use again.')

    const student = await browser.newPage()
    await loginAs(student, REGISTERED_STUDENT)
    await student.goto('/labtool/mypage')
    await expectNoLoader(student)
    await expect(student.getByText(course.name).first()).toBeVisible()
    await student.close()
  })
})
