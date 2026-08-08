import { Worker, type Job } from "bullmq"
import nodemailer from "nodemailer"
import { eq } from "drizzle-orm"
import { config } from "./config.js"
import { emailJobTable } from "./db/schema.js"
import { db } from "./db/db.js"
import { redisClientConn } from "./lib/redis.js"
import { emailQueue } from "./lib/queue.js"

const transporter = nodemailer.createTransport({
    host: config.ethereal.host,
    port: config.ethereal.port,
    auth: {
        user: config.ethereal.username,
        pass: config.ethereal.password,
    },
})

async function getHourWindow(): Promise<string> {
    const now = new Date()
    // example- "2024-08-08T15" : unique per sender+hour for Redis key
    return now.toISOString().slice(0, 13)
}

async function processEmail(job: Job<{ emailJobId: number }>) {
    const { emailJobId } = job.data

    const rows = await db.select().from(emailJobTable).where(eq(emailJobTable.id, emailJobId)).limit(1)

    const emailJob = rows[0]
    if (!emailJob) {
        console.warn(`[worker]: Job ${job.id}: emailJob ${emailJobId} not found in DB, skipping`)
        return
    }

    if (emailJob.status === "sent") {
        console.log(`[worker]: Job ${job.id}: emailJob ${emailJobId} already sent, skipping`)
        return
    }

    // 
    const hourWindow = await getHourWindow()
    const redisKey = `sender:${emailJob.senderId}:${hourWindow}`
    const count = await redisClientConn.incr(redisKey)
    if (count === 1) await redisClientConn.expire(redisKey, 3600)
    if (count > config.maxEmailsPerHour) {
        // Re-enqueue at the start of the next hour instead of failing
        const nextHour = new Date()
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
        const delay = nextHour.getTime() - Date.now()
        await emailQueue.add("send-email", { emailJobId }, { delay })
        console.log(`[worker]: Rate limit hit for sender ${emailJob.senderId}, re-enqueued in ${delay}ms`)
        return
    }

    try {
        await transporter.sendMail({
            from: `"ReachInbox" <${config.ethereal.username}>`,
            to: emailJob.recipient,
            subject: emailJob.subject,
            text: emailJob.body,
        })

        await db
            .update(emailJobTable)
            .set({ status: "sent", sentAt: new Date() })
            .where(eq(emailJobTable.id, emailJobId))

        console.log(`[worker]: Job ${job.id}: emailJob ${emailJobId} sent successfully`)
    } catch (err) {
        //maybe let BullMQ handle retries if required/configured
        await db
            .update(emailJobTable)
            .set({ status: "failed" })
            .where(eq(emailJobTable.id, emailJobId))

        console.error(`[worker]: Job ${job.id}: emailJob ${emailJobId} failed`, err)
        throw err
    }
}

export const worker = new Worker<{ emailJobId: number }>(
    "emails",
    processEmail,
    {
        connection: redisClientConn,
        concurrency: config.workerConcurrency,
        // ensuring a min gap of minDelayMs while processing multiple sends
        limiter: { max: 1, duration: config.minDelayMs },
        autorun: false,
    }
)

worker.on("completed", (job) => {
    console.log(`[worker]: Completed job ${job.id}`)
})

worker.on("failed", (job, err) => {
    console.error(`[worker]: Failed job ${job?.id}:`, err.message)
})

worker.on("error", (err) => {
    console.error("[worker]: Worker error:", err)
})
console.log("[worker]:Worker successfully started...")
worker.run()