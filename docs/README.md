![Adding Slack and AI to Experience Cloud Communities](./images/tightknit_tdx_banner.png)

## TDX 2024 - Demo

[![Button Icon]][Link]

This repo contains a collection of sample apps that can be deployed to create a simple chat system between a Lightning Web Component (LWC) on a Salesforce Experience Cloud site and a Slack Next-Gen App, backed by a custom object within your Salesforce org.

![App Architecture](./images/demo_architecture.png)

The use case presented here is a customer support ticketing system where service agents on Slack are able to communicate with end users on your Salesforce website, using AI to generate Knowledge Articles from the information capture in the conversation when the ticket is resolved.

## Watch the Demo

[![Demo Video](./images/demo_video_thumbnail.png)](https://www.loom.com/share/8efce8ab277f439bbc5a5e717c5bf43b?sid=c9302fef-ff50-4a53-aefa-21e92643e291)

## Using This Example

### Slack

Follow the instructions [here](../apps/slack-app/README.md) to setup and deploy your Next-Gen Slack app.

### Salesforce

Follow the instructions [here](../apps/salesforce-app/README.md) to setup and deploy your Salesforce custom objects, LWR Experience Cloud site, and LWC.

## Useful Links

Learn more about the apps and components in this repo:

- [Next-generation Slack platform](https://api.slack.com/start#next-gen-platform)
- [Slack Connector functions](https://api.slack.com/automation/connectors)
- [Salesforce Lightning Web Components (LWC)](https://developer.salesforce.com/developer-centers/lightning-web-components)
- [lightning/uiRecordApi wire adapter (LWC)](https://developer.salesforce.com/docs/platform/lwc/guide/reference-lightning-ui-api-record.html)
- [OpenAI Chat Completions API](https://platform.openai.com/docs/api-reference/chat)

<!----------------------------------------------------------------------------->

[Link]: https://community.tightknit.ai/join

<!---------------------------------[ Buttons ]--------------------------------->

[Button Icon]: https://img.shields.io/badge/Join_the_community-37a779?style=for-the-badge&logoColor=white&logo=Slack
