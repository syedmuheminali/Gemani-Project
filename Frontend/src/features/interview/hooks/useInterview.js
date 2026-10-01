import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"

export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response?.interviewReport || null)
            return response?.interviewReport
        } catch (error) {
            console.error("Error generating interview report:", error)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response?.interviewReport || null)
            return response?.interviewReport
        } catch (error) {
            console.error("Error fetching interview report by id:", error)
            setReport(null)
            return null
        } finally {
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response?.interviewReports || [])
            return response?.interviewReports
        } catch (error) {
            console.error("Error fetching all interview reports:", error)
            return []
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })

            if (response && response.type === "application/json") {
                const text = await response.text()
                try {
                    const json = JSON.parse(text)
                    alert(json.message || "Failed to download resume PDF.")
                } catch {
                    alert("Failed to download resume PDF.")
                }
                return
            }

            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.error("Error downloading resume pdf:", error)
            alert("Error downloading resume. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return { loading, report, reports, setReport, setReports, generateReport, getReportById, getReports, getResumePdf }

}