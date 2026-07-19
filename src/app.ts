import express, { type Application } from "express"

const app: Application = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get("/", (_req, res) => {
  res.json({
    message: "Express running on Bun! 🚀",
    uptime: process.uptime()
  })
})

export default app
