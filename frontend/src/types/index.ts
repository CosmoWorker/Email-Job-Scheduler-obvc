// mimics the drizzle db schema like how we want
export interface Sender {
  id: number
  name: string
  email: string
  createdAt: string | null
}

export interface EmailJob {
  id: number
  senderId: number
  recipient: string
  subject: string
  body: string
  status: 'pending' | 'scheduled' | 'sent' | 'failed'
  scheduledAt: string
  sentAt: string | null
}

// Shape returned by leftJoin queries in jobs.ts
export interface EmailJobWithSender {
  email_job: EmailJob
  sender: Sender | null
}

// Shape for POST /jobs/schedule request body
export interface ScheduleJobPayload {
  senderName: string
  senderEmail: string
  recipient: string
  subject: string
  body: string
  scheduledAt: string
}
