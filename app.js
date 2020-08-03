const { appsignal } = require("./appsignal")

// tom: try pg db
const pgPlugin = require("@appsignal/pg");
appsignal.instrument(pgPlugin);
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '',
  port: 5432,
});


const { expressMiddleware, expressErrorHandler } = require("@appsignal/express")
const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const app = express()

// tom
// console.log(process.env)

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// tom: slow everthing down
// app.use(function(req,res,next){setTimeout(next,2000)});

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

// tom: metric test
app.use("/metric-tests", function(req, res, next) {
  const meter = appsignal.metrics();

  meter.setGauge("myGauge", 200, { mytag: "myvalue"});
  meter.addDistributionValue("myMeasurement", 10, { host: "A"});
  meter.addDistributionValue("myMeasurement", 20, { host: "B"});

  res.json({
    metrics: "ok"
  });

});

// tom: simulate slow process with a tiieout
app.use('/slow', function(req, res, next) {
   setTimeout(function() {
     res.json({slow: "I take 3 seconds"});
   }, 3000);
});

// tom: try pg long query
const longQuery = (req, res) => {
  const tracer = appsignal.tracer()
  const span = tracer.currentSpan()
  tracer.withSpan(span.child(), child => {
    child
      .setName("Slow postgres query example")
      .setCategory("query.postgres")
      .setSQL("SELECT pg_sleep(5)");

    pool.query('select pg_sleep(5)', (err, data) => {
      if(err) throw err;
      res.status(200).json({query: "This should take 5 seconds."});
      child.close();
    });
  });
};

app.use('/query', longQuery);

// function(req, res, next) {
//   const tracer = appsignal.tracer()
//   const span = tracer.currentSpan()
  
  

//     client.connect();
//       // client.query('SELECT $1::text as message', ['Hello world!'], (err, data) => {
//     client.query('SELECT pg_sleep(5)', (err, data) => {
//       data = "I take 5 seconds.";
//       // const data = data.rows[0].message;
//       client.end();
//       child.close();
//       res.json({query: data});  
//     });
    
    
//   });
// });

// tom: does instrumentation affect how things are logged?
app.use('/slow_instrumented', function(req, res, next) {

  const tracer = appsignal.tracer();
  const span = tracer.currentSpan();

  tracer.withSpan(span.child(), child => {
    child
      .setName("Slow endpoint")
      .setCategory("api.net_http");
      // .setSQL("SELECT * FROM BLA WHERE user=1");

    setTimeout(function() {
      res.json({slow: "I take 2 seconds"});
    }, 2000);

    child.close();
  });
});

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
