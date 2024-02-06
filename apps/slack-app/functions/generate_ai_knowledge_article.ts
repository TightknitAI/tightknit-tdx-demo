import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const GenerateAiKnowledgeArticle = DefineFunction({
  callback_id: "generate_ai_knowledge_article",
  title: "Generate AI Knowledge Article",
  description:
    "Gives the agent the option to capture the conversation in an AI-generated Knowledge Article (draft)",
  source_file: "functions/generate_ai_knowledge_article.ts",
  input_parameters: {
    properties: {
      // channel: {
      //   type: Schema.slack.types.channel_id,
      // },
      // chatConversationId: {
      //   type: Schema.types.string,
      //   description: "ID of the ChatConversation__c record",
      // },
      message_ts: {
        type: Schema.types.string,
        description: "Message timestamp",
      },
      // authorUsername: {
      //   type: Schema.types.string,
      //   description: "The name of the author sending the message",
      // },
      // authorPhotoUrl: {
      //   type: Schema.types.string,
      //   description: "The URL of the author's profile photo",
      // },
      // iconEmoji: {
      //   type: Schema.types.string,
      //   description: "The emoji to use as the message's icon",
      // },
      // postAsUser: {
      //   type: Schema.types.boolean,
      //   description:
      //     "If true, will display the message as if it was quoted from the user",
      //   default: true,
      // },
    },
    required: ["message_ts"],
  },
  output_parameters: {
    properties: {
      // channel: {
      //   type: Schema.slack.types.channel_id,
      // },
      // chatConversationId: {
      //   type: Schema.types.string,
      //   description: "ID of the ChatConversation__c record",
      // },
      message_ts: {
        type: Schema.types.string,
        description: "Message timestmapt",
      },
    },
    required: ["message_ts"],
  },
});

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  GenerateAiKnowledgeArticle,
  async ({ inputs, client }) => {
    const {
      message_ts,
    } = inputs;

    console.log("CREATE AI ARTICLE", message_ts);

    const blocks = [{
      "type": "actions",
      "block_id": "generate-knowledge-article-button",
      "elements": [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Approve",
          },
          action_id: "APPROVE_ID",
          style: "primary",
        },
      ],
    }];

    const msgResponse = await client.chat.postMessage({
      channel: "C06FQR45E7R", // TODO make configurable
      thread_ts: message_ts,
      blocks,
      // Fallback text to use when rich media can't be displayed (i.e. notifications) as well as for screen readers
      text:
        "Do you want to generate a new Salesforce Knowledge article based on this conversation?",
      icon_emoji: ":sparkles:",
    });

    if (!msgResponse.ok) {
      console.log("Error during request chat.postMessage!", msgResponse.error);
    }

    // Return all inputs as outputs for consumption in subsequent functions
    return {
      outputs: { message_ts },
    };
  },
);
