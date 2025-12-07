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

    const memeUrl = response.data.data?.url;

    if (!memeUrl) {
      throw new Error("Failed to extract meme URL from API response");
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Meme generated successfully! Meme image URL: ${memeUrl}`,
        },
      ],
      structuredContent: {
        meme_url: memeUrl,
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
