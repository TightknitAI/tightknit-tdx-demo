// import {
//   ChatCompletionSystemMessageParam
// } from 'openai/resources';
import { SlackAPIClient } from "deno-slack-sdk/deps.ts";
import { generateAiArticle } from './openai/generate-ai-article.ts';
import { getOpenAI } from './openai/openai.ts';

export type GroundingMessage = {
  userIdOrName: string;
  text: string;
};

/**
 * Generate an article from a Slack message thread using OpenAI
 * @param params - the params
 * @param params.channel - the slack channel ID
 * @param params.thread_ts - the timestamp of the top-level message of the thread
 * @param params.openAiApiKey - the OpenAI API key
 * @returns - the article text
 */
export async function generateArticleFromSlackThread({
  channel,
  thread_ts,
  openAiApiKey,
  client
}: {
  channel: string;
  thread_ts: string;
  openAiApiKey: string;
  client: SlackAPIClient;
}): Promise<string | null> {
  const openai = getOpenAI(openAiApiKey);

  const cursorPaginationResponse = await client.conversations.replies({
    channel,
    ts: thread_ts,
  });
  if (!cursorPaginationResponse.ok || !cursorPaginationResponse.messages) {
    console.error("Failed to get thread messages from conversations.replies", cursorPaginationResponse);
    return null;
  }
  console.log("cursorPaginationResponse", cursorPaginationResponse);

  const groundingMessages : GroundingMessage[] = cursorPaginationResponse.messages
  .filter((message: any, index: number) => {
    // Always include the first message
    if (index === 0) {
      return true;
    }
    // Exclude bot replies, especially from our app
    return !message.bot_id && !message.app_id;
  })
  .map((message: any) => ({
      userIdOrName: message.user,
      text: message.text
    })
  );
  console.log("groundingMessages", groundingMessages);

  const answer = await generateAiArticle({
    openAiApiKey,
    groundingMessages,
  });

  return answer;
}
