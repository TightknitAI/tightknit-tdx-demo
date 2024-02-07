// import { Connectors } from "deno-slack-hub/mod.ts";

import { Connectors } from "deno-slack-hub/mod.ts";
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { SendMessageToClient } from "../functions/send_message_to_client.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const SendMessageWorkflow = DefineWorkflow({
  callback_id: "send_message",
  title: "Send a response message",
  description: "Send a response message to the customer",
  input_parameters: {
    properties: {
      text: {
        type: Schema.types.string,
      },
      thread_ts: {
        type: Schema.types.string,
      },
      user_id: {
        type: Schema.types.string,
      },
    },
    required: ["text", "thread_ts", "user_id"],
  },
});

const messageLookupStep = SendMessageWorkflow.addStep(SendMessageToClient, {
  message: SendMessageWorkflow.inputs.text,
  thread_ts: SendMessageWorkflow.inputs.thread_ts,
});

const gif = SendMessageWorkflow.addStep(
  Connectors.Giphy.functions.GetRandomGif,
  {
    rating: "g",
  },
);

SendMessageWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: "C06B35DLMJT",
  message: `GIF image:\n${gif.outputs.gif_title_url}`,
});

// const gcal = SendMessageWorkflow.addStep(
//   Connectors.GoogleCalendar.functions.CreateEvent,
//   {
//     google_access_token: {
//       credential_source: "END_USER",
//     },
//     summary: "form.outputs.fields.summary",
//     start_time: 1707267567,
//     end_time: 1707267567,
//     attendees: [],
//     location: "form.outputs.fields.location",
//     description: "form.outputs.fields.description",
//   },
// );

// console.log("messageLookupStep", messageLookupStep);

// const chatConversationId = messageLookupStep.outputs.chatConversationId;
// console.log("Connectors step!");
SendMessageWorkflow.addStep(
  Connectors.Salesforce.functions.CreateRecord,
  {
    salesforce_object_name: "ChatMessage__c",
    //Metadata to attach to this record, as an array of keys and their values values. Each key should be associated with the API name of a field you want to provide a value for.
    metadata: {
      "Chat_Conversation__c": "a01Hs00001sDSV9",
      // messageLookupStep.outputs.chatConversationId,
      "Body__c": "FROM SLACK",
      // messageLookupStep.outputs.message,
      // TODO: fix these
      "Sender_Name__c": "Agent",
      "Sent_At__c": new Date().toISOString(),
    },
    salesforce_access_token: { credential_source: "END_USER" },
  },
);
// SendMessageWorkflow.addStep(
//   Connectors.GoogleSheets.functions.AddSpreadsheetRow,
//   {
//     // The ID of the spreadsheet
//     spreadsheet_id: "1234567890_abcdefg_1q2w3e4r5t6y7u",
//     // The title of the sheet where the columns can be found
//     sheet_title: "Prospect emails",
//     // Add a row to the 'Prospect emails' sheet, with 'Scott Slacksalot' in the first column and 'scott.slacksalot@salesforce.com' in the second column
//     columns: [
//       {
//         "0": "Scott Slacksalot",
//         "1": "scott.slacksalot@salesforce.com",
//       },
//     ],
//     google_access_token: { credential_source: "END_USER" },
//   },
// );

export default SendMessageWorkflow;
