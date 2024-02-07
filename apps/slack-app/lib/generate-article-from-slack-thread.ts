import { SlackAPIClient } from "deno-slack-sdk/deps.ts";
import { CHAT_CONTENT_EVENT_TYPE, IS_CHAT_CONTENT_KEY_NAME } from "../functions/post_message_or_reply_from_external.ts";
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
    include_all_metadata: true, // we need the metadata we set for chat messages
  });
  if (!cursorPaginationResponse.ok || !cursorPaginationResponse.messages) {
    console.error("Failed to get thread messages from conversations.replies", cursorPaginationResponse);
    return null;
  }
  console.log("cursorPaginationResponse", cursorPaginationResponse);

  const groundingMessages : GroundingMessage[] = cursorPaginationResponse.messages
  .filter((message: any, index: number) => {
    // only include messages with metadata that we marked
    // as part of the overall external conversation
    console.log(`METADATA ${index}: `, message.metadata);
    return message.metadata && message.metadata.event_type === CHAT_CONTENT_EVENT_TYPE && message.metadata.event_payload && message.metadata.event_payload[IS_CHAT_CONTENT_KEY_NAME] === true;
  })
  .map((message: any) => ({
      userIdOrName: message.user,
      // Get the 'text' field of each Slack message
      // This assumes no vital information lives only in the 'blocks' field
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
