import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { generateArticleFromSlackThread } from "../lib/generate-article-from-slack-thread.ts";
import {
  getArticleTitleFromText,
  getArticleUrlNameFromText,
} from "../lib/get-article-info.ts";

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
      message_ts: {
        type: Schema.types.string,
        description: "Message timestamp",
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
  async ({ inputs, client, env }) => {
    const {
      message_ts,
    } = inputs;

    console.log("CREATE AI ARTICLE", message_ts);

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "Do you want to generate a new Salesforce Knowledge article based on the results of this conversation?",
        },
      },
      {
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
      },
    ];

    const msgResponse = await client.chat.postMessage({
      channel: env["SLACK_CHANNEL_ID"],
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
    async function ({ action, body, client, env }) {
      console.log("Incoming action handler invocation", action);

      const thread_ts = body.message?.thread_ts || body.message?.ts;
      if (!thread_ts) {
        console.log("No thread_ts or ts in the message, aborting");
        return;
      }

      // Update the manager's message to remove the buttons and reflect the approval
      // state. Nice little touch to prevent further interactions with the buttons
      // after one of them were clicked.
      const msgUpdate = await client.chat.update({
        channel: body.container.channel_id,
        ts: body.container.message_ts,
        blocks: [
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `⏳ Generating...`,
              },
            ],
          },
        ],
      });
      if (!msgUpdate.ok) {
        console.log(
          "Error during manager chat.update to generating state!",
          msgUpdate.error,
        );
      }

      // WARNING: Slack may kill this function if it times out (>10.0s)
      // in which case, even if our article is generated, we won't be able to update the Slack message
      // or post a new message with the article content...
      // See possible planned timeout extension: https://github.com/slackapi/deno-slack-sdk/issues/227#issuecomment-1929596444
      let generatedArticle;
      if (env["AI_ARTICLE_PLACEHOLDER"]) {
        // demo purposes - use a placeholder and wait
        generatedArticle = env["AI_ARTICLE_PLACEHOLDER"];
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        await generateArticleFromSlackThread({
          client,
          env,
          channel: body.container.channel_id,
          thread_ts,
        });
      }

      if (!generatedArticle) {
        console.error("Failed to generate Knowledge article");
        await client.functions.completeError({
          error: "Failed to generate Knowledge article",
          function_execution_id: body.function_data.execution_id,
          outputs: {},
        });
        return;
      }

      // FYI: Slack's string type limit is 4000 bytes: https://api.slack.com/automation/types#all-built-in-types
      // which we will unsafely estimate is about 2000-4000 characters depending on language, so lets take lower bound.
      // Also make sure you observe the length specified on the field of your Salesforce Knowledge object.
      generatedArticle = generatedArticle.substring(0, 2000);

      const msgUpdate2 = await client.chat.update({
        channel: body.container.channel_id,
        ts: body.container.message_ts,
        blocks: [
          {
            type: "context",
            elements: [
              {
                type: "plain_text",
                text: generatedArticle,
              },
            ],
          },
        ],
        // Fallback text to use when rich media can't be displayed (i.e. notifications) as well as for screen readers
        text: generatedArticle,
      });
      if (!msgUpdate2.ok) {
        console.log(
          "Error during manager chat.update to article content!",
          msgUpdate.error,
        );
      }

      const articleTitle = getArticleTitleFromText({
        text: generatedArticle,
      });
      const articleUrlName = getArticleUrlNameFromText({
        text: articleTitle,
      });
      console.log(`Suggested article title: "${articleTitle}"`);
      console.log(`Suggested article urlName: ${articleUrlName}`);

      // TODO change this to your own workflow trigger link
      const createKnowledgeArticleTriggerLink =
        "https://slack.com/shortcuts/Ft06LE0R6ZHU/972feacf0445eadab322cdcfec938ba7";
      const msgResponse = await client.chat.postMessage({
        channel: env["SLACK_CHANNEL_ID"],
        thread_ts,
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text":
                "Do you want to create a draft of this article in Salesforce Knowledge?",
            },
          },
          {
            "type": "actions",
            "block_id": "save-draft-article-block-id",
            "elements": [
              {
                type: "workflow_button",
                action_id: "save-draft-article-action-id",
                text: {
                  type: "plain_text",
                  text: "💾 Save Knowledge (draft)",
                  emoji: true,
                },
                style: "primary",
                workflow: {
                  trigger: {
                    url: createKnowledgeArticleTriggerLink,
                    customizable_input_parameters: [
                      {
                        name: "thread_ts",
                        value: thread_ts,
                      },
                      {
                        name: "article_title",
                        value: articleTitle,
                      },
                      {
                        name: "article_url_name",
                        value: articleUrlName,
                      },
                      {
                        name: "article_body",
                        value: generatedArticle,
                      },
                    ],
                  },
                },
              },
            ],
          },
        ],
        text: `Do you want to save this Salesforce Knowledge article (draft)?`,
      });

      if (!msgResponse.ok) {
        console.log(
          "Error during requester update chat.postMessage!",
          msgResponse.error,
          msgResponse,
        );
      }

      // And now we can mark the function as 'completed' - which is required as
      // we explicitly marked it as incomplete in the main function handler.
      await client.functions.completeSuccess({
        function_execution_id: body.function_data.execution_id,
        outputs: {},
      });
    },
  );
