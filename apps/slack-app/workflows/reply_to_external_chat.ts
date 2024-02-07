import { Connectors } from "deno-slack-hub/mod.ts";
import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetExternalChatInfo } from "../functions/get_external_chat_info.ts";
import { PostReplyToExternal } from "../functions/post_reply_to_external.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const ReplyToExternalChatWorkflow = DefineWorkflow({
  callback_id: "reply_to_external_chat_workflow",
  title: "Reply to External Chat",
  description:
    "Send a reply to an external chat through a Salesforce datastore",
  input_parameters: {
    properties: {
      // interactivity is necessary for opening a modal
      interactivity: { type: Schema.slack.types.interactivity },
      message_ts: {
        type: Schema.types.string,
      },
      channel_id: {
        type: Schema.types.string,
      },
      user_id: {
        type: Schema.types.string,
        description: "The Slack user id of the user that started the workflow",
      },
    },
    required: ["message_ts", "user_id"],
  },
});

// 1. Get the message text from the user using a modal
const inputForm = ReplyToExternalChatWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Reply to External Chat",
    interactivity: ReplyToExternalChatWorkflow.inputs.interactivity,
    submit_label: "Send",
    fields: {
      elements: [
        {
          name: "messageInput",
          title: "Message",
          type: Schema.types.string,
          long: true,
        },
      ],
      required: ["messageInput"],
    },
  },
);

// 2. Get the metadata about the external chat record we will update
const externalChatInfo = ReplyToExternalChatWorkflow.addStep(
  GetExternalChatInfo,
  {
    user_id: ReplyToExternalChatWorkflow.inputs.user_id,
    channel_id: ReplyToExternalChatWorkflow.inputs.channel_id,
    message_ts: ReplyToExternalChatWorkflow.inputs.message_ts,
  },
);

// 3. Send the reply in the Slack thread too
ReplyToExternalChatWorkflow.addStep(
  PostReplyToExternal,
  {
    channel: ReplyToExternalChatWorkflow.inputs.channel_id,
    thread_ts: ReplyToExternalChatWorkflow.inputs.message_ts,
    message: inputForm.outputs.fields.messageInput,
    senderName: externalChatInfo.outputs.senderName,
    senderPhotoUrl: externalChatInfo.outputs.senderPhotoUrl,
  },
);

// 4. Update the external chat record in Salesforce with the new reply
ReplyToExternalChatWorkflow.addStep(
  Connectors.Salesforce.functions.CreateRecord,
  {
    salesforce_object_name: "ChatMessage__c",
    // Metadata to attach to this record, as an array of keys and their values values. Each key should be associated with the API name of a field you want to provide a value for.
    metadata: {
      "Chat_Conversation__c": externalChatInfo.outputs.chatConversationId,
      "Body__c": inputForm.outputs.fields.messageInput,
      "Sender_Name__c": externalChatInfo.outputs.senderName,
      "Sender_Photo_URL__c": externalChatInfo.outputs.senderPhotoUrl,
      "Sent_At__c": externalChatInfo.outputs.sentAt,
    },
    salesforce_access_token: { credential_source: "END_USER" },
  },
);

export default ReplyToExternalChatWorkflow;
