import express from "express"
import { drizzle } from "drizzle-orm/node-postgres"
import { config } from "./config.js"
import { Queue } from "bullmq"
import jobsRouter from "./routes/jobs.js"
import { Redis } from "ioredis"

const app = express()
app.use(express.json())
export const db = drizzle(config.databaseUrl)
export const redisClientConn = new Redis(config.redisUrl, { maxRetriesPerRequest: null })

export const emailQueue = new Queue('emails', {
    connection: redisClientConn
})

app.use("/jobs", jobsRouter)

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.listen(config.serverPort, () => {
    console.log(`Server running on http://localhost:${config.serverPort}`);
});