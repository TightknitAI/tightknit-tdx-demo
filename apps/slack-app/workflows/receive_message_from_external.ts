import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { PostMessageOrThreadedReply } from "../functions/post_message_or_reply.ts";

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const ReceiveExternalMessageWorkflow = DefineWorkflow({
  callback_id: "receive_message_from_external",
  title: "Receive a message from an external source",
  description:
    "Receive a message from an external source and sync it as new message or threaded reply in the channel",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "The message to send in the channel",
      },
      authorUsername: {
        type: Schema.types.string,
        description: "The name of the author sending the message",
      },
      authorPhotoUrl: {
        type: Schema.types.string,
        description: "The URL of the author's profile photo",
      },
      iconEmoji: {
        type: Schema.types.string,
        description: "The emoji to use as the message's icon",
      },
      chatConversationId: {
        type: Schema.types.string,
        description:
          "The ID of the parent ChatConversation__c record the message(s) belong to",
      },
      postAsUser: {
        type: Schema.types.boolean,
        description:
          "If true, will display the message as if it was quoted from the user",
        default: true,
      },
    },
    required: ["message"],
  },
});

ReceiveExternalMessageWorkflow.addStep(PostMessageOrThreadedReply, {
  channel: "C06FQR45E7R",
  chatConversationId: ReceiveExternalMessageWorkflow.inputs.chatConversationId,
  message: ReceiveExternalMessageWorkflow.inputs.message,
  authorUsername: ReceiveExternalMessageWorkflow.inputs.authorUsername,
  authorPhotoUrl: ReceiveExternalMessageWorkflow.inputs.authorPhotoUrl,
  iconEmoji: ReceiveExternalMessageWorkflow.inputs.iconEmoji,
  postAsUser: ReceiveExternalMessageWorkflow.inputs.postAsUser,
});

export default ReceiveExternalMessageWorkflow;
