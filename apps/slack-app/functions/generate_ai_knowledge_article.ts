import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

const GENERATE_ARTICLE_BUTTON_ACTION_ID = "generate-kav-action-id";

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
  // output_parameters: {
  //   properties: {
  //     // channel: {
  //     //   type: Schema.slack.types.channel_id,
  //     // },
  //     // chatConversationId: {
  //     //   type: Schema.types.string,
  //     //   description: "ID of the ChatConversation__c record",
  //     // },
  //     message_ts: {
  //       type: Schema.types.string,
  //       description: "Message timestamp",
  //     },
  //   },
  //   required: ["message_ts"],
  // },
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
            text: "✨ Generate AI Article",
          },
          action_id: GENERATE_ARTICLE_BUTTON_ACTION_ID,
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

    // IMPORTANT! Set `completed` to false in order to keep the interactivity
    // points (the approve/deny buttons) "alive"
    // We will set the function's complete state in the button handlers below.
    return {
      completed: false,
    };
  },
)
  .addBlockActionsHandler(
    // listen for interactions with components with the following action_ids
    GENERATE_ARTICLE_BUTTON_ACTION_ID,
    // interactions with the above two action_ids get handled by the function below
    async function ({ action, body, client }) {
      console.log("Incoming action handler invocation", action);
      // console.log(body);

      // const approved = action.action_id === APPROVE_ID;
      const parentMessageTs = body.container.message_ts;

      const msgResponse = await client.chat.postMessage({
        channel: "C06FQR45E7R", // TODO make configurable
        thread_ts: parentMessageTs,
        blocks: [{
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Generating...`,
            },
          ],
        }],
        text: `Generating the Knowledge Article...`,
      });
      if (!msgResponse.ok) {
        console.log(
          "Error during requester update chat.postMessage!",
          msgResponse.error,
        );
      }
      // // Update the manager's message to remove the buttons and reflect the approval
      // // state. Nice little touch to prevent further interactions with the buttons
      // // after one of them were clicked.
      // const msgUpdate = await client.chat.update({
      //   channel: body.container.channel_id,
      //   ts: body.container.message_ts,
      //   blocks: [
      //     {
      //       type: "context",
      //       elements: [
      //         {
      //           type: "mrkdwn",
      //           text: `Done`,
      //         },
      //       ],
      //     },
      //   ],
      // });
      // if (!msgUpdate.ok) {
      //   console.log("Error during manager chat.update!", msgUpdate.error);
      // }

      // And now we can mark the function as 'completed' - which is required as
      // we explicitly marked it as incomplete in the main function handler.
      await client.functions.completeSuccess({
        function_execution_id: body.function_data.execution_id,
        outputs: {},
      });
    },
  );
