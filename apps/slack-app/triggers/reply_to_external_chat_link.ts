import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-sdk/types.ts";
import ReplyToExternalChatWorkflow from "../workflows/reply_to_external_chat.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const replyToExternalChat: Trigger<
  typeof ReplyToExternalChatWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Reply to external chat (link)",
  description: "Reply to external chat (link)",
  workflow: "#/workflows/reply_to_external_chat_workflow",
  inputs: {
    // interactivity is necessary for opening a modal
    interactivity: { value: TriggerContextData.Shortcut.interactivity },
    message_ts: {
      value: TriggerContextData.Shortcut.message_ts,
    },
    channel_id: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    user_id: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default replyToExternalChat;
