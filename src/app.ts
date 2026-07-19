import express, { type Application } from "express"
import cors from "cors"
import helmet from "helmet"
import { env } from "./config/env"

const app: Application = express()

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
)
app.use(
  helmet({
    xXssProtection: true
  })
)
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))

app.get("/", (_req, res) => {
  res.json({
    message: "Express running on Bun! 🚀",
    uptime: process.uptime()
  })
})

export default app
