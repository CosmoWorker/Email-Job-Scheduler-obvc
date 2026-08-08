import { Redis } from "ioredis";
import { config } from "../config.js";


export const redisClientConn = new Redis(config.redisUrl, { maxRetriesPerRequest: null })