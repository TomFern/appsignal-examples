const { appsignal } = require("./appsignal")
const { expressMiddleware, expressErrorHandler } = require("@appsignal/express")
const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(expressMiddleware(appsignal))

/* GET home page. */
app.get("/", function(req, res) {
  res.json({
    response: "ok"
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const tracer = appsignal.tracer()
  const span = tracer.currentSpan()

  tracer.withSpan(span.child("async_nested"), child => {
    child.close()
  })

  next(createError(404))
})

// error handler
app.use(expressErrorHandler(appsignal))

module.exports = app
