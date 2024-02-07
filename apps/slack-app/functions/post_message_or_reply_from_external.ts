import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SalesforceAgentChatsDatastore from "../datastores/salesforce_agent_chats.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const PostMessageOrReplyFromExternal = DefineFunction({
  callback_id: "post_message_or_reply_from_external",
  title: "Post a message or threaded reply in a channel",
  description:
    "Post a message or a threaded reply, representing a message from an external chat, in a Slack channel",
  source_file: "functions/post_message_or_reply_from_external.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      chatConversationId: {
        type: Schema.types.string,
        description: "ID of the ChatConversation__c record",
      },
      message: {
        type: Schema.types.string,
        description: "Message content",
      },
      authorUsername: {
        type: Schema.types.string,
        description: "The name of the author sending the message",
      },
      authorPhotoUrl: {
        type: Schema.types.string,
        description: "The URL of the author's profile photo",
      },
      iconEmoji: {
        type: Schema.types.string,
        description: "The emoji to use as the message's icon",
      },
      postAsUser: {
        type: Schema.types.boolean,
        description:
          "If true, will display the message as if it was quoted from the user",
        default: true,
      },
    },
    required: ["chatConversationId", "message", "channel"],
  },
  output_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      chatConversationId: {
        type: Schema.types.string,
        description: "ID of the ChatConversation__c record",
      },
      message: {
        type: Schema.types.string,
        description: "Message content",
      },
    },
    required: ["chatConversationId", "message", "channel"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  PostMessageOrReplyFromExternal,
  async ({ inputs, client }) => {
    const {
      channel,
      chatConversationId,
      message,
      authorUsername,
      authorPhotoUrl,
      iconEmoji,
      postAsUser,
    } = inputs;

    console.log("inputs", inputs);
    console.log("message", message);

    // 1. Look up if conversation is already tracked in datastore
    const getResponse = await client.apps.datastore.get<
      typeof SalesforceAgentChatsDatastore.definition
    >({
      datastore: SalesforceAgentChatsDatastore.name,
      id: chatConversationId,
    });
    console.log("getResponse", getResponse);

    if (!getResponse.ok) {
      const getErrorMsg =
        `Error retrieving conversation history in datastore. Contact the app maintainers with the following information - (Error detail: ${getResponse.error})`;
      console.log(getErrorMsg);
      return { error: getErrorMsg };
    }

    let message_ts = getResponse.item.message_ts;
    // TODO change this to your own workflow trigger link
    const replyWebhookLink =
      "https://slack.com/shortcuts/Ft06HKR8ELHK/a2793c55ddb9fb9f99ae54ae365aadbe";
    const replyWorkflowTriggerBlocks = [{
      type: "divider",
    }, {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "_Send reply to external chat_",
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Reply",
          "emoji": true,
        },
        // webhook URL to trigger the reply_to_external_chat_workflow
        "url": replyWebhookLink,
      },
    }];

    // 2. If not tracked, create a new conversation in the datastore
    // and send a new message in channel
    if (!message_ts) {
      // send new top-level message
      const chatPostMessageResponse = await client.chat.postMessage({
        channel,
        thread_ts: message_ts,
        username: postAsUser && authorUsername ? authorUsername : undefined,
        icon_url: postAsUser && authorPhotoUrl ? authorPhotoUrl : undefined,
        icon_emoji: !postAsUser && iconEmoji ? iconEmoji : undefined,
        text: message,
        blocks: [
          // Use a blockquote for direct quotes as a visual indicator it came from a remote user
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
          ...replyWorkflowTriggerBlocks,
        ],
      });
      console.log("chatPostMessageResponse", chatPostMessageResponse);
      if (!chatPostMessageResponse || !chatPostMessageResponse.ok) {
        const postErrorMsg =
          `Error posting message. Contact the app maintainers with the following information - (Error detail: ${chatPostMessageResponse.error})`;
        console.log(postErrorMsg);
        return { error: postErrorMsg };
      }

      // save parent message in datastore
      message_ts = chatPostMessageResponse.message.ts;
      const putResponse = await client.apps.datastore.put<
        typeof SalesforceAgentChatsDatastore.definition
      >({
        datastore: SalesforceAgentChatsDatastore.name,
        item: {
          id: chatConversationId,
          channel: channel,
          message_ts,
        },
      });

      if (!putResponse.ok) {
        const saveErrorMsg =
          `Error saving draft announcement. Contact the app maintainers with the following information - (Error detail: ${putResponse.error})`;
        console.log(saveErrorMsg);
        return { error: saveErrorMsg };
      }
    } else {
      // 3. If tracked, send a threaded reply to the message associated with the conversation
      const chatPostMessageResponse = await client.chat.postMessage({
        channel,
        username: postAsUser && authorUsername ? authorUsername : undefined,
        icon_url: postAsUser && authorPhotoUrl ? authorPhotoUrl : undefined,
        icon_emoji: !postAsUser && iconEmoji ? iconEmoji : undefined,
        thread_ts: message_ts,
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
          ...replyWorkflowTriggerBlocks,
        ],
      });
      if (!chatPostMessageResponse || !chatPostMessageResponse.ok) {
        const postErrorMsg =
          `Error posting threaded reply to message "${message_ts}". Contact the app maintainers with the following information - (Error detail: ${chatPostMessageResponse.error})`;
        console.log(postErrorMsg);
        return { error: postErrorMsg };
      }
    }

    // Return all inputs as outputs for consumption in subsequent functions
    return {
      outputs: { channel, chatConversationId, message },
    };
  },
);
