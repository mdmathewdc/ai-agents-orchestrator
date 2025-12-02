import express from "express";
import cors from "cors";
import { createSupervisorAgent } from "./agents/supervisor.js";

const app = express();
app.use(cors());
app.use(express.json());

let supervisorAgent: Awaited<ReturnType<typeof createSupervisorAgent>> | null =
  null;

async function getSupervisorAgent() {
  if (!supervisorAgent) {
    supervisorAgent = await createSupervisorAgent();
  }
  return supervisorAgent;
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    name: "meme-agent-supervisor",
    version: "1.0.0",
    endpoint: "/generate-meme",
  });
});

// Main endpoint: Generate meme from user feeling
app.post("/generate-meme", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        error: "Invalid request",
        message:
          "Request body is missing. Please send JSON with 'feeling' field.",
      });
    }

    const { feeling } = req.body;

    if (!feeling || typeof feeling !== "string") {
      return res.status(400).json({
        error: "Invalid request",
        message: "Please provide a 'feeling' field with a string value",
      });
    }

    const agent = await getSupervisorAgent();
    const result = await agent.invoke({
      messages: [{ role: "user", content: feeling }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const responseText = lastMessage.text || "";

    // Extract summary and meme URL from the response
    let summary = "";
    let memeUrl = "";

    // Look for URL in the response (Imgflip URLs typically contain imgflip.com)
    const urlMatch = responseText.match(/https?:\/\/[^\s\)]+/);
    if (urlMatch) {
      memeUrl = urlMatch[0];
    }

    // Try to extract summary from structured format
    const summaryMatch = responseText.match(
      /Emotion Summary:\s*(.+?)(?:\n|Meme URL:|$)/i
    );
    if (summaryMatch) {
      summary = summaryMatch[1].trim();
    } else {
      // Fallback: extract first meaningful line that doesn't contain URL
      const lines = responseText.split("\n").filter((line) => {
        const trimmed = line.trim();
        return (
          trimmed.length > 0 &&
          !trimmed.match(/https?:\/\//) &&
          !trimmed.match(/^Meme URL:/i)
        );
      });
      if (lines.length > 0) {
        summary = lines[0].trim();
      }
    }

    // If we still don't have a summary, use the first line without URL
    if (!summary) {
      const firstLine = responseText.split("\n")[0]?.trim();
      if (firstLine && !firstLine.match(/https?:\/\//)) {
        summary = firstLine;
      } else {
        summary = "Emotion analyzed";
      }
    }

    res.json({
      summary: summary,
      meme_url: memeUrl || null,
      full_response: responseText,
    });
  } catch (error) {
    console.error("Error generating meme:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export { app };
export default app;
