import { refreshApex } from "@salesforce/apex";
import getChatMessages from "@salesforce/apex/ChatController.getChatMessages";
import ID_FIELD from "@salesforce/schema/ChatConversation__c.Id";
import CHAT_CONVERSATION_INITIAL_QUERY_FIELD from "@salesforce/schema/ChatConversation__c.Initial_Query__c";
import USER_PHOTO_URL_FIELD from "@salesforce/schema/User.MediumPhotoUrl";
import USER_NAME_FIELD from "@salesforce/schema/User.Name";
import USER_ID from "@salesforce/user/Id";
import { createRecord, getFieldValue, getRecord } from "lightning/uiRecordApi";
import { LightningElement, api, track, wire } from "lwc";

/**
 * Component that displays a support chat window and handles management
 * of the ChatMessage__c records and Slack communication.
 */
export default class SupportChat extends LightningElement {
  @api chatConversationId;
  @api slackAppWebhookUrl;
  @api isDataLoaded = false;
  @api isLoading = false;
  @track messages = [];
  @api initialQuery = "";
  currentUserName = "Guest User";
  currentUserPhotoUrl;
  currentUserId;
  newMessage = "";
  @track messageInputValue = "";

  getChatMessagesResult;

  @wire(getChatMessages, { chatConversationId: "$chatConversationId" })
  wiredApexChatMessages(result) {
    this.getChatMessagesResult = result;
    const { data, error } = result;
    if (data) {
      // sort messages by send date
      let sortedData = [...data];
      sortedData.sort((a, b) => {
        return new Date(a.Sent_At__c) - new Date(b.Sent_At__c);
      });
      sortedData = sortedData.map((message) => {
        return {
          ...message,
          displayDate: new Date(message.Sent_At__c).toLocaleString(),
          messageBlockClass: this.getMessageBlockClass(message)
        };
      });
      this.messages = sortedData;
    } else if (error) {
      console.error("Error loading apex chat messages:", error);
    }
    this.isDataLoaded = true;
  }

  @wire(getRecord, {
    recordId: USER_ID,
    fields: [USER_NAME_FIELD, USER_PHOTO_URL_FIELD]
  })
  wiredUser({ error, data }) {
    if (data) {
      this.currentUserName =
        getFieldValue(data, USER_NAME_FIELD) || "Guest User";
      this.currentUserPhotoUrl = getFieldValue(data, USER_PHOTO_URL_FIELD)
        ? // given to us as a relative URL, so make it absolute
          window.location.origin + getFieldValue(data, USER_PHOTO_URL_FIELD)
        : "";
      this.currentUserId = data.id;
    } else if (error) {
      console.error("Error fetching User information", error);
    }
  }

  @wire(getRecord, {
    recordId: "$chatConversationId",
    fields: [ID_FIELD, CHAT_CONVERSATION_INITIAL_QUERY_FIELD]
  })
  wiredChatConversation({ data, error }) {
    if (data) {
      this.initialQuery = getFieldValue(
        data,
        CHAT_CONVERSATION_INITIAL_QUERY_FIELD
      );
    } else if (error) {
      console.error("Error loading ChatConversation__c:", error);
    }
  }

  getMessageBlockClass(message) {
    return `message-block slds-box slds-m-top_small slds-p-around_medium ${
      message.Sender_Name__c === this.currentUserName
        ? "from-my-user align-right"
        : "from-other-user align-left"
    }`;
  }

  handleMessageInputChange(event) {
    this.messageInputValue = event.target.value;
  }

  async handleMessageInputKeyPress(event) {
    // Execute search when Enter key is pressed
    if (event.keyCode === 13) {
      await this.handleSendNewMessage();
    }
  }

  async handleSendNewMessage() {
    const messageToSend = this.messageInputValue.trim();
    if (!messageToSend) {
      return;
    }

    const fields = {};
    fields["Body__c"] = messageToSend;
    fields["Chat_Conversation__c"] = this.chatConversationId;
    fields["Sender_Name__c"] = this.currentUserName;
    if (this.currentUserId) {
      fields["Sender__c"] = this.currentUserId;
    }
    fields["Sent_At__c"] = new Date().toISOString();
    fields["Sender_Photo_URL__c"] = this.currentUserPhotoUrl;
    const recordInput = { apiName: "ChatMessage__c", fields };

    try {
      // Create the record in Salesforce
      console.log("Creating record...", recordInput);
      await createRecord(recordInput);
    } catch (error) {
      console.error("Error creating ChatMessage record:", error);
      return;
    } finally {
      this.messageInputValue = ""; // Clear the input field
    }
    console.log("ChatMessage record created successfully.");

    // Refresh the chat messages
    // Note: refreshApex does not work in Builder live preview
    refreshApex(this.getChatMessagesResult);
    this.scrollToBottom();

    // Send the message to Slack webhook endpoint
    await this.sendMessageToSlackApp(messageToSend);
  }

  // Polling
  connectedCallback() {
    // Start polling when the component is connected to the DOM
    this.startPolling();
  }

  startPolling() {
    // Set up a polling interval of 1000 milliseconds (1 second)
    this.pollingInterval = setInterval(() => {
      // Call a function to fetch new messages
      this.fetchNewMessages();
    }, 2000);
  }

  fetchNewMessages() {
    // Invoke the Apex method to fetch new messages
    refreshApex(this.getChatMessagesResult);
  }

  disconnectedCallback() {
    // Stop polling when the component is removed from the DOM
    clearInterval(this.pollingInterval);
  }

  renderedCallback() {
    // Scroll to the bottom on load
    this.scrollToBottom();
  }

  scrollToBottom() {
    // Scroll to the bottom of the messages container
    const messagesContainer = this.template.querySelector(
      ".messages-container"
    );
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
      authorUsername: this.currentUserName,
      authorPhotoUrl: this.currentUserPhotoUrl,
      chatConversationId: this.chatConversationId,
      postAsUser: true
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
