// Deno openai Bug: https://github.com/denoland/deno/issues/22109#issuecomment-1912240324
import OpenAI from "openai";


let openaiInstance: OpenAI;

/**
 * Initialize the OpenAI Singleton with an API key
 * @param apiKey - The API key for OpenAI
 */
function initializeOpenAISingleton(apiKey: string) {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({ apiKey });
  }
}

/**
 * Get the OpenAI Singleton instance
 * @returns - The OpenAI Singleton instance
 */
export function getOpenAI(apiKey: string): OpenAI {
  if (!openaiInstance) {
    initializeOpenAISingleton(apiKey);
  }
  return openaiInstance;
}
