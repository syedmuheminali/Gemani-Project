require("../config/polyfills");
const mongoose = require("mongoose");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service");
const interviewReportModel = require("../models/Interview.Model");

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body;
        const userId = req.user?.id || req.user?._id;

        let resumeText = "";
        if (req.file && req.file.buffer) {
            try {
                const pdfParseModule = require("pdf-parse");
                if (pdfParseModule.PDFParse) {
                    const parser = new pdfParseModule.PDFParse(Uint8Array.from(req.file.buffer));
                    const resumeContent = await parser.getText();
                    resumeText = resumeContent?.text || "";
                } else if (typeof pdfParseModule === "function") {
                    const resumeContent = await pdfParseModule(req.file.buffer);
                    resumeText = resumeContent?.text || "";
                }
            } catch (pdfError) {
                console.error("Error extracting text from PDF resume:", pdfError);
                try {
                    const pdfParseModule = require("pdf-parse");
                    if (typeof pdfParseModule === "function") {
                        const fallbackContent = await pdfParseModule(req.file.buffer);
                        resumeText = fallbackContent?.text || "";
                    }
                } catch (fallbackError) {
                    console.error("Fallback PDF parse also failed:", fallbackError);
                }
            }
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: userId,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error generating interview report:", error);
        return res.status(500).json({
            message: error.message || "Failed to generate interview report."
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!interviewId || !mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({
                message: "Invalid interview report ID."
            });
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: userId
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error fetching interview report by id:", error);
        return res.status(500).json({
            message: "Server error while fetching interview report."
        });
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const userId = req.user?.id || req.user?._id;
        const interviewReports = await interviewReportModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        });
    } catch (error) {
        console.error("Error fetching interview reports:", error);
        return res.status(500).json({
            message: "Server error while fetching interview reports."
        });
    }
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!interviewReportId || !mongoose.Types.ObjectId.isValid(interviewReportId)) {
            return res.status(400).json({
                message: "Invalid interview report ID."
            });
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: userId
        });

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Error generating resume PDF:", error);
        return res.status(500).json({
            message: "Server error while generating resume PDF."
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    generateResumePdfController
};