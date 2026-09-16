import { Page } from '@playwright/test'
import { FakeUser } from './data'

const toShibboData = (user: FakeUser) => {
  const givenNames = user.first_names.split(' ')
  const givenName = (givenNames.find(name => name.charAt(0) === '*') ?? givenNames[0]).replace('*', '')

  return {
    uid: user.username,
    employeenumber: `123${user.student_number}`,
    mail: user.email,
    hypersonstudentid: user.student_number,
    givenname: givenName,
    sn: user.last_name
  }
}

export const loginAs = async (page: Page, user: FakeUser) => {
  await page.addInitScript(data => {
    window.localStorage.setItem('fake-shibbo-data', JSON.stringify(data))
  }, toShibboData(user))
}

export const logout = async (page: Page) => {
  await page.evaluate(() => {
    window.localStorage.removeItem('fake-shibbo-data')
    window.localStorage.removeItem('loggedLabtool')
  })
}
