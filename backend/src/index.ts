import express from "express"
import { drizzle } from "drizzle-orm/node-postgres"
import { config } from "./config.js"

const app = express()
const db = drizzle(config.databaseUrl)
app.use(express.json())

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.listen(config.serverPort, () => {
    console.log(`Server running on http://localhost:${config.serverPort}`);
});