import { createAgent, initChatModel, tool } from "langchain";
import { z } from "zod";
import { createEmotionAgent } from "./emotionAgent.js";
import { createMemeAgent } from "./memeAgent.js";

const SUPERVISOR_PROMPT = `
You are a supervisor coordinating emotion analysis and meme generation.

Your workflow:
1. First, use analyze_emotion to analyze the user's emotional input and get a 1-line summary
2. Then, use generate_meme_from_summary to create an appropriate meme based on that summary

Always complete both steps. In your final response, clearly state:
- The emotion summary (1 line)
- The generated meme URL

Format your response as:
"Emotion Summary: [the 1-line summary]
Meme URL: [the meme URL]"
`.trim();

let emotionAgent: Awaited<ReturnType<typeof createEmotionAgent>> | null = null;
let memeAgent: Awaited<ReturnType<typeof createMemeAgent>> | null = null;

async function getEmotionAgent() {
  if (!emotionAgent) {
    emotionAgent = await createEmotionAgent();
  }
  return emotionAgent;
}

async function getMemeAgent() {
  if (!memeAgent) {
    memeAgent = await createMemeAgent();
  }
  return memeAgent;
}

const analyzeEmotionTool = tool(
  async ({ userInput }) => {
    const agent = await getEmotionAgent();
    const result = await agent.invoke({
      messages: [{ role: "user", content: userInput }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.text || "Unable to analyze emotion";
  },
  {
    name: "analyze_emotion",
    description:
      "Analyze user input to determine the underlying emotion and generate a 1-line summary.",
    schema: z.object({
      userInput: z
        .string()
        .describe("The user's input describing their feelings or emotions"),
    }),
  }
);

const generateMemeFromSummaryTool = tool(
  async ({ summary }) => {
    const agent = await getMemeAgent();
    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `Generate a meme for this emotion summary: ${summary}`,
        },
      ],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.text || "Unable to generate meme";
  },
  {
    name: "generate_meme_from_summary",
    description:
      "Generate a meme based on an emotion summary. Takes a 1-line emotion summary and creates an appropriate meme.",
    schema: z.object({
      summary: z
        .string()
        .describe("The 1-line emotion summary to base the meme on"),
    }),
  }
);

export async function createSupervisorAgent(): Promise<
  ReturnType<typeof createAgent>
> {
  const model = await initChatModel("openai", {
    model: "gpt-4o-mini",
    temperature: 0.7,
  });

  const agent = createAgent({
    model,
    tools: [analyzeEmotionTool, generateMemeFromSummaryTool],
    systemPrompt: SUPERVISOR_PROMPT,
  });

  return agent;
}
