import {
  TriggerContextData,
  TriggerEventTypes,
  TriggerTypes,
} from "deno-slack-api/mod.ts";
import { Trigger } from "deno-slack-sdk/types.ts";
import "std/dotenv/load.ts";
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
    channel_ids: [Deno.env.get("SLACK_CHANNEL_ID")!],
    filter: {
      version: 1,
      root: {
        statement: "{{data.reaction}} == white_check_mark",
      },
    },
  },
  inputs: {
    message_ts: {
      value: TriggerContextData.Event.ReactionAdded.message_ts,
    },
  },
};

export default resolvedEmojiReactAdded;
