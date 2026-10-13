import { Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { loginAs } from '../fixtures/auth'
import {
  COURSE,
  REGISTERED_STUDENT,
  REGISTERED_STUDENT_INSTANCE_ID,
  SEEDED_REVIEWED_REPO,
  TEACHER,
  FakeUser
} from '../fixtures/data'

// Every page is opened directly at the start of a session, as when following a bookmark.
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
    expected: async page => expect(page.getByRole('button', { name: /all reviews$/ })).toBeVisible()
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
  },
  {
    name: 'project info form as a student',
    user: REGISTERED_STUDENT,
    visit: goto(`/labtool/courseregistration/${COURSE.ohid}`),
    expected: async page => {
      await expect(page.getByRole('heading', { name: `Update your info for ${COURSE.name}` })).toBeVisible()
      await expect(page.locator('input[name="github"]')).toHaveValue('http://github.com/e2e/e2e-project')
    }
  },
  {
    name: 'course staff as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/ModifyCourseInstanceStaff/${COURSE.ohid}`),
    expected: async page => expect(page.getByRole('heading', { name: 'Add and remove assistants' })).toBeVisible()
  },
  {
    name: 'code review settings as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/ModifyCourseInstanceCodeReviews/${COURSE.ohid}`),
    expected: async page => {
      await expect(page.getByRole('heading', { name: COURSE.name })).toBeVisible()
      await expect(page.getByTestId(`student-row-${REGISTERED_STUDENT_INSTANCE_ID}`)).toBeVisible()
    }
  },
  {
    name: 'tag management as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/ManageTags/${COURSE.ohid}`),
    expected: async page => expect(page.getByRole('heading', { name: 'Add, modify or remove tags' })).toBeVisible()
  },
  {
    name: 'checklist creation as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/checklist/${COURSE.ohid}/create`),
    expected: async page => expect(page.locator('#weekDropdown')).toBeVisible()
  },
  {
    name: 'mass email as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/massemail/${COURSE.ohid}`),
    expected: async page => {
      await expect(page.getByRole('heading', { name: 'Send email to students' })).toBeVisible()
      await expect(page.getByTestId(`student-row-${REGISTERED_STUDENT_INSTANCE_ID}`)).toBeVisible()
    }
  },
  {
    name: 'course import as a sysop',
    user: TEACHER,
    visit: goto('/labtool/courseimport'),
    expected: async page => expect(page.getByRole('heading', { name: 'Import courses' })).toBeVisible()
  },
  {
    name: 'code review grading as a teacher',
    user: TEACHER,
    visit: goto(`/labtool/reviewstudentcr/${COURSE.ohid}/${REGISTERED_STUDENT_INSTANCE_ID}/1`),
    expected: async page => {
      await expect(page.getByRole('heading', { name: 'Code Review 1' })).toBeVisible()
      await expect(page.locator(`a[href="${SEEDED_REVIEWED_REPO}"]`)).toBeVisible()
    }
  }
]

for (const route of routes) {
  // uncaught page errors and server errors fail the test through the error guard (fixtures/test.ts)
  test(`${route.name} renders without errors`, async ({ page }) => {
    await loginAs(page, route.user)
    await route.visit(page)

    await route.expected(page)
    await expect(page.locator('.ui.active.loader')).toHaveCount(0)
    await expect(page.locator('.notification.error')).toHaveCount(0)
  })
}
