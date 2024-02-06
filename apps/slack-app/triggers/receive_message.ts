import { TriggerTypes } from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-sdk/types.ts";
import ReceiveMessageWorkflow from "../workflows/receive_message.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const receiveMessage: Trigger<typeof ReceiveMessageWorkflow.definition> = {
  type: TriggerTypes.Webhook,
  name: "Receive a message",
  description: "Receive a message and create a new thread in the channel",
  workflow: "#/workflows/receive_message",
  inputs: {
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

export default receiveMessage;
