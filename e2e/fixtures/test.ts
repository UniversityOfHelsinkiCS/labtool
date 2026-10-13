import { test as base, expect, Browser, BrowserContext, Response } from '@playwright/test'

// Every spec imports `test` and `expect` from here instead of '@playwright/test'.
//
// The automatic `errorGuard` fixture fails a test when, in any page it opened, the app threw an
// uncaught error (a crash, often a blank page) or the backend answered an API request with a 5xx
// status. It covers the default `page`/`context` and every context or page the test opens itself
// through `browser.newContext()` / `browser.newPage()` (e.g. `newPageAs`).
//
// A test that triggers one of these on purpose can allow it:
//   test.use({ allowedServerErrors: [/\/api\/something/], allowedPageErrors: [/some message/] })

type GuardOptions = {
  /** API URLs (matched against the full URL) whose 5xx responses do not fail the test. */
  allowedServerErrors: RegExp[]
  /** Uncaught page error messages that do not fail the test. */
  allowedPageErrors: RegExp[]
}

const watchContext = (context: BrowserContext, problems: string[], options: GuardOptions) => {
  context.on('weberror', webError => {
    const error = webError.error()
    const message = error.message
    if (options.allowedPageErrors.some(allowed => allowed.test(message))) {
      return
    }
    const url = webError.page()?.url() ?? 'unknown page'
    problems.push(`uncaught page error on ${url}: ${error.stack ?? message}`)
  })
  context.on('response', (response: Response) => {
    const url = response.url()
    if (response.status() < 500 || !url.includes('/api/')) {
      return
    }
    if (options.allowedServerErrors.some(allowed => allowed.test(url))) {
      return
    }
    problems.push(`server error ${response.status()} for ${response.request().method()} ${url}`)
  })
}

export const test = base.extend<GuardOptions & { errorGuard: void }>({
  allowedServerErrors: [[], { option: true }],
  allowedPageErrors: [[], { option: true }],

  errorGuard: [
    async ({ context, browser, allowedServerErrors, allowedPageErrors }, use, testInfo) => {
      const options = { allowedServerErrors, allowedPageErrors }
      const problems: string[] = []
      watchContext(context, problems, options)

      // contexts the test opens itself (newPageAs; browser.newPage() goes through newContext too)
      const originalNewContext = browser.newContext
      browser.newContext = async (...args: Parameters<Browser['newContext']>) => {
        const newContext = await originalNewContext.apply(browser, args)
        watchContext(newContext, problems, options)
        return newContext
      }

      try {
        await use()
      } finally {
        browser.newContext = originalNewContext
      }

      // a test that already failed or is expected to fail keeps its own error
      if (problems.length > 0 && testInfo.status === testInfo.expectedStatus && testInfo.expectedStatus === 'passed') {
        throw new Error(`The app had errors during the test:\n${problems.map(problem => `  - ${problem}`).join('\n')}`)
      }
    },
    { auto: true }
  ]
})

export { expect }
