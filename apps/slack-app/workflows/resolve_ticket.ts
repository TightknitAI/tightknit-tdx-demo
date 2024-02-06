import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { CreateAiKnowledgeArticle } from "../functions/create_ai_knowledge_article.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const ResolveTicketWorkflow = DefineWorkflow({
  callback_id: "resolve_ticket",
  title: "Resolve customer conversation",
  description: "Resolves a customer conversation ticket",
  input_parameters: {
    properties: {
      message_ts: {
        type: Schema.types.string,
      },
    },
    required: ["message_ts"],
  },
});

ResolveTicketWorkflow.addStep(CreateAiKnowledgeArticle, {
  message_ts: ResolveTicketWorkflow.inputs.message_ts,
});

export default ResolveTicketWorkflow;
