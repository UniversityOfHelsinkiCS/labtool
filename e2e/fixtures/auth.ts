import { Browser, Page, expect } from '@playwright/test'
import { FakeUser } from './data'

const toShibboData = (user: FakeUser) => {
  const givenNames = user.first_names.split(' ')
  const givenName = (givenNames.find(name => name.charAt(0) === '*') ?? givenNames[0]).replace('*', '')

  return {
    uid: user.username,
    employeenumber: `123${user.student_number}`,
    // users without an email address get no mail header at all, like from Shibboleth
    ...(user.email ? { mail: user.email } : {}),
    hypersonstudentid: user.student_number,
    givenname: givenName,
    sn: user.last_name
  }
}

/** Logs in as `user` on every page load of this page (an init script re-sets the fake Shibboleth data). */
export const loginAs = async (page: Page, user: FakeUser) => {
  await page.addInitScript(data => {
    window.localStorage.setItem('fake-shibbo-data', JSON.stringify(data))
  }, toShibboData(user))
}

/**
 * Logs in as `user` once, without an init script, so that logging out sticks across reloads.
 * Leaves the page on `path`.
 */
export const loginOnceAs = async (page: Page, user: FakeUser, path = '/labtool/mypage') => {
  await page.goto(path)
  await page.evaluate(data => {
    window.localStorage.setItem('fake-shibbo-data', JSON.stringify(data))
  }, toShibboData(user))
  await page.reload()
}

export const logout = async (page: Page) => {
  await page.evaluate(() => {
    window.localStorage.removeItem('fake-shibbo-data')
    window.localStorage.removeItem('loggedLabtool')
  })
}

/** Opens a page in a fresh browser context logged in as `user`; close the context when done. */
export const newPageAs = async (browser: Browser, user: FakeUser) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginAs(page, user)
  return { page, context }
}

/**
 * Navigates to `path` with an already established session (token stored in localStorage).
 *
 * Some pages (e.g. ManageTags, ModifyCourseInstanceStaff, CourseImport) are only tested after
 * logging in on my page first. BrowseReviews and the code review settings page used to crash when
 * opened directly at the start of a session; they are fixed and their specs navigate directly.
 */
export const gotoWithSession = async (page: Page, path: string) => {
  await page.goto('/labtool/mypage')
  await expect(page.getByRole('button', { name: /^Logout \(/ })).toBeVisible()
  await page.goto(path)
}
