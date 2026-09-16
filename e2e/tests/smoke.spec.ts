import { test, expect, Page } from '@playwright/test'
import { loginAs } from '../fixtures/auth'
import { COURSE, REGISTERED_STUDENT, REGISTERED_STUDENT_INSTANCE_ID, TEACHER, FakeUser } from '../fixtures/data'

type Route = {
  name: string
  user: FakeUser
  visit: (page: Page) => Promise<void>
  expected: (page: Page) => Promise<void>
}

const goto = (path: string) => async (page: Page) => {
  await page.goto(path)
}

const routes: Route[] = [
  {
    name: 'my page as a student',
    user: REGISTERED_STUDENT,
    visit: goto('/labtool/mypage'),
    expected: async page => expect(page.getByRole('heading', { name: 'My Courses (Student)' })).toBeVisible()
  },
  {
    name: 'course list as a student',
    user: REGISTERED_STUDENT,
    visit: goto('/labtool/courses'),
    expected: async page => expect(page.getByRole('heading', { name: 'Courses' })).toBeVisible()
  },
  {
    name: 'course page as a student',
    user: REGISTERED_STUDENT,
    visit: goto(`/labtool/courses/${COURSE.ohid}`),
    expected: async page => expect(page.locator('.ui.green.label', { hasText: 'Total Points' })).toBeVisible()
  },
  {
    name: 'course page as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/courses/${COURSE.ohid}`),
    expected: async page => expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
  },
  {
    name: 'browse reviews as a teacher',
    user: TEACHER,
    visit: async page => {
      await page.goto(`/labtool/courses/${COURSE.ohid}`)
      await expect(page.getByRole('heading', { name: 'Students', exact: true })).toBeVisible()
      await page.locator(`a[href="/labtool/browsereviews/${COURSE.ohid}/${REGISTERED_STUDENT_INSTANCE_ID}"]`).first().click()
    },
    expected: async page => expect(page.getByRole('button', { name: /reviews$/ })).toBeVisible()
  },
  {
    name: 'course settings as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/ModifyCourseInstancePage/${COURSE.ohid}`),
    expected: async page => expect(page.locator('form')).toBeVisible()
  },
  {
    name: 'admin page as a sysop',
    user: TEACHER,
    visit: goto('/labtool/admin'),
    expected: async page => expect(page.getByRole('link', { name: 'Admin' })).toBeVisible()
  }
]

for (const route of routes) {
  test(`${route.name} renders without errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))

    await loginAs(page, route.user)
    await route.visit(page)

    await route.expected(page)
    await expect(page.locator('.ui.active.loader')).toHaveCount(0)
    await expect(page.locator('.notification.error')).toHaveCount(0)

    expect(errors, `uncaught page errors on ${route.name}`).toEqual([])
  })
}
