import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { config } from "../config.js";

// queue should maintain a separate redis connection (per docs)
const queueConnection = new Redis(config.redisUrl)

export const emailQueue = new Queue('emails', {
    connection: queueConnection
})
