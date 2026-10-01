const {GoogleGenAI} = require("@google/genai");
const {z} = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema")
// const puppeteer = require("puppeteer")

const googleAiApiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const ai = new GoogleGenAI({
    apiKey: googleAiApiKey
});

function parseJsonModelResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response received from the model.")
  }

  const trimmed = rawText.trim();
  const withoutCodeFence = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  try {
    return JSON.parse(withoutCodeFence);
  } catch (error) {
    throw new Error(`Failed to parse model JSON response: ${error.message}`);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildFallbackResumeHtml({ resume, selfDescription, jobDescription }) {
  const resumeSections = [
    { title: "Professional Summary", content: selfDescription || "Experienced professional with strong technical and communication skills." },
    { title: "Core Experience", content: resume || "Relevant professional experience and achievements." },
    { title: "Target Role", content: jobDescription || "Role requirements and responsibilities the candidate is targeting." },
  ];

  const sections = resumeSections
    .map(({ title, content }) => {
      const bulletPoints = String(content)
        .split(/\n|\r\n|\.|;\s*(?=[A-Z])|\s{2,}/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 8)
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join("");

      return `
        <div>
          <h2>${escapeHtml(title)}</h2>
          <ul>${bulletPoints || `<li>${escapeHtml(content || "Details not available.")}</li>`}</ul>
        </div>
      `;
    })
    .join("");

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 0; padding: 28px; background: #ffffff; }
          h1 { font-size: 28px; margin: 0 0 8px; }
          h2 { font-size: 16px; color: #1f2937; border-bottom: 2px solid #dbeafe; padding-bottom: 6px; margin-top: 22px; }
          ul { margin: 10px 0 0 18px; padding: 0; line-height: 1.7; }
          li { margin-bottom: 6px; }
          .meta { color: #4b5563; font-size: 12px; margin-bottom: 18px; }
        </style>
      </head>
      <body>
        <h1>Professional Resume</h1>
        <div class="meta">Tailored for the target role</div>
        ${sections}
      </body>
    </html>
  `;
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
You are an expert technical interviewer and career assessment system.

Generate an interview preparation report for the candidate based ONLY on the
resume, self-description, and job description provided below.

IMPORTANT RULES:

1. You MUST follow the provided response schema exactly.
2. Do NOT create additional fields.
3. Do NOT return candidate_name.
4. Do NOT return job_title.
5. Do NOT return recommendation.
6. Do NOT return interview_score.
7. Do NOT return technical_assessment_summary.
8. Do NOT return core_technical_skills.
9. Do NOT return nice_to_have_skills_met.
10. Return ONLY the fields defined by the schema.
11. technicalQuestions should contain 8-12 realistic technical questions.
12. behavioralQuestions should contain 5-8 realistic behavioral questions.
13. skillGaps should only contain skills that are actually missing or weak
    compared with the job description.
14. preparationPlan should contain a practical 7-day preparation plan.
15. matchScore must be between 0 and 100.
16. Do not invent experience that is not present in the resume.

CANDIDATE RESUME:
${resume}

CANDIDATE SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

Generate the interview report now.
`;

  try {
    if (!googleAiApiKey) {
      throw new Error("Google AI API key is not configured. Set GOOGLE_GENAI_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY in your environment.");
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",

      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseSchema: z.toJSONSchema(interviewReportSchema),
      },
    });

    return parseJsonModelResponse(response?.text);
  } catch (error) {
    if (error?.issues) {
      console.error("Zod Validation Errors:");
      console.error(error.issues);
    }

    console.error("Failed to generate interview report:", error?.message || error);
    throw new Error("Failed to generate interview report");
  }
}


const PDFDocument = require("pdfkit");

function generatePdfWithPdfKit(htmlContent) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 40,
                size: "A4",
                info: {
                    Title: "Candidate Resume",
                    Author: "AI Resume Generator"
                }
            });

            const buffers = [];
            doc.on("data", chunk => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", err => reject(err));

            // Strip style and script tags
            let text = (htmlContent || "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
            text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

            const decodeEntities = (str) => {
                return (str || "")
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&nbsp;/g, " ")
                    .replace(/&#x2F;/g, "/")
                    .replace(/&#x60;/g, "`")
                    .replace(/&#x3D;/g, "=");
            };

            const tagRegex = /<(h[1-6]|p|li|div|hr)[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi;
            let match;
            let foundTags = false;

            while ((match = tagRegex.exec(text)) !== null) {
                const tag = (match[1] || "hr").toLowerCase();
                let inner = (match[2] || "").replace(/<[^>]+>/g, "").trim();
                inner = decodeEntities(inner);

                if (!inner && tag !== "hr") continue;
                foundTags = true;

                if (tag === "h1") {
                    doc.moveDown(0.2);
                    doc.fontSize(20).font("Helvetica-Bold").fillColor("#111827").text(inner, { align: "center" });
                    doc.moveDown(0.2);
                } else if (tag === "h2") {
                    doc.moveDown(0.5);
                    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1f2937").text(inner.toUpperCase());
                    doc.strokeColor("#d1d5db").lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
                    doc.moveDown(0.3);
                } else if (tag === "h3") {
                    doc.moveDown(0.3);
                    doc.fontSize(11).font("Helvetica-Bold").fillColor("#374151").text(inner);
                    doc.moveDown(0.15);
                } else if (tag === "li") {
                    doc.fontSize(9.5).font("Helvetica").fillColor("#4b5563").text(`•   ${inner}`, { indent: 12 });
                    doc.moveDown(0.12);
                } else if (tag === "hr") {
                    doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
                    doc.moveDown(0.3);
                } else {
                    if (inner.includes("@") || inner.includes("|") || inner.includes("•")) {
                        doc.fontSize(9.5).font("Helvetica").fillColor("#6b7280").text(inner, { align: "center" });
                        doc.moveDown(0.2);
                    } else {
                        doc.fontSize(9.5).font("Helvetica").fillColor("#374151").text(inner);
                        doc.moveDown(0.2);
                    }
                }
            }

            if (!foundTags) {
                const plainLines = decodeEntities(text.replace(/<[^>]+>/g, "\n")).split("\n").filter(l => l.trim().length > 0);
                for (const line of plainLines) {
                    doc.fontSize(10).font("Helvetica").fillColor("#374151").text(line.trim());
                    doc.moveDown(0.2);
                }
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

async function generatePdfFromHtml(htmlContent) {
    let browser = null;
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");

    try {
        if (isServerless) {
            const chromiumModule = require("@sparticuz/chromium");
            const chromium = chromiumModule.default || chromiumModule;
            const puppeteerCore = require("puppeteer-core");
            const execPath = await chromium.executablePath();

            browser = await puppeteerCore.launch({
                args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
                defaultViewport: chromium.defaultViewport,
                executablePath: execPath,
                headless: chromium.headless ?? true,
            });
        } else {
            const puppeteer = require("puppeteer");
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            });
        }

        const page = await browser.newPage();
        await page.setContent(htmlContent, {
            waitUntil: ["load", "domcontentloaded"]
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });

        return pdfBuffer;
    } catch (browserError) {
        console.warn("Headless browser generation unavailable in this environment, using native PDFKit generator fallback:", browserError.message);
        return await generatePdfWithPdfKit(htmlContent);
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (closeErr) {
                console.error("Error closing browser:", closeErr);
            }
        }
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    let htmlContent = buildFallbackResumeHtml({ resume, selfDescription, jobDescription });

    try {
        if (!googleAiApiKey) {
            throw new Error("Google AI API key is not configured. Set GOOGLE_GENAI_API_KEY, GEMINI_API_KEY, or GOOGLE_API_KEY in your environment.");
        }

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        })

        const jsonContent = parseJsonModelResponse(response?.text);

        if (typeof jsonContent?.html === "string" && jsonContent.html.trim()) {
            htmlContent = jsonContent.html;
        }
    } catch (error) {
        console.warn("Falling back to the built-in resume template because the model failed to generate resume HTML:", error?.message || error);
    }

    return await generatePdfFromHtml(htmlContent)

}

module.exports = { generateInterviewReport, generateResumePdf }

