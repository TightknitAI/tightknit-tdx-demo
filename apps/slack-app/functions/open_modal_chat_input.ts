import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// TODO rename function
export const OpenModalChatInput = DefineFunction({
  callback_id: "open_modal_chat_input_function",
  title: "Open Modal Chat Input",
  description: "Opens a modal for the user to input a message",
  source_file: "functions/open_modal_chat_input.ts",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      user_id: {
        type: Schema.types.string,
        description: "The Slack user id of the user that started the workflow",
      },
    },
    required: ["interactivity", "user_id"],
  },
  output_parameters: {
    properties: {
      message: {
        type: Schema.slack.types.rich_text,
      },
    },
    required: [],
  },
});

export default SlackFunction(
  OpenModalChatInput,
  async ({ inputs, client }) => {
    const { user_id } = inputs;

    if (!user_id) {
      console.warn("No user_id provided");
      return { outputs: {} };
    }

    const response = await client.views.open({
      interactivity_pointer: inputs.interactivity.interactivity_pointer,
      view: {
        "type": "modal",
        // Note that this ID can be used for dispatching view submissions and view closed events.
        "callback_id": "chat-input-modal",
        // This option is required to be notified when this modal is closed by the user
        "notify_on_close": true,
        "title": { "type": "plain_text", "text": "Reply to External Chat" },
        "submit": { "type": "plain_text", "text": "Submit" },
        "close": { "type": "plain_text", "text": "Close" },
        "blocks": [
          {
            "type": "input",
            "element": {
              "type": "plain_text_input",
              "multiline": true,
              "action_id": "plain_text_input-action",
              placeholder: {
                "type": "plain_text",
                "text": "Write a response to the external chat",
                "emoji": true,
              },
            },
            "label": {
              "type": "plain_text",
              "text": "Message",
              "emoji": true,
            },
          },
        ],
      },
    });

    if (response.error) {
      console.error(
        "Failed to open modal for chat input",
        response.error,
        response,
      );
      const error =
        `Failed to open modal for chat input. Contact the app maintainers with the following information - (error: ${response.error})`;
      return { error };
    }
    // return {
    //   // To continue with this interaction, return false for the completion
    //   completed: false,
    // };

    return {
      outputs: { message: "TODO" },
    };
  },
);
