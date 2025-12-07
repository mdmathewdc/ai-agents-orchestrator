# Meme Generator MCP Server

[![npm version](https://img.shields.io/npm/v/imgflip-meme-mcp.svg)](https://www.npmjs.com/package/imgflip-meme-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An Express.js-based Model Context Protocol (MCP) server that generates memes using the [Imgflip API](https://imgflip.com/api). This server provides a standardized MCP interface for AI agents and applications to create custom memes programmatically.

## Features

- 🎨 **Meme Generation**: Create memes from any Imgflip template with custom text
- 🔌 **MCP Protocol**: Full Model Context Protocol implementation for seamless AI integration
- 🚀 **Express Server**: Lightweight HTTP server with CORS support
- ✅ **Type Safety**: Built with TypeScript and Zod schema validation

## Installation

```bash
npm install imgflip-meme-mcp
```

## Quick Start

### 1. Start the Server

```bash
npx imgflip-meme-mcp
```

Or if installed locally:

```bash
npm start
```

The server will start on `http://localhost:3000` by default. You can customize the port using the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### 2. Endpoints

- **MCP Endpoint**: `http://localhost:3000/mcp` - Main MCP protocol endpoint
- **Health Check**: `http://localhost:3000/` - Server status and information

## Usage

### As an MCP Server

Connect to this server using any MCP-compatible client. The server exposes a single tool:

#### `generate_meme`

Generates a meme from an Imgflip template with custom text.

**Parameters:**

- `username` (string, required): Your Imgflip username
- `password` (string, required): Your Imgflip password
- `template_id` (string, required): The Imgflip template ID (e.g., `'181913649'` for Drake template)
- `text0` (string, required): Text for the first text box (usually top text)
- `text1` (string, optional): Text for the second text box (usually bottom text)

**Returns:**

- `meme_url` (string): Direct URL to the generated meme image

**Example Request:**

```json
{
  "username": "your_username",
  "password": "your_password",
  "template_id": "181913649",
  "text0": "Using AI to generate memes",
  "text1": "Actually understanding how memes work"
}
```

**Example Response:**

```json
{
  "meme_url": "https://i.imgflip.com/xxxxx.jpg"
}
```

### Finding Template IDs

To find available meme templates and their IDs, visit the [Imgflip API documentation](https://imgflip.com/api) or use the Imgflip website to browse templates. Popular template IDs include:

- `181913649` - Drake Pointing
- `87743020` - Two Buttons
- `112126428` - Distracted Boyfriend
- `131087935` - Running Away Balloon

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd imgflip-meme-mcp
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

4. Start the server:

```bash
npm start
```

### Development Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Build and start the server
- `npm run watch` - Watch for changes and rebuild

### Project Structure

```
imgflip-meme-mcp/
├── src/
│   └── server.ts          # Main server implementation
├── dist/                   # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

### Environment Variables

- `PORT` - Server port (default: `3000`)

## Error Handling

The server provides detailed error messages for common issues:

- Missing credentials: Returns an error if username or password is not provided
- Invalid template ID: Returns Imgflip API error messages
- API failures: Returns descriptive error messages from the Imgflip API

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

## Related Links

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Imgflip API Documentation](https://imgflip.com/api)
- [Express.js Documentation](https://expressjs.com/)
