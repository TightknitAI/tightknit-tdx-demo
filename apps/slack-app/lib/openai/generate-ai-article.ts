// import {
//   ChatCompletionSystemMessageParam
// } from 'openai/resources';
import { getOpenAI } from './openai.ts';

export type GroundingMessage = {
  userIdOrName: string;
  text: string;
};

/**
 * Generate an answer for a message using OpenAI
 * @param params - the params
 * @param params.groundingMessages - messages from the conversation (in chronological order) to ground the AI
 * @param params.messageTimestamp - the message timestamp
 * @returns - the answer
 */
export async function generateAiArticle({
  openAiApiKey,
  groundingMessages,
}: {
  openAiApiKey: string;
  groundingMessages: GroundingMessage[];
}): Promise<string | null> {
  const openai = getOpenAI(openAiApiKey);

  // const systemMessage: ChatCompletionSystemMessageParam = {
  const systemMessage = {
    role: 'system',
    name: 'system',
    content: `You are a customer support representative tasked with writing a helpful Knowledge Article based on the results of a resolved conversation between a support agent and a customer.
    You have been given the messages of the conversation between the agent and customer.
    The first message is from the customer.
    You will only use the content of the conversation to generate the article. Do not use any other background information.
    Your task is to generate a helpful, instructive, and professional knowledge article outlining the issue and how it is solved, in order to help future customers solve similar issues. It should be plain text, with no markdown formatting.`
  };

  const openAiGroundingMessages = groundingMessages.map((groundingMessage) => {
    // const trainingMessage: ChatCompletionSystemMessageParam = {
    const trainingMessage = {
      role: 'system',
      name: groundingMessage.userIdOrName,
      content: `[USER ${groundingMessage.userIdOrName}]: ${groundingMessage.text}`
    };
    return trainingMessage;
  });

  console.log(
    'groundingMessages',
    openAiGroundingMessages
  );

  // const userMessage: ChatCompletionUserMessageParam = {
  //   role: 'user',
  //   content: originalMessageText
  // };

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [systemMessage, ...openAiGroundingMessages],
    max_tokens: 2000 // 1 token is about 4 characters
  }); // TODO fix type


  console.log("openai response", response);

  const answer = response.choices[0].message.content;
  console.info('OpenAI answer:', answer);

  return answer;
}
