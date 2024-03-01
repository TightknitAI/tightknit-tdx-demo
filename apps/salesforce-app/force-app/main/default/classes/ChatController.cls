/**
 * Retrieves all chat messages (ChatMessage__c) for a given chat conversation (chatConversationId).
 * @param chatConversationId - The chat conversation ID.
 * @return A list of chat messages for the given chat conversation ID.
 */
public with sharing class ChatController {
    @AuraEnabled(cacheable=true)
    public static List<ChatMessage__c> getChatMessages(String chatConversationId) {
        return [SELECT Id, Body__c, Sender_Name__c, Sender__c, Sender_Photo_URL__c, Sent_At__c, Chat_Conversation__c FROM ChatMessage__c WHERE Chat_Conversation__c = :chatConversationId];
    }
}
