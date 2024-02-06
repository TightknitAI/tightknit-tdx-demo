import CHAT_CONVERSATION from "@salesforce/schema/ChatConversation__c";
import CHAT_CONVERSATION_CONTEXT_FIELD from "@salesforce/schema/ChatConversation__c.Context__c";
import CHAT_CONVERSATION_INITIAL_QUERY_FIELD from "@salesforce/schema/ChatConversation__c.Initial_Query__c";

import USER_NAME_FIELD from "@salesforce/schema/User.Name";
import USER_ID from "@salesforce/user/Id";

import { NavigationMixin } from "lightning/navigation";
import { createRecord, getFieldValue, getRecord } from "lightning/uiRecordApi";
import { LightningElement, api, track, wire } from "lwc";

/**
 * Component that displays a question box with suggested Knowledge articles, and
 * then a support chat window if the user escalates the issue.
 */
export default class QuestionAndEscalation extends NavigationMixin(
  LightningElement
) {
  @track showArticleSearch = true;
  @track showChat = false;
  @api isLoading = false;
  @api title = "Ask A Question";
  @api slackAppWebhookUrl;
  chatConversationId;

  currentUserName = "Guest User";
  currentUserId;

  @wire(getRecord, {
    recordId: USER_ID,
    fields: [USER_NAME_FIELD]
  })
  wiredUser({ error, data }) {
    if (data) {
      console.log("WIREDUSER: ", data);
      this.currentUserName = getFieldValue(data, USER_NAME_FIELD);
      this.currentUserId = data.id;
    } else if (error) {
      console.error("Error fetching user information", error);
    }
  }

  async handleEscalate(event) {
    console.log("Handling escalation - switching view to agent chat", event);
    this.showArticleSearch = false;
    this.isLoading = true;

    // Create ChatConversation__c record
    const initialQuery = event.detail.initialQuery;
    const escalationContext = event.detail.context;
    const chatConversationId = await this.createChatConversation(
      initialQuery,
      escalationContext
    );
    this.chatConversationId = chatConversationId;

    if (chatConversationId) {
      const customerTicketNotificationMsg = `*${this.currentUserName}* escalated the following issue (Chat ID ${chatConversationId}):\n> ${initialQuery}\n\n*Additional Context*:\n${escalationContext}`;
      await this.sendMessageToSlackApp(customerTicketNotificationMsg);

      // Switch to agent chat view
      this.chatConversationId = chatConversationId;
      this.showChat = true;
      this.isLoading = false;
    } else {
      console.warn(
        "Error creating ChatConversation__c record. Cannot open support chat."
      );
      // something went wrong
      this.isLoading = false;
      this.showChat = false;
    }
  }

  async createChatConversation(initialQuery, escalationContext) {
    const recordInput = {
      apiName: CHAT_CONVERSATION.objectApiName,
      fields: {
        [CHAT_CONVERSATION_INITIAL_QUERY_FIELD.fieldApiName]: initialQuery,
        [CHAT_CONVERSATION_CONTEXT_FIELD.fieldApiName]: escalationContext
      }
    };

    try {
      const record = await createRecord(recordInput);
      return record.id;
    } catch (error) {
      console.error(error);
      console.error(
        "Error creating ChatConversation__c record: ",
        error.body.message
      );
    }
  }

  sendMessageToSlackApp(messageToSend) {
    if (!this.slackAppWebhookUrl) {
      console.warn("Slack webhook URL is not set");
      return;
    }

    // Data to be sent in the POST request body
    const data = {
      message: messageToSend,
      authorUsername: null,
      chatConversationId: this.chatConversationId,
      postAsUser: false,
      iconEmoji: ":triangular_flag_on_post:"
    };

    // Options for the fetch request
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      mode: "no-cors",
      body: JSON.stringify(data) // Convert data to JSON format
    };
    console.log("Sending data to Slack: ", data);

    // Make the POST request using the fetch API
    fetch(this.slackAppWebhookUrl, options)
      .then((response) => {
        console.log("POST request response", response);
        return response.json();
      })
      .then((data) => {
        console.log("POST request succeeded with JSON response", data);
        // Handle the response data as needed
      })
      .catch((error) => {
        console.error("Error making POST request", error);
        // Handle errors
      });
  }
}
