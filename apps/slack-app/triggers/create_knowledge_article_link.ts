import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-sdk/types.ts";
import CreateKnowledgeArticleRecordWorkflow from "../workflows/create_knowledge_article_record.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const createKnowledgeArticleLink: Trigger<
  typeof CreateKnowledgeArticleRecordWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Create Knowledge Article (link)",
  description: "Create a knowledge article record in Salesforce (link)",
  workflow: "#/workflows/create_knowledge_article_record_workflow",
  inputs: {
    interactivity: { value: TriggerContextData.Shortcut.interactivity },
    // message_ts: {
    //   value: TriggerContextData.Shortcut.message_ts,
    // },
    // channel_id: {
    //   value: TriggerContextData.Shortcut.channel_id,
    // },
    // user_id: {
    //   value: TriggerContextData.Shortcut.user_id,
    // },
    article_title: {
      customizable: true,
    },
    article_url_name: {
      customizable: true,
    },
    article_body: {
      customizable: true,
    },
  },
};

export default createKnowledgeArticleLink;
