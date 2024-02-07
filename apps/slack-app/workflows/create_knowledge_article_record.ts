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
      // message_ts: {
      //   type: Schema.types.string,
      // },
      // channel_id: {
      //   type: Schema.types.string,
      // },
      // user_id: {
      //   type: Schema.types.string,
      //   description: "The Slack user id of the user that started the workflow",
      // },
    },
    required: ["article_title", "article_url_name", "article_body"],
  },
});

// 1. Create the Lightning Knowledge record (Knowledge__ka object)
// const createKnowledgeArticleRecordStep = CreateKnowledgeArticleRecordWorkflow
//   .addStep(
//     Connectors.Salesforce.functions.CreateRecord,
//     {
//       salesforce_object_name: "KnowledgeArticle",
//       // Metadata to attach to this record, as an array of keys and their values values. Each key should be associated with the API name of a field you want to provide a value for.
//       metadata: {
//         // "ArticleNumber": "00010101010",
//         // "TotalViewCount": 0,

//         "Title": "Sample Article",
//         "Summary": "This is a sample article summary.",
//         "ArticleType": "Knowledge__kav",
//         "Language": "en_US",
//         "UrlName": "sample-article",
//         // "KnowledgeArticleId": "kaXXXXXXXXXXXXXX",
//         "ArticleNumber": "KAXXXXXXX",
//         "VersionNumber": "1",
//         "IsVisibleInApp": true,
//         "IsVisibleInPkb": true,
//       },
//       salesforce_access_token: { credential_source: "END_USER" },
//     },
//   );
// console.log(
//   "createKnowledgeArticleRecordStep",
//   createKnowledgeArticleRecordStep,
// );

// // 1. Create the Lightning Knowledge record (Knowledge__ka object)
// const createKARecordStep = CreateKnowledgeArticleRecordWorkflow.addStep(
//   Connectors.Salesforce.functions.CreateRecord,
//   {
//     salesforce_object_name: "Knowledge__ka",
//     // Metadata to attach to this record, as an array of keys and their values values. Each key should be associated with the API name of a field you want to provide a value for.
//     metadata: {
//       "ArticleNumber": "00010101010",
//       "TotalViewCount": 0,
//     },
//     salesforce_access_token: { credential_source: "END_USER" },
//   },
// );
// console.log("createKARecordStep", createKARecordStep);

// 2. Create the Lightning Knowledge Article Version record (Knowledge__kav object)
const createKAVRecordStep = CreateKnowledgeArticleRecordWorkflow.addStep(
  Connectors.Salesforce.functions.CreateRecord,
  {
    salesforce_object_name: "Knowledge__kav",
    // Metadata to attach to this record, as an array of keys and their values values. Each key should be associated with the API name of a field you want to provide a value for.
    metadata: {
      // "KnowledgeArticleId": "kA0Hs000000SPYvKAO", //createKARecordStep.outputs.record_id,
      // "Name": "title12",
      "Title": CreateKnowledgeArticleRecordWorkflow.inputs.article_title,
      "UrlName": CreateKnowledgeArticleRecordWorkflow.inputs.article_url_name,
      // "IsVisibleInApp": true,
      // "IsVisibleInPkb": true,
      "Description__c":
        CreateKnowledgeArticleRecordWorkflow.inputs.article_body,
      // "Summary": "",
      // "PublishStatus": "Draft",
      // "Language": "en_US",
      // "ArticleMasterLanguage": "en_US",
      // "VersionNumber": 0,
    },
    salesforce_access_token: { credential_source: "END_USER" },
  },
);

CreateKnowledgeArticleRecordWorkflow.addStep(
  Schema.slack.functions.SendMessage,
  {
    channel_id: "C06FQR45E7R",
    message:
      `<${createKAVRecordStep.outputs.record_url}|${createKAVRecordStep.outputs.record_id}>`,
  },
);

export default CreateKnowledgeArticleRecordWorkflow;
