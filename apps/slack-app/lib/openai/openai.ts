import { Env } from "deno-slack-sdk/types.ts";
import OpenAI from "openai";

let openaiInstance: OpenAI;

/**
 * Initialize the OpenAI Singleton with an API key
 * @param env - The Slack environment variables
 * @returns - The OpenAI Singleton instance
 */
function initializeOpenAISingleton(env: Env) {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      baseURL: env["OPENAI_BASE_URL"],
      apiKey: env["OPENAI_API_KEY"],
      organization: env["OPENAI_ORG_ID"],
    });
  }
}

/**
 * Get the OpenAI Singleton instance
 * @param env - The Slack environment variables
 * @returns - The OpenAI Singleton instance
 */
export function getOpenAI(env: Env): OpenAI {
  if (!openaiInstance) {
    initializeOpenAISingleton(env);
  }
  return openaiInstance;
}
