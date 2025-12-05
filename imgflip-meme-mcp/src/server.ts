import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import axios from "axios";
import { z } from "zod";

const PORT = process.env.PORT || 3000;
const IMGFLIP_CAPTION_IMAGE_URL = "https://api.imgflip.com/caption_image";

interface ImgflipCaptionResponse {
  success: boolean;
  data?: {
    url: string;
    page_url: string;
  };
  error_message?: string;
}

/**
 * Sanitizes a URL string to ensure it's a clean URL without markdown formatting.
 * Handles cases like:
 * - "[https://example.com](https://example.com)" -> "https://example.com"
 * - "https://example.com](https://example.com)" -> "https://example.com"
 * - "https://example.com" -> "https://example.com"
 */
function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  let cleaned = url.trim();

  // Handle markdown link format: [text](url) or [url](url) - extract the URL from parentheses
  const markdownLinkMatch = cleaned.match(/\[([^\]]*)\]\(([^)]+)\)/);
  if (markdownLinkMatch) {
    cleaned = markdownLinkMatch[2]; // Use the URL from parentheses
  }

  // Handle partial markdown: url](url - extract the first URL before the ]
  const partialMarkdownMatch = cleaned.match(/^([^\]]+)\]/);
  if (partialMarkdownMatch) {
    cleaned = partialMarkdownMatch[1];
  }

  // Extract the first valid URL pattern (http:// or https://)
  // Match URL up to whitespace, closing paren, closing bracket, or other invalid characters
  const urlMatch = cleaned.match(/https?:\/\/[^\s\)\]\[<>"]+/);
  if (urlMatch) {
    cleaned = urlMatch[0];
  }

  // Final cleanup: remove any trailing invalid characters that might have been missed
  // Keep only valid URL characters: alphanumeric, dots, slashes, colons, hyphens, underscores, 
  // question marks, equals, ampersands, hashes, and percent signs (for encoded URLs)
  cleaned = cleaned.replace(/[^\w\.\/\:\-\?\=\&\#\%]/g, "");

  return cleaned.trim();
}

const app = express();
app.use(cors());

app.use((req, res, next) => {
  if (req.path === "/mcp") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

const server = new McpServer({
  name: "imgflip-meme-mcp",
  version: "1.0.0",
});

server.registerTool(
  "generate_meme",
  {
    description:
      "Generate a meme from Imgflip using a specific template ID and custom text",
    inputSchema: z.object({
      username: z.string().describe("Imgflip username"),
      password: z.string().describe("Imgflip password"),
      template_id: z
        .string()
        .describe(
          "The ID of the meme template to use (e.g., '181913649' for Drake)"
        ),
      text0: z
        .string()
        .describe("Text for the first text box (usually top text)"),
      text1: z
        .string()
        .optional()
        .describe("Text for the second text box (usually bottom text)"),
      text2: z
        .string()
        .optional()
        .describe("Text for the third text box (if template supports it)"),
      text3: z
        .string()
        .optional()
        .describe("Text for the fourth text box (if template supports it)"),
      text4: z
        .string()
        .optional()
        .describe("Text for the fifth text box (if template supports it)"),
    }),
    outputSchema: z.object({
      meme_url: z.string(),
    }),
  },
  async (args) => {
    return await generateMeme(args);
  }
);

async function generateMeme(args: any) {
  if (!args.username || !args.password) {
    throw new Error(
      "Imgflip credentials are required. Please provide username and password."
    );
  }

  try {
    const formData = new URLSearchParams();
    formData.append("template_id", args.template_id);
    formData.append("username", args.username);
    formData.append("password", args.password);
    formData.append("text0", args.text0);

    if (args.text1) formData.append("text1", args.text1);
    if (args.text2) formData.append("text2", args.text2);
    if (args.text3) formData.append("text3", args.text3);
    if (args.text4) formData.append("text4", args.text4);

    const response = await axios.post<ImgflipCaptionResponse>(
      IMGFLIP_CAPTION_IMAGE_URL,
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error_message || "Failed to generate meme");
    }

    const rawMemeUrl = response.data.data?.url || "";
    const sanitizedMemeUrl = sanitizeUrl(rawMemeUrl);

    if (!sanitizedMemeUrl) {
      throw new Error("Failed to extract valid meme URL from API response");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Meme generated successfully! Meme image URL: ${sanitizedMemeUrl}`,
        },
      ],
      structuredContent: {
        meme_url: sanitizedMemeUrl,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Imgflip API error: ${
          error.response.data.error_message || error.message
        }`
      );
    }
    throw new Error(`Failed to generate meme: ${error}`);
  }
}

app.all("/mcp", async (req, res) => {
  console.log("Received MCP request:", req.method, req.headers);

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res);

    console.log("MCP request handled successfully");
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    name: "imgflip-meme-mcp",
    version: "1.0.0",
    endpoint: "/mcp",
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 Meme Generator MCP Server running on http://localhost:${PORT}`
  );
  console.log(`📍 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🏥 Health check: http://localhost:${PORT}/`);
});
