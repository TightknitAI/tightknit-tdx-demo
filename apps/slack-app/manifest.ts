import { Manifest } from "deno-slack-sdk/mod.ts";
import SalesforceAgentChatsDatastore from "./datastores/salesforce_agent_chats.ts";
import { GenerateAiKnowledgeArticle } from "./functions/generate_ai_knowledge_article.ts";
import { PostMessageOrThreadedReply } from "./functions/post_message_or_reply.ts";
import { SendMessageToClient } from "./functions/send_message_to_client.ts";
import ReceiveMessageWorkflow from "./workflows/receive_message.ts";
import ResolveTicketWorkflow from "./workflows/resolve_ticket.ts";
import SendMessageWorkflow from "./workflows/send_message.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Tightknit TDX Demo",
  description: "A basic sample that demonstrates issue submission to channel",
  icon: "assets/default_new_app_icon.png",
  workflows: [
    ReceiveMessageWorkflow,
    SendMessageWorkflow,
    ResolveTicketWorkflow,
  ],
  functions: [
    PostMessageOrThreadedReply,
    SendMessageToClient,
    GenerateAiKnowledgeArticle,
  ],
  outgoingDomains: [
    "tightknit.requestcatcher.com",
    "eopq43lc1gmcjr0.m.pipedream.net",
  ],
  datastores: [SalesforceAgentChatsDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "chat:write.customize",
    "groups:history",
    "datastore:read",
    "datastore:write",
    "reactions:read",
  ],
});
