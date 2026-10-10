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
