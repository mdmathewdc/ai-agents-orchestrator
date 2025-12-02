import { createAgent, initChatModel } from "langchain";

const EMOTION_AGENT_PROMPT = `
You are an emotion analysis assistant. Analyze the user's feelings and emotions from their input and generate a concise 1-line summary that captures the essence of their emotional state. 

Just focus on understanding and summarizing the emotional content.

Examples:
- Input: "I'm so stressed about my exam tomorrow"
- Output: "Feeling anxious and overwhelmed about upcoming exam"

- Input: "Just got promoted! So excited!"
- Output: "Feeling elated and accomplished about career advancement"

- Input: "My dog passed away last week"
- Output: "Experiencing deep sadness and grief over pet loss"
`.trim();

export async function createEmotionAgent(): Promise<ReturnType<typeof createAgent>> {
  const model = await initChatModel("openai", {
    model: "gpt-4o-mini",
    modelProvider: "openai",
    temperature: 0.7,
  });

  const agent = createAgent({
    model,
    systemPrompt: EMOTION_AGENT_PROMPT,
  });

  return agent;
}

