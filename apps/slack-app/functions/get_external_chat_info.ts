import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SalesforceAgentChatsDatastore from "../datastores/salesforce_agent_chats.ts";

export const GetExternalChatInfo = DefineFunction({
  callback_id: "get_external_chat_info_function",
  title: "Get External Chat Info",
  description: "Gets the metadata about the external chat record",
  source_file: "functions/get_external_chat_info.ts",
  input_parameters: {
    properties: {
      user_id: {
        type: Schema.types.string,
        description:
          "The Slack user id of the user replying to the chat message",
      },
      channel_id: {
        type: Schema.types.string,
        description:
          "The Slack channel the external chat message was posted in",
      },
      message_ts: {
        type: Schema.types.string,
        description:
          "The message timestamp of the Slack message representing the external chat message",
      },
    },
    required: ["channel_id", "user_id", "message_ts"],
  },
  output_parameters: {
    properties: {
      chatConversationId: {
        type: Schema.types.string,
        description:
          "The parent record id of the external chat object (Chat_Conversation__c) in Salesforce",
      },
      senderName: {
        type: Schema.types.string,
        description: "The name of the sender of the outbound message",
      },
      senderPhotoUrl: {
        type: Schema.types.string,
        description:
          "The profile photo URL of the sender of the outbound message",
      },
      sentAt: {
        type: Schema.types.string,
        description: "The date time of the outbound message",
      },
    },
    required: ["chatConversationId", "senderName", "senderPhotoUrl", "sentAt"],
  },
});

export default SlackFunction(
  GetExternalChatInfo,
  async ({ inputs, client }) => {
    const { user_id, channel_id, message_ts } = inputs;

    if (!user_id || !channel_id || !message_ts) {
      console.error("Invalid args provided", inputs);
      return {
        error:
          "Contact the app maintainers with the following information - (error: Invalid args provided to GetExternalChatInfo)",
      };
    }

    // 1. Get the ts of the parent message
    const conversationsRepliesResponse = await client.conversations.replies({
      channel: channel_id,
      ts: message_ts,
    });
    if (
      !conversationsRepliesResponse || !conversationsRepliesResponse.ok ||
      !conversationsRepliesResponse.messages
    ) {
      const errorMsg =
        `Error retrieving message replies. Contact the app maintainers with the following information - (Error detail: message "${message_ts}" in channel ${channel_id})`;
      console.log(errorMsg);
      return { error: errorMsg };
    }
    const firstMessage = conversationsRepliesResponse.messages[0];
    const thread_ts = firstMessage.thread_ts || firstMessage.ts;

    // 2. Get the id of the tracked support conversation associated with the thread
    const queryResponse = await client.apps.datastore.query({
      "datastore": SalesforceAgentChatsDatastore.name,
      "expression": "#message_ts_col = :thread_ts",
      "expression_attributes": { "#message_ts_col": "message_ts" },
      "expression_values": { ":thread_ts": thread_ts },
    });

    if (!queryResponse || !queryResponse.ok) {
      const errorMsg =
        `Error retrieving conversation of parent thread history in datastore. Contact the app maintainers with the following information - (Error detail: ${queryResponse.error})`;
      console.log(errorMsg);
      return { error: errorMsg };
    }

    if (!queryResponse.items || queryResponse.items.length === 0) {
      const errorMsg =
        `No active tracked support conversation found for Slack thread_ts "${thread_ts}. Contact the app maintainers with the following information - (Error detail: ${queryResponse.error})`;
      console.log(errorMsg);
      return { error: errorMsg };
    }
    const chatConversationId = queryResponse.items[0].id;
    console.log("chatConversationId", chatConversationId);

    // 3. Get the sender's user info
    const usersInfoResponse = await client.users.info({
      user: user_id,
    });
    if (!usersInfoResponse || !usersInfoResponse.ok) {
      const errorMsg =
        `Error retrieving user info for sender of reply. Contact the app maintainers with the following information - (Error detail: ${queryResponse.error})`;
      console.log(errorMsg);
      return { error: errorMsg };
    }
    const senderName = usersInfoResponse.user.real_name;
    const senderPhotoUrl = usersInfoResponse.user.profile.image_72 ||
      usersInfoResponse.user.image_192 || usersInfoResponse.user.image_512 ||
      usersInfoResponse.user.image_original;

    // 4. Get current date time - now
    const sentAt = new Date().toISOString();

    return {
      outputs: {
        chatConversationId,
        senderName,
        senderPhotoUrl,
        sentAt,
      },
    };
  },
);
