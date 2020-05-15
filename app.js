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
  appsignal.metrics().incrementCounter("visit", 1)

  const tracer = appsignal.tracer()
  const span = tracer.currentSpan()

  tracer.withSpan(span.child(), child => {
    child
      .setName("Child span name")
      .setCategory("name.child_category")
      .setSQL("SELECT * FROM BLA WHERE user=1");

    tracer.withSpan(child.child(), deeper => {
      deeper
        .setName("Child child span name")
        .setCategory("deeper.child_category")
        .setSQL("SELECT * FROM AAA WHERE user=1")
        .close()
    })

    child.close();
  })

  res.json({
    response: "ok"
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const tracer = appsignal.tracer()
  const span = tracer.currentSpan()

  tracer.withSpan(span.child(), child => {
    child
      .setName("async_nested")
      .close()
  })

  next(createError(404))
})

// error handler
app.use(expressErrorHandler(appsignal))

module.exports = app
