/*
 * The email controller only talks to SMTP in production/staging or when SMTP_HOST is set (it reads the
 * environment once when loaded); otherwise it just "simulates" sending. To exercise the real sending path we
 * load another copy of the app whose email controller was required with the given environment (by default
 * NODE_ENV=production), while everything else (models, DB config) stays the already-loaded test instance.
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

const mailApps = {}

const loadAppWithRealMailer = (env = { NODE_ENV: 'production' }) => {
  const key = JSON.stringify(env)
  if (mailApps[key]) return mailApps[key]
  const saved = [appPath, emailControllerPath, emailRoutesPath].map(path => [path, require.cache[path]])
  const originalEnv = Object.fromEntries(Object.keys(env).map(name => [name, process.env[name]]))
  const restoreEnv = () => Object.entries(originalEnv).forEach(([name, value]) => {
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  })
  try {
    saved.forEach(([path]) => delete require.cache[path])
    Object.assign(process.env, env)
    require(emailControllerPath)
    restoreEnv()
    mailApps[key] = require(appPath).app
  } finally {
    restoreEnv()
    // restore the original module instances for everybody else
    saved.forEach(([path, mod]) => {
      if (mod) require.cache[path] = mod
      else delete require.cache[path]
    })
  }
  return mailApps[key]
}

/**
 * Replaces nodemailer.createTransport with a recording fake that behaves like nodemailer with a real
 * SMTP server: rejected recipients are listed in `rejected`, and when every recipient is rejected
 * sendMail throws an EENVELOPE error that carries the rejected addresses.
 * `rejectAll: true` rejects every recipient; `reject: [addresses]` rejects only those.
 */
const stubMailTransport = ({ rejectAll = false, reject = [] } = {}) => {
  const original = nodemailer.createTransport
  const record = { transports: [], sent: [] }
  nodemailer.createTransport = (settings) => {
    record.transports.push(settings)
    return {
      sendMail: async (message) => {
        const recipients = [].concat(message.to || [], message.bcc || [])
        const rejected = recipients.filter(address => rejectAll || reject.includes(address))
        const accepted = recipients.filter(address => !rejected.includes(address))
        if (accepted.length === 0) {
          const error = new Error('Can\'t send mail - all recipients were rejected')
          error.code = 'EENVELOPE'
          error.rejected = rejected
          throw error
        }
        record.sent.push(message)
        return {
          messageId: `<test-${record.sent.length}@labtool.test>`,
          accepted,
          rejected
        }
      }
    }
  }
  record.restore = () => {
    nodemailer.createTransport = original
  }
  return record
}

const mailApi = env => supertest(loadAppWithRealMailer(env))

const mailAs = (user, env) => {
  const token = tokenFor(user)
  return {
    post: url => mailApi(env)
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
