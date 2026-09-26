const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// middleware

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// routes calling
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

module.exports = app;