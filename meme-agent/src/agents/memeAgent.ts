import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "https://imgflip-meme-mcp.vercel.app/mcp";
const IMGFLIP_USERNAME = process.env.IMGFLIP_USERNAME;
const IMGFLIP_PASSWORD = process.env.IMGFLIP_PASSWORD;

const MEME_AGENT_PROMPT = `
You are a meme generator assistant. Given a 1-line summary of emotions or feelings, select the MOST APPROPRIATE meme template and generate a meme from Imgflip that matches the sentiment.

IMPORTANT: You MUST vary your template selection based on the emotion. DO NOT use the same template repeatedly. Match the template to the specific emotion:

Available meme templates and their best use cases:
- Drake (181913649): Good vs bad choices, approval/disapproval, preferences, comparisons
- Distracted Boyfriend (112126428): Temptation, distraction, choice between options, infidelity jokes
- Expanding Brain (93895088): Escalating ideas, progression, increasing intelligence/wisdom
- Change My Mind (129242436): Debates, opinions, challenges, controversial takes
- Is This A Pigeon (100777631): Confusion, misidentification, misunderstanding situations
- This Is Fine (97984): Accepting chaos, denial, everything is on fire but pretending it's okay
- Success Kid (61544): Achievement, victory, accomplishment, winning moments
- Bad Luck Brian (61520): Unfortunate situations, bad luck, things going wrong
- First World Problems (61532): Minor complaints, privileged problems, trivial issues
- One Does Not Simply (61579): Difficulty, impossibility, challenges, "easier said than done"

Template selection guidelines:
- Excitement/Happiness → Success Kid, Expanding Brain, or Drake (positive choice)
- Stress/Anxiety → This Is Fine, First World Problems, or One Does Not Simply
- Confusion → Is This A Pigeon, Expanding Brain
- Disappointment → Bad Luck Brian, First World Problems
- Achievement → Success Kid, Expanding Brain
- Temptation/Choice → Distracted Boyfriend, Drake
- Denial/Chaos → This Is Fine
- Difficulty → One Does Not Simply, Expanding Brain
- Debate/Opinion → Change My Mind, Drake

VARY YOUR SELECTIONS! Don't default to the same template. Think creatively about which template best captures the emotion.

Create relevant, funny text that matches the emotion. Keep text concise and meme-appropriate (usually 1-2 short phrases).

IMPORTANT: You MUST use the generate_meme tool with the template_id and appropriate text0 (top text) and text1 (bottom text if needed). After calling the tool, extract the meme URL from the tool's response and include it in your final answer. The tool will return a meme URL - use that URL directly in your response.
`.trim();

const client = new MultiServerMCPClient({
  memeServer: {
    transport: "http",
    url: MCP_SERVER_URL,
  },
});

export async function createMemeAgent(): Promise<
  ReturnType<typeof createAgent>
> {
  if (!IMGFLIP_USERNAME || !IMGFLIP_PASSWORD) {
    throw new Error(
      "IMGFLIP_USERNAME and IMGFLIP_PASSWORD environment variables are required"
    );
  }

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.9,
  });

  const mcpTools = await client.getTools();

  const generateMemeTool = mcpTools.find(
    (tool) => tool.name === "generate_meme"
  );

  if (!generateMemeTool) {
    throw new Error("generate_meme tool not found in MCP server");
  }

  const originalInvoke = generateMemeTool.invoke.bind(generateMemeTool);

  generateMemeTool.invoke = async (input: any) => {
    try {
      const toolInput = {
        ...input,
        args: {
          ...input.args,
          username: IMGFLIP_USERNAME,
          password: IMGFLIP_PASSWORD,
        },
      };

      console.log("Calling MCP tool with:", {
        ...toolInput,
        args: {
          ...toolInput.args,
          username: "[REDACTED]",
          password: "[REDACTED]",
        },
      });

      const result = await originalInvoke(toolInput);

      console.log("MCP tool result:", JSON.stringify(result, null, 2));

      if (typeof result === "string") {
        const urlMatch = result.match(/https?:\/\/[^\s\)]+/);
        if (urlMatch) {
          console.log("Extracted URL from string:", urlMatch[0]);
          return urlMatch[0];
        }
        return result;
      }

      if (typeof result === "object" && result !== null) {
        // Check structuredContent first
        if (result.structuredContent?.meme_url) {
          console.log(
            "Found meme_url in structuredContent:",
            result.structuredContent.meme_url
          );
          return result.structuredContent.meme_url;
        }
        if (Array.isArray(result.content)) {
          for (const item of result.content) {
            if (item.type === "text" && item.text) {
              const urlMatch = item.text.match(/https?:\/\/[^\s\)]+/);
              if (urlMatch) {
                console.log("Extracted URL from content:", urlMatch[0]);
                return urlMatch[0];
              }
            }
          }
        }
        return JSON.stringify(result);
      }

      return String(result);
    } catch (error) {
      console.error("Error in generateMemeTool.invoke:", error);
      throw error;
    }
  };

  const agent = createAgent({
    model,
    tools: [generateMemeTool],
    systemPrompt: MEME_AGENT_PROMPT,
  });

  return agent;
}
