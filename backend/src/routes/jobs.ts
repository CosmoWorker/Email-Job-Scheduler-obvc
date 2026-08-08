import { Router } from "express"
import { emailJobTable, senderTable } from "../db/schema.js"
import { eq } from "drizzle-orm"
import { db } from "../db/db.js"
import { emailQueue } from "../lib/queue.js"

const router: Router = Router()

router.post("/schedule", async (req, res) => {
    const { senderName, senderEmail, recipient, subject, body, scheduledAt } = req.body
    const senderEmailExists = await db.select().from(senderTable).where(eq(senderTable.email, senderEmail)).limit(1)
    let senderId: number
    if (senderEmailExists.length > 0) {
        senderId = senderEmailExists[0]!.id
    }
    else {
        const result = await db.insert(senderTable).values({
            name: senderName,
            email: senderEmail,
        }).returning({ id: senderTable.id })

        senderId = result[0]!.id
    }
    const newJob = await db.insert(emailJobTable).values({
        senderId,
        recipient,
        subject,
        body,
        scheduledAt,
        status: "scheduled",
    }).returning({ id: emailJobTable.id })

    await emailQueue.add("send-email", { emailJobId: newJob[0]!.id }, { delay: new Date(scheduledAt).getTime() - Date.now() })
    res.status(200).json({ message: "Job scheduled successfully" })
})

router.get("/scheduled", async (_, res) => {
    // join to return with sender details
    const emailJobsWithSender = await db.select().from(emailJobTable).where(eq(emailJobTable.status, "scheduled")).limit(10).leftJoin(senderTable, eq(emailJobTable.senderId, senderTable.id))
    res.status(200).json(emailJobsWithSender)
})

router.get("/sent", async (_, res) => {
    const emailJobsWithSender = await db.select().from(emailJobTable).where(eq(emailJobTable.status, "sent")).limit(10).leftJoin(senderTable, eq(emailJobTable.senderId, senderTable.id))
    res.status(200).json(emailJobsWithSender)
})

export default router
