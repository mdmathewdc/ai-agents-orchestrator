# Meme Agent

A multi-agent system using LangChain's supervisor pattern to generate memes based on user emotions.

## Overview

This system consists of three specialized agents:

1. **Emotion Analysis Agent**: Analyzes user input (feelings/emotions) and generates a 1-line summary
2. **Meme Generator Agent**: Takes the summary and generates an appropriate meme using the remote MCP server
3. **Supervisor Agent**: Coordinates both agents to handle the complete workflow

## Setup

### Prerequisites

- Node.js >= 18.0.0
- OpenAI API key
- Imgflip account credentials

### Installation

```bash
cd meme-agent
npm install
```

### Environment Variables

Create a `.env` file in the `meme-agent` directory:

```env
OPENAI_API_KEY=your-openai-api-key-here
IMGFLIP_USERNAME=your-imgflip-username
IMGFLIP_PASSWORD=your-imgflip-password
MCP_SERVER_URL=https://imgflip-meme-mcp.vercel.app/mcp
PORT=3001
```

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

Or for development:

```bash
npm run dev
```

### API Endpoint

**POST** `/generate-meme`

Request body:
```json
{
  "feeling": "I'm so stressed about my exam tomorrow"
}
```

Response:
```json
{
  "summary": "Feeling anxious and overwhelmed about upcoming exam",
  "meme_url": "https://i.imgflip.com/...",
  "full_response": "Emotion Summary: Feeling anxious and overwhelmed about upcoming exam\nMeme URL: https://i.imgflip.com/..."
}
```

## Architecture

- `src/agents/emotionAgent.ts` - Emotion analysis agent
- `src/agents/memeAgent.ts` - Meme generator agent with integrated MCP client (uses `@langchain/mcp-adapters`)
- `src/agents/supervisor.ts` - Supervisor agent coordinating the workflow
- `src/server.ts` - Express server with API endpoint
- `src/index.ts` - Application entry point

## Development

```bash
npm run watch  # Watch mode for development
```

