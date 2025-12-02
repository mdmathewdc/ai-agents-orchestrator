import { createAgent, initChatModel } from "langchain";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "https://imgflip-meme-mcp.vercel.app/mcp";
const IMGFLIP_USERNAME = process.env.IMGFLIP_USERNAME;
const IMGFLIP_PASSWORD = process.env.IMGFLIP_PASSWORD;

const MEME_AGENT_PROMPT = `
You are a meme generator assistant. Given a 1-line summary of emotions or feelings, select an appropriate meme template and generate a meme from Imgflip that matches the sentiment.

Popular meme templates you can use:
- Drake (181913649): Good vs bad choices, approval/disapproval
- Distracted Boyfriend (112126428): Temptation, distraction, choice
- Expanding Brain (93895088): Escalating ideas, progression
- Change My Mind (129242436): Debates, opinions, challenges
- Is This A Pigeon (100777631): Confusion, misidentification
- This Is Fine (97984): Accepting chaos, denial
- Success Kid (61544): Achievement, victory
- Bad Luck Brian (61520): Unfortunate situations
- First World Problems (61532): Minor complaints
- One Does Not Simply (61579): Difficulty, impossibility

Select the most appropriate template based on the emotional summary. Create relevant, funny text that matches the emotion. Keep text concise and meme-appropriate.

Use the generate_meme tool with the template_id and appropriate text0 (top text) and text1 (bottom text if needed).
`.trim();

const client = new MultiServerMCPClient({
  memeServer: {
    transport: "http",
    url: MCP_SERVER_URL,
  },
});

const tools = await client.getTools();

export async function createMemeAgent(): Promise<
  ReturnType<typeof createAgent>
> {
  const model = await initChatModel("openai", {
    model: "gpt-4o-mini",
    temperature: 0.8,
  });

  const agent = createAgent({
    model,
    tools,
    systemPrompt: MEME_AGENT_PROMPT,
  });

  return agent;
}
