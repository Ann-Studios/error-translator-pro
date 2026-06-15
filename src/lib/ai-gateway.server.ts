import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createAiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "openrouter",
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
  });
}