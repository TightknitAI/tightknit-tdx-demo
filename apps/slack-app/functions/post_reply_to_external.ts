import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const PostReplyToExternal = DefineFunction({
  callback_id: "post_reply_to_external",
  title:
    "Post a threaded reply, representing an outbound message to an external chat, in a channel",
  description:
    "Post a threaded reply, representing an outbound message to an external chat, in a channel",
  source_file: "functions/post_reply_to_external.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      thread_ts: {
        type: Schema.types.string,
        description: "The thread_ts of the thread to add the message to",
      },
      message: {
        type: Schema.types.string,
        description: "Message content",
      },
      senderName: {
        type: Schema.types.string,
        description: "The name of the author sending the message",
      },
      senderPhotoUrl: {
        type: Schema.types.string,
        description: "The URL of the author's profile photo",
      },
    },
    required: ["thread_ts", "message", "channel"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  PostReplyToExternal,
  async ({ inputs, client }) => {
    const {
      channel,
      thread_ts,
      message,
      senderName,
      senderPhotoUrl,
    } = inputs;

    // Send a threaded reply to the message associated with the conversation
    const chatPostMessageResponse = await client.chat.postMessage({
      channel,
      username: senderName ? senderName : undefined,
      icon_url: senderPhotoUrl ? senderPhotoUrl : undefined,
      thread_ts: thread_ts,
      text: message,
      blocks: [
        {
          "type": "rich_text",
          "elements": [
            {
              "type": "rich_text_quote",
              "elements": [
                {
                  "type": "text",
                  "text": message,
                },
              ],
            },
          ],
        },
        {
          type: "divider",
        },
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "_Sent to external chat_",
          },
        },
      ],
    });
    if (!chatPostMessageResponse || !chatPostMessageResponse.ok) {
      const postErrorMsg =
        `Error posting threaded reply to message thread "${thread_ts}" for external chat reply. Contact the app maintainers with the following information - (Error detail: ${chatPostMessageResponse.error})`;
      console.log(postErrorMsg);
      return { error: postErrorMsg };
    }

    // Return all inputs as outputs for consumption in subsequent functions
    return {
      completed: true,
      outputs: {},
    };
  },
);
