const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")

require("dotenv").config()

const logger = require("./lib/logger")

const restRoutes = require("./routes/rest")
const app = express()

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV !== "development") {
  app.use(helmet())
}
app.use(cors())

app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use((req, res, next) => { req.logger = logger; return next() })

app.use(`/api/v${process.env.API_VERSION}`, restRoutes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err)
  res.status(err.status || 500).json({ error: true, message: err.message })
})

module.exports = app
