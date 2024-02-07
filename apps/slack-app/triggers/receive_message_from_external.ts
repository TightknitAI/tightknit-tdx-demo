import { TriggerTypes } from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-sdk/types.ts";
import ReceiveExternalMessageWorkflow from "../workflows/receive_message_from_external.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const receiveExternalMessage: Trigger<
  typeof ReceiveExternalMessageWorkflow.definition
> = {
  type: TriggerTypes.Webhook,
  name: "Receive a message",
  description: "Receive a message from an external source outside of Slack",
  workflow: "#/workflows/receive_message_from_external",
  inputs: {
    // custom inputs from body of POST webhook request
    message: {
      value: "{{data.message}}",
    },
    authorUsername: {
      value: "{{data.authorUsername}}",
    },
    authorPhotoUrl: {
      value: "{{data.authorPhotoUrl}}",
    },
    iconEmoji: {
      value: "{{data.iconEmoji}}",
    },
    chatConversationId: {
      value: "{{data.chatConversationId}}",
    },
    postAsUser: {
      value: "{{data.postAsUser}}",
    },
  },
};

export default receiveExternalMessage;
