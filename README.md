# 🤖 AI Agents Orchestrator

> **Transform emotions into memes with AI-powered multi-agent orchestration**

A sophisticated multi-agent system that uses LangChain's supervisor pattern to analyze user emotions and generate contextually appropriate memes. Built with TypeScript, Express, and the Model Context Protocol (MCP).

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
![LangChain](https://img.shields.io/badge/LangChain-1.1-orange)

---

## 🎯 What is This?

This project demonstrates a **production-ready AI agent orchestration system** that:

1. **Analyzes emotions** from natural language input
2. **Generates memes** that match the emotional context
3. **Coordinates multiple AI agents** using LangChain's supervisor pattern
4. **Exposes an MCP server** for seamless integration with AI applications

### The Flow

```
User Input: "I'm stressed about my exam"
    ↓
[Emotion Agent] → Analyzes emotion → "Feeling anxious about upcoming exam"
    ↓
[Meme Agent] → Generates meme → 🎨 Meme URL
    ↓
[Supervisor] → Coordinates workflow → Returns complete response
```

---

## 🏗️ Architecture

This repository contains two main components:

### 1. **MCP Server** (`imgflip-meme-mcp/`)
A Model Context Protocol server that provides meme generation capabilities via HTTP/SSE transport.

**Features:**
- 🎨 Meme generation using Imgflip API
- 🔌 Full MCP protocol implementation
- 🚀 Express.js HTTP server
- ✅ TypeScript + Zod validation

### 2. **Meme Agent** (`meme-agent/`)
A multi-agent orchestration system using LangChain's supervisor pattern.

**Agents:**
- **🧠 Emotion Analysis Agent**: Analyzes user input and extracts emotional context
- **🎭 Meme Generator Agent**: Creates contextually appropriate memes via MCP
- **👑 Supervisor Agent**: Coordinates the workflow between agents

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))
- **Imgflip Account** ([Free signup](https://imgflip.com/signup))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-agents-orchestrator

# Install dependencies for both projects
cd imgflip-meme-mcp && npm install
cd ../meme-agent && npm install
```

### Configuration

#### 1. MCP Server Setup

The MCP server runs independently and doesn't require environment variables (credentials are passed in requests).

```bash
cd imgflip-meme-mcp
npm run build
npm start
```

Server runs on `http://localhost:3000` by default.

#### 2. Meme Agent Setup

Create a `.env` file in the `meme-agent` directory:

```env
OPENAI_API_KEY=your-openai-api-key-here
IMGFLIP_USERNAME=your-imgflip-username
IMGFLIP_PASSWORD=your-imgflip-password
MCP_SERVER_URL=http://localhost:3000/mcp
PORT=3001
```

Then start the agent:

```bash
cd meme-agent
npm run build
npm start
```

---

## 📡 API Usage

### Generate Meme from Emotion

**Endpoint:** `POST http://localhost:3001/generate-meme`

**Request:**
```json
{
  "feeling": "I'm so stressed about my exam tomorrow"
}
```

**Response:**
```json
{
  "summary": "Feeling anxious and overwhelmed about upcoming exam",
  "meme_url": "https://i.imgflip.com/xxxxx.jpg",
  "full_response": "Emotion Summary: Feeling anxious and overwhelmed about upcoming exam\nMeme URL: https://i.imgflip.com/xxxxx.jpg"
}
```

### Example with cURL

```bash
curl -X POST http://localhost:3001/generate-meme \
  -H "Content-Type: application/json" \
  -d '{
    "feeling": "I just aced my final exam!"
  }'
```

---

## 🧩 How It Works

### Agent Architecture

```
┌─────────────────────────────────────────┐
│         Supervisor Agent                 │
│  (Coordinates the workflow)              │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Emotion     │  │   Meme       │
│  Agent       │  │   Agent       │
│              │  │               │
│ Analyzes     │  │ Generates     │
│ emotions     │  │ memes via     │
│              │  │ MCP server    │
└──────────────┘  └──────────────┘
```

### Workflow Steps

1. **User Input** → Supervisor receives emotion/feeling
2. **Emotion Analysis** → Emotion Agent processes input and generates 1-line summary
3. **Meme Generation** → Meme Agent uses summary to create appropriate meme via MCP
4. **Response** → Supervisor formats and returns complete result

### MCP Integration

The Meme Agent uses `@langchain/mcp-adapters` to connect to the MCP server, enabling seamless tool calling:

- **Tool**: `generate_meme`
- **Transport**: HTTP/SSE (StreamableHTTPServerTransport)
- **Protocol**: Model Context Protocol v2024-11-05

---

## 📁 Project Structure

```
ai-agents-orchestrator/
│
├── imgflip-meme-mcp/          # MCP Server
│   ├── src/
│   │   ├── server.ts          # Express + MCP server
│   │   └── cli.ts             # CLI entry point
│   ├── package.json
│   └── README.md
│
├── meme-agent/                 # Multi-Agent System
│   ├── src/
│   │   ├── agents/
│   │   │   ├── emotionAgent.ts    # Emotion analysis agent
│   │   │   ├── memeAgent.ts       # Meme generation agent
│   │   │   └── supervisor.ts      # Supervisor coordinator
│   │   ├── server.ts              # Express API server
│   │   └── index.ts               # Application entry
│   ├── package.json
│   └── README.MD
│
└── README.md                   # This file
```

---

## 🛠️ Development

### Running in Development Mode

**MCP Server:**
```bash
cd imgflip-meme-mcp
npm run watch  # Watch mode for auto-rebuild
```

**Meme Agent:**
```bash
cd meme-agent
npm run watch  # Watch mode for auto-rebuild
```

### Building for Production

```bash
# Build both projects
cd imgflip-meme-mcp && npm run build
cd ../meme-agent && npm run build
```

---

## 🧪 Testing

### Test the MCP Server

```bash
# Start the MCP server
cd imgflip-meme-mcp
npm start

# In another terminal, test with curl
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

### Test the Meme Agent

```bash
# Start both servers
# Terminal 1: MCP Server
cd imgflip-meme-mcp && npm start

# Terminal 2: Meme Agent
cd meme-agent && npm start

# Terminal 3: Test API
curl -X POST http://localhost:3001/generate-meme \
  -H "Content-Type: application/json" \
  -d '{"feeling": "I love coding!"}'
```

---

## 🔧 Configuration

### Environment Variables

#### Meme Agent (`.env`)
```env
OPENAI_API_KEY=sk-...              # Required: OpenAI API key
IMGFLIP_USERNAME=your_username    # Required: Imgflip username
IMGFLIP_PASSWORD=your_password    # Required: Imgflip password
MCP_SERVER_URL=http://localhost:3000/mcp  # MCP server endpoint
PORT=3001                         # Optional: Server port (default: 3001)
```

#### MCP Server
```env
PORT=3000  # Optional: Server port (default: 3000)
```

---

## 📚 Technologies

- **LangChain** - Agent orchestration and tool calling
- **Model Context Protocol (MCP)** - Standardized protocol for AI tool integration
- **Express.js** - HTTP server framework
- **TypeScript** - Type-safe development
- **Zod** - Schema validation
- **Imgflip API** - Meme generation service

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- [LangChain](https://www.langchain.com/) for the amazing agent framework
- [Model Context Protocol](https://modelcontextprotocol.io/) for the protocol specification
- [Imgflip](https://imgflip.com/) for the meme generation API
- [OpenAI](https://openai.com/) for the language models

---

## 📧 Contact

**Author:** Mathew Dony  
**Email:** mathewdony007@gmail.com

---

