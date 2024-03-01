import { Env } from "deno-slack-sdk/types.ts";
import { getOpenAI } from "./openai.ts";

export type GroundingMessage = {
  userIdOrName: string;
  text: string;
};

/**
 * Generate an answer for a message using OpenAI
 * @param params - the params
 * @param params.env - the Slack environment variables
 * @param params.groundingMessages - messages from the conversation (in chronological order) to ground the AI
 * @returns - the AI-generated answer
 */
export async function generateAiArticle({
  env,
  groundingMessages,
}: {
  env: Env;
  groundingMessages: GroundingMessage[];
}): Promise<string | null> {
  const openai = getOpenAI(env);

  const systemMessage = {
    role: "system",
    name: "system",
    content: `You are a representative tasked with writing a helpful Knowledge Article based on the results of a resolved conversation between a support agent and a customer.
    You have been given the transcript of the conversation between the agent and customer.
    The first message is from the customer.
    You will only use the content of the conversation to generate the article. Do not use any other background information. Do not mention the agent, customer, or their conversation directly.
    Your task is to generate a helpful, instructive, and professional knowledge article outlining the issue and how it is solved, in order to help future customers resolve similar issues and prevent the need for them to open a case. It should be plain text, with no markdown formatting.`,
  };

  const openAiGroundingMessages = groundingMessages.map((groundingMessage) => {
    const trainingMessage = {
      role: "system",
      name: groundingMessage.userIdOrName,
      content: `[USER ${groundingMessage.userIdOrName}]: ${groundingMessage.text}`,
    };
    return trainingMessage;
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [systemMessage, ...openAiGroundingMessages],
    max_tokens: 400, // 1 token is about 4 characters
  } as any); // TODO fix typescript typing

  const answer = response.choices[0].message.content;

  return answer;
}
