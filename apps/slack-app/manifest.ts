import { Manifest } from "deno-slack-sdk/mod.ts";
import SalesforceAgentChatsDatastore from "./datastores/salesforce_agent_chats.ts";
import { GenerateAiKnowledgeArticle } from "./functions/generate_ai_knowledge_article.ts";
import { OpenModalChatInput } from "./functions/open_modal_chat_input.ts";
import { PostMessageOrThreadedReply } from "./functions/post_message_or_reply.ts";
import { SendMessageToClient } from "./functions/send_message_to_client.ts";
import ReceiveMessageWorkflow from "./workflows/receive_message.ts";
import ReplyToExternalChatWorkflow from "./workflows/reply_to_external_chat.ts";
import ResolveTicketWorkflow from "./workflows/resolve_ticket.ts";
import SendMessageWorkflow from "./workflows/send_message.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Tightknit TDX Demo (scook)",
  description: "A basic sample that demonstrates issue submission to channel",
  icon: "assets/default_new_app_icon.png",
  workflows: [
    ReceiveMessageWorkflow,
    SendMessageWorkflow,
    ResolveTicketWorkflow,
    ReplyToExternalChatWorkflow,
  ],
  functions: [
    PostMessageOrThreadedReply,
    SendMessageToClient,
    GenerateAiKnowledgeArticle,
    OpenModalChatInput,
  ],
  outgoingDomains: [
    "tightknit.requestcatcher.com",
    "eopq43lc1gmcjr0.m.pipedream.net",
    "api.openai.com",
    "openai.com",
  ],
  datastores: [SalesforceAgentChatsDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "chat:write.customize",
    "channels:read",
    "channels:history",
    "groups:history",
    "datastore:read",
    "datastore:write",
    "reactions:read",
  ],
});
