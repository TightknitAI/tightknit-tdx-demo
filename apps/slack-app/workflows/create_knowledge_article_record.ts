import { Connectors } from "deno-slack-hub/mod.ts";
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const CreateKnowledgeArticleRecordWorkflow = DefineWorkflow({
  callback_id: "create_knowledge_article_record_workflow",
  title: "Create Knowledge Article Record (Salesforce)",
  description: "Create a Knowledge article record in Salesforce",
  input_parameters: {
    properties: {
      // interactivity is necessary for opening a modal
      interactivity: { type: Schema.slack.types.interactivity },
      channel: {
        type: Schema.slack.types.channel_id,
        description: "The Slack channel id to sync the external message to",
      },
      thread_ts: {
        type: Schema.types.string,
      },
      article_title: {
        type: Schema.types.string,
      },
      article_url_name: {
        type: Schema.types.string,
        description:
          "The URL slug of the article (alphanumeric characters separated by hyphens)",
      },
      article_body: {
        type: Schema.types.string,
      },
    },
    required: [
      "thread_ts",
      "article_title",
      "article_url_name",
      "article_body",
    ],
  },
});

// Create the Lightning Knowledge Article Version record (Knowledge__kav object)
const createKAVRecordStep = CreateKnowledgeArticleRecordWorkflow.addStep(
  Connectors.Salesforce.functions.CreateRecord,
  {
    salesforce_object_name: "Knowledge__kav",
    // Metadata to attach to this record, as an array of keys and their values values. Each key should be associated with the API name of a field you want to provide a value for.
    metadata: {
      "Title": CreateKnowledgeArticleRecordWorkflow.inputs.article_title,
      "UrlName": CreateKnowledgeArticleRecordWorkflow.inputs.article_url_name,

      "Description__c":
        CreateKnowledgeArticleRecordWorkflow.inputs.article_body,
      // "IsVisibleInApp": true,
      // "IsVisibleInPkb": true,
      // "PublishStatus": "Draft",
      // "Language": "en_US",
    },
    salesforce_access_token: { credential_source: "END_USER" },
  },
);

// Send notification of new record in the thread
CreateKnowledgeArticleRecordWorkflow.addStep(
  Schema.slack.functions.ReplyInThread,
  {
    message_context: {
      message_ts: CreateKnowledgeArticleRecordWorkflow.inputs.thread_ts,
      channel_id: CreateKnowledgeArticleRecordWorkflow.inputs.channel,
    },
    message:
      `Created Knowledge Article: <${createKAVRecordStep.outputs.record_url}|${createKAVRecordStep.outputs.record_id}>`,
  },
);

export default CreateKnowledgeArticleRecordWorkflow;
