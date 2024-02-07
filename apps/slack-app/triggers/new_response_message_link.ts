import { TriggerTypes } from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-sdk/types.ts";
import SendMessageWorkflow from "../workflows/send_message.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const sendMessageLink: Trigger<typeof SendMessageWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Send a message (LINK)",
  description: "Send a message to a chatbot (LINK)",
  workflow: "#/workflows/send_message",
  // event: {
  //   event_type: TriggerEventTypes.MessagePosted,
  //   channel_ids: ["C06FQR45E7R"],
  //   filter: {
  //     version: 1,
  //     root: {
  //       operator: "AND",
  //       inputs: [
  //         {
  //           // ignore bot message replies, especially from our app
  //           statement: "{{data.app_id}} == null",
  //         },
  //         {
  //           // only process threaded replies
  //           operator: "NOT",
  //           inputs: [{
  //             statement: "{{data.thread_ts}} == null",
  //           }],
  //         },
  //       ],
  //     },
  //   },
  // },
  inputs: {
    text: {
      value: "TriggerContextData.Event.MessagePosted.text",
    },
    thread_ts: {
      value: "TriggerContextData.Event.MessagePosted.thread_ts",
    },
    user_id: {
      value: "TriggerContextData.Event.MessagePosted.user_id",
    },
  },
};

export default sendMessageLink;
