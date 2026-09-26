const express = require("express")
const authMiddleware = require("../middleware/auth.middleware");
const InterviewController = require("../controller/interview.controller");
const upload = require("../middleware/file.middleware");

const interviewRouter = express.Router()


interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),InterviewController.generateInterViewReportController)


interviewRouter.get("/report/:interviewId", authMiddleware.authUser, InterviewController.getInterviewReportByIdController)


interviewRouter.get("/", authMiddleware.authUser, InterviewController.getAllInterviewReportsController)


interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, InterviewController.generateResumePdfController)

module.exports = interviewRouter;
