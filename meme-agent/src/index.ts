import { app } from "./server.js";

const PORT = process.env.PORT || 3001;

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("ERROR: OPENAI_API_KEY environment variable is required");
  process.exit(1);
}

if (!process.env.IMGFLIP_USERNAME || !process.env.IMGFLIP_PASSWORD) {
  console.error("ERROR: IMGFLIP_USERNAME and IMGFLIP_PASSWORD environment variables are required");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Meme Agent Supervisor running on http://localhost:${PORT}`);
  console.log(`📍 Generate meme endpoint: http://localhost:${PORT}/generate-meme`);
  console.log(`🏥 Health check: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

