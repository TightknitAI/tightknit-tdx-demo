import { Manifest } from "deno-slack-sdk/mod.ts";
import SalesforceAgentChatsDatastore from "./datastores/salesforce_agent_chats.ts";
import { GenerateAiKnowledgeArticle } from "./functions/generate_ai_knowledge_article.ts";
import { GetExternalChatInfo } from "./functions/get_external_chat_info.ts";
import { PostMessageOrReplyFromExternal } from "./functions/post_message_or_reply_from_external.ts";
import { PostReplyToExternal } from "./functions/post_reply_to_external.ts";
import CreateKnowledgeArticleRecordWorkflow from "./workflows/create_knowledge_article_record.ts";
import ReceiveExternalMessageWorkflow from "./workflows/receive_message_from_external.ts";
import ReplyToExternalChatWorkflow from "./workflows/reply_to_external_chat.ts";
import ResolveTicketWorkflow from "./workflows/resolve_ticket.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Tightknit TDX Demo App",
  description:
    "A basic sample that demonstrates syncing custom support chat messages with an external source (Salesforce)",
  icon: "assets/default_new_app_icon.png",
  workflows: [
    ReceiveExternalMessageWorkflow,
    ResolveTicketWorkflow,
    ReplyToExternalChatWorkflow,
    CreateKnowledgeArticleRecordWorkflow,
  ],
  functions: [
    PostMessageOrReplyFromExternal,
    PostReplyToExternal,
    GenerateAiKnowledgeArticle,
    GetExternalChatInfo,
  ],
  outgoingDomains: ["api.openai.com"],
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
    "users:read",
  ],
});
