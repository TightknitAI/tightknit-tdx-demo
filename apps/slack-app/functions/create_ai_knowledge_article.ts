import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const CreateAiKnowledgeArticle = DefineFunction({
  callback_id: "create_ai_knowledge_article",
  title: "Create AI Knowledge Article",
  description:
    "Gives the agent the option to capture the conversation in an AI-generated Knowledge Article (draft)",
  source_file: "functions/create_ai_knowledge_article.ts",
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
  CreateAiKnowledgeArticle,
  async ({ inputs, client }) => {
    const {
      message_ts,
    } = inputs;

    console.log("CREATE AI ARTICLE", message_ts);

    // Return all inputs as outputs for consumption in subsequent functions
    return {
      outputs: { message_ts },
    };
  },
);
