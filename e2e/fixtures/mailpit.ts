// Mailpit is the e2e stack's mail server (docker-compose.e2e.yml). It catches every email the
// backend sends, and rejects recipients outside the allowed domains, e.g. bounce@rejected.test.
// API: https://mailpit.axllent.org/docs/api-v1/

export const MAILPIT_URL = process.env.E2E_MAILPIT_URL ?? 'http://localhost:8026'

export type Mail = {
  subject: string
  recipients: string[]
}

type Address = { Address: string }
type MailpitMessage = { Subject: string; To: Address[] | null; Cc: Address[] | null; Bcc: Address[] | null }

export const clearInbox = async () => {
  await fetch(`${MAILPIT_URL}/api/v1/messages`, { method: 'DELETE' })
}

/** All caught mails whose subject contains `subject` (e.g. a course name), newest first. */
export const mailsWithSubject = async (subject: string): Promise<Mail[]> => {
  const response = await fetch(`${MAILPIT_URL}/api/v1/messages?limit=200`)
  const { messages } = (await response.json()) as { messages: MailpitMessage[] }
  return messages
    .filter(message => message.Subject.includes(subject))
    .map(message => ({
      subject: message.Subject,
      recipients: [...(message.To ?? []), ...(message.Cc ?? []), ...(message.Bcc ?? [])].map(a => a.Address)
    }))
}
