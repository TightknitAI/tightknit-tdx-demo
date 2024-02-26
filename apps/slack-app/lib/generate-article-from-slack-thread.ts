import { SlackAPIClient } from "deno-slack-sdk/deps.ts";
import { Env } from "deno-slack-sdk/types.ts";
import {
  CHAT_CONTENT_EVENT_TYPE,
  IS_CHAT_CONTENT_KEY_NAME,
} from "../functions/post_message_or_reply_from_external.ts";
import { generateAiArticle } from "./openai/generate-ai-article.ts";

export type GroundingMessage = {
  userIdOrName: string;
  text: string;
};

/**
 * Generate an article from a Slack message thread using OpenAI
 * @param params - the params
 * @param params.client - the Slack client
 * @param params.env - the Slack environment variables
 * @param params.channel - the slack channel ID
 * @param params.thread_ts - the timestamp of the top-level message of the thread
 * @returns - the article text
 */
export async function generateArticleFromSlackThread({
  client,
  env,
  channel,
  thread_ts,
}: {
  client: SlackAPIClient;
  channel: string;
  thread_ts: string;
  env: Env;
}): Promise<string | null> {
  const conversationsReplyResponse = await client.conversations.replies({
    channel,
    ts: thread_ts,
    include_all_metadata: true, // we need the metadata we set for chat messages
  });
  if (!conversationsReplyResponse.ok || !conversationsReplyResponse.messages) {
    console.error(
      "Failed to get thread messages from conversations.replies",
      conversationsReplyResponse
    );
    return null;
  }

  const groundingMessages: GroundingMessage[] =
    conversationsReplyResponse.messages
      .filter((message: any, index: number) => {
        // only include messages with metadata that we marked
        // as part of the overall external conversation
        return (
          message.metadata &&
          message.metadata.event_type === CHAT_CONTENT_EVENT_TYPE &&
          message.metadata.event_payload &&
          message.metadata.event_payload[IS_CHAT_CONTENT_KEY_NAME] === true
        );
      })
      .map((message: any) => ({
        userIdOrName: message.user,
        // Get the 'text' field of each Slack message
        // This assumes no vital information lives only in the 'blocks' field
        text: message.text,
      }));

  const answer = await generateAiArticle({
    env,
    groundingMessages,
  });

  return answer;
}
