const express = require("express");
const cors = require("cors");
const logger = require("morgan");
// const session = require("express-session");
const mongoose = require("mongoose");
const { authRouter, courtRouter } = require("./routes/index.js");

// const MongoStore = require('connect-mongo');
// require('./cron');

// Import routers
const routes = require("./routes");

const db = require("./models/index");
const createError = require("http-errors"); // Import http-errors
const cookieParser = require("cookie-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie:{
//       maxAge: 1000 * 64 * 10,
//       sameSite: 'strict',
//       // secure: true
//     },
//       // stringify: false,
//   })
// );

// app.use((req, res, next) => {
//   res.status(404).json({
//     success: false,
//     message: 'Bad method'
//   });
// });

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.get("/", (req, res) => res.send("Welcome to Court Management System"));

// Implement routes for REST API
app.use("/api/court", routes.courtRouter);
app.use("/api/auth", routes.authRouter);

app.listen(process.env.PORT, process.env.HOST_NAME, () => {
  console.log("Server listening on port " + process.env.PORT);
  db.connectDB();
});
