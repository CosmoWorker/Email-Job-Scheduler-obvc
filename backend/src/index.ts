import express from "express"
import cors from "cors"
import { config } from "./config.js"
import jobsRouter from "./routes/jobs.js"

const app = express()
app.use(cors({ origin: config.clientCorsOriginUrl }))
app.use(express.json())

app.use("/jobs", jobsRouter)

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.listen(config.serverPort, () => {
    console.log(`Server running on http://localhost:${config.serverPort}`);
});