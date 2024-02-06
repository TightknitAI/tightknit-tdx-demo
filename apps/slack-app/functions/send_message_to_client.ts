import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SalesforceAgentChatsDatastore from "../datastores/salesforce_agent_chats.ts";

// TODO rename function
export const SendMessageToClient = DefineFunction({
  callback_id: "send_message_to_client",
  title: "Send a message to Salesforce",
  description: "Send a message to Salesforce",
  source_file: "functions/send_message_to_client.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.slack.types.rich_text,
      },
      thread_ts: {
        type: Schema.types.string,
      },
    },
    required: ["message"],
  },
  output_parameters: {
    properties: {
      chatConversationId: {
        type: Schema.types.string,
      },
      message: {
        type: Schema.slack.types.rich_text,
      },
    },
    required: [],
  },
});

export default SlackFunction(
  SendMessageToClient,
  async ({ inputs, client }) => {
    const { message, thread_ts } = inputs;

    if (!thread_ts) {
      console.warn("No thread_ts provided");
      return { outputs: {} };
    }

    // 1. Check if the reply is in a tracked/active custom support thread
    console.log(
      "QUERY:",
      JSON.stringify({
        datastore: SalesforceAgentChatsDatastore.name,
        expression: "#message_ts_col = :thread_ts",
        expression_attributes: { "#message_ts_col": "message_ts" },
        expression_values: { ":thread_ts": thread_ts },
      }),
    );
    const queryResponse = await client.apps.datastore.query({
      "datastore": SalesforceAgentChatsDatastore.name,
      "expression": "#message_ts_col = :thread_ts",
      "expression_attributes": { "#message_ts_col": "message_ts" },
      "expression_values": { ":thread_ts": thread_ts },
    });
    console.log("queryResponse", queryResponse);

    if (!queryResponse || !queryResponse.ok) {
      const errorMsg =
        `Error retrieving conversation of parent thread history in datastore. Contact the app maintainers with the following information - (Error detail: ${queryResponse.error})`;
      console.log(errorMsg);
      return { error: errorMsg };
    }

    if (!queryResponse.items || queryResponse.items.length === 0) {
      console.info(
        `No active tracked support conversation found for Slack thread_ts "${thread_ts}". Ignoring...`,
      );
      return {
        outputs: {},
      };
    }
    const chatConversationId = queryResponse.items[0].id;
    console.log("chatConversationId", chatConversationId);

    // 2. If the reply is in a tracked/active custom support thread, return the info to create a ChatMessage__c record in Salesforce
    return {
      outputs: { chatConversationId, message },
    };
  },
);
