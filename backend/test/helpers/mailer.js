/*
 * The email controller only talks to SMTP when NODE_ENV is production/staging (it reads NODE_ENV once when
 * loaded); otherwise it just "simulates" sending. To exercise the real sending path we load a second copy of
 * the app whose email controller was required with NODE_ENV=production, while everything else (models, DB
 * config) stays the already-loaded test instance.
 *
 * SMTP is stubbed at the transport boundary: nodemailer.createTransport() returns a fake transport that
 * records the settings and messages. This relies only on nodemailer's public createTransport/sendMail API,
 * so it keeps working across nodemailer major versions.
 */
const nodemailer = require('nodemailer')
const supertest = require('supertest')
const { tokenFor } = require('./factories')

const appPath = require.resolve('../../app')
const emailControllerPath = require.resolve('../../server/controllers/email')
const emailRoutesPath = require.resolve('../../server/routes/emailRoutes')

let mailApp = null

const loadAppWithRealMailer = () => {
  if (mailApp) return mailApp
  const saved = [appPath, emailControllerPath, emailRoutesPath].map(path => [path, require.cache[path]])
  const originalEnv = process.env.NODE_ENV
  try {
    saved.forEach(([path]) => delete require.cache[path])
    process.env.NODE_ENV = 'production'
    require(emailControllerPath)
    process.env.NODE_ENV = originalEnv
    mailApp = require(appPath).app
  } finally {
    process.env.NODE_ENV = originalEnv
    // restore the original module instances for everybody else
    saved.forEach(([path, mod]) => {
      if (mod) require.cache[path] = mod
      else delete require.cache[path]
    })
  }
  return mailApp
}

/**
 * Replaces nodemailer.createTransport with a recording fake.
 * `rejectAll: true` makes the fake SMTP server reject every recipient.
 */
const stubMailTransport = ({ rejectAll = false } = {}) => {
  const original = nodemailer.createTransport
  const record = { transports: [], sent: [] }
  nodemailer.createTransport = (settings) => {
    record.transports.push(settings)
    return {
      sendMail: async (message) => {
        record.sent.push(message)
        const recipients = [].concat(message.to || [], message.bcc || [])
        return {
          messageId: `<test-${record.sent.length}@labtool.test>`,
          accepted: rejectAll ? [] : recipients,
          rejected: rejectAll ? recipients : []
        }
      }
    }
  }
  record.restore = () => {
    nodemailer.createTransport = original
  }
  return record
}

const mailApi = () => supertest(loadAppWithRealMailer())

const mailAs = (user) => {
  const token = tokenFor(user)
  return {
    post: url => mailApi()
      .post(url)
      .set('Authorization', `Bearer ${token}`)
  }
}

module.exports = {
  loadAppWithRealMailer,
  stubMailTransport,
  mailApi,
  mailAs
}
