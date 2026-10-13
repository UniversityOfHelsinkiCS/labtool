import { expect, Locator, Page, Response } from '@playwright/test'

/**
 * Resolves with the first non-preflight response whose URL contains `/api/<fragment>`.
 * Start waiting *before* triggering the action that sends the request.
 */
export const waitForApi = (page: Page, fragment: string, method?: string): Promise<Response> =>
  page.waitForResponse(
    response =>
      response.url().includes(`/api/${fragment}`) &&
      response.request().method() !== 'OPTIONS' &&
      (!method || response.request().method() === method.toUpperCase())
  )

/** No Semantic UI loader spinner is shown. */
export const expectNoLoader = async (page: Page) => {
  await expect(page.locator('.ui.active.loader')).toHaveCount(0)
}

export const expectSuccess = async (page: Page, message: string | RegExp) => {
  await expect(page.locator('.notification.success')).toHaveText(message)
}

/**
 * Opens a page through an in-app link or button and waits until the data the page refetches
 * on mount has arrived. Pages like ReviewStudent first render with whatever the redux store
 * still holds from the previous page and then reset and refetch; typing into the form during
 * that window is lost, so tests must wait for the refetch before interacting.
 */
export const clickAndWaitForApi = async (page: Page, click: () => Promise<void>, fragments: string[]) => {
  await Promise.all([...fragments.map(fragment => waitForApi(page, fragment)), click()])
  await expectNoLoader(page)
}

/** Picks an option from a Semantic UI (non-native) dropdown. */
export const chooseDropdownOption = async (page: Page, dropdown: Locator, optionText: string | RegExp) => {
  await dropdown.click()
  await dropdown.getByRole('option', { name: optionText }).click()
}

/**
 * Opens a Semantic UI accordion (e.g. `#reviewWeek1`) unless it is already open. Some week
 * accordions start open (the current week on the student course page), so blindly clicking
 * the title could close them.
 */
export const openAccordion = async (accordion: Locator) => {
  const title = accordion.locator(':scope > .title').first()
  await expect(title).toBeVisible()
  if (!/\bactive\b/.test((await title.getAttribute('class')) ?? '')) {
    await title.click()
  }
  await expect(title).toHaveClass(/\bactive\b/)
}

/**
 * A red error notification shows exactly `message`, e.g. the `{ message }` the backend answered
 * with, and nothing like `[object Object]` or `undefined` from a misread error body.
 */
export const expectError = async (page: Page, message: string | RegExp) => {
  const notification = page.locator('.notification.error')
  await expect(notification).toHaveText(message)
  await expect(notification).not.toContainText('[object Object]')
  await expect(notification).not.toContainText('undefined')
}
