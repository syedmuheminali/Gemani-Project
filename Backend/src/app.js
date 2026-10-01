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
    origin: "https://genami-resume-project.vercel.app",
    credentials: true
}));

// routes calling
app.get("/", (req, res) => {
    res.json({
        message: "API is running successfully"
    });
});
app.use("/api/auth",authRouter)
app.use("/api/interview",interviewRouter)

module.exports = app;