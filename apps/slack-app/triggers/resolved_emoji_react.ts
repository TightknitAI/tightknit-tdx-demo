import {
  TriggerContextData,
  TriggerEventTypes,
  TriggerTypes,
} from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-sdk/types.ts";
import ResolveTicketWorkflow from "../workflows/resolve_ticket.ts";

/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const resolvedEmojiReactAdded: Trigger<
  typeof ResolveTicketWorkflow.definition
> = {
  type: TriggerTypes.Event,
  name: "Emoji react added",
  description: "Trigger for resolution emoji react added",
  workflow: "#/workflows/resolve_ticket",
  event: {
    event_type: TriggerEventTypes.ReactionAdded,
    channel_ids: ["C06FQR45E7R"],
    filter: {
      version: 1,
      root: {
        statement: "{{data.reaction}} == white_check_mark",
      },
    },
  },
  inputs: {
    // text: {
    //   // value: TriggerContextData.Event.MessagePosted.text,
    //   value: "REACTION!",
    // },
    message_ts: {
      value: TriggerContextData.Event.ReactionAdded.message_ts,
    },
    // user_id: {
    //   value: TriggerContextData.Event.ReactionAdded.user_id,
    // },
  },
};

export default resolvedEmojiReactAdded;
