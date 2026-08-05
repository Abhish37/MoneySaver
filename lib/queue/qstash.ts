import { Client } from '@upstash/qstash'

export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || 'dummy_token',
})

export type QueueJob<T> = {
  type: string
  payload: T
}

export const enqueueJob = async <T>(
  url: string,
  job: QueueJob<T>,
  options?: { delay?: number; retries?: number }
) => {
  if (!process.env.QSTASH_TOKEN) {
    console.warn('[QStash] Token missing. Skipping queue job:', job.type)
    return null
  }

  return qstashClient.publishJSON({
    url,
    body: job,
    delay: options?.delay,
    retries: options?.retries ?? 3,
  })
}
