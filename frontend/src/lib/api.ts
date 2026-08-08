import type { EmailJobWithSender, ScheduleJobPayload } from '@/types'

const BASE_URL = import.meta.env.VITE_API_SERVER_URL ?? 'http://localhost:3000'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  getScheduled: () => request<EmailJobWithSender[]>('/jobs/scheduled'),
  getSent: () => request<EmailJobWithSender[]>('/jobs/sent'),
  scheduleJob: (payload: ScheduleJobPayload) =>
    request<{ message: string }>('/jobs/schedule', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
