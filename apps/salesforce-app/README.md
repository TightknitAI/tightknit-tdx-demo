# Chat Component with Experience Sites and Slack

This repo contains the Tightknit TDX Demo app for an LWC on Salesforce Experience Cloud sites that syncs chat messages with Slack.

## Overview

Within the `salesforce-app` directory is a [Metadata API](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_intro.htm) package that contains the following items:

- `ChatConversation__c`: custom object that represents a chat conversation
- `ChatMessage__c`: custom object that represents an individual chat message
- `ChatController.cls`: custom Apex class for retrieving `ChatMessage__c` records
- `KnowledgeArticleSearch.cls`: custom Apex class for search for a given search term through the org's Knowledge articles
- `questionAndEscalation` (_"Question And Escalation" component_): LWC custom component for Experience Cloud sites that offers users to search articles for their questions or talk to a support agent (on the Slack side)

The `questionAndEscalation` initially presents the user with a question box in which they can enter a search term. The component performs a search through the org's Knowledge articles and presents the results.

The user has the option to "Talk to Support" and switch the UI to a chat window. Each time the user enters a message, the component sends a POST request to the Slack app's webhook URL, as well as creates a `ChatMessage__c` record in Salesforce. On the Slack side, the companion app will be creating `ChatMessage__c` record in Salesforce too. The `questionAndEscalation` component constantly polls Salesforce for all of the `ChatMessage__c` records for the conversation and updates the chat window accordingly. Thus, the `ChatMessage__c` records serve as the backend source of truth for the chat.

## Setup

To be transparent, most of the manual setup listed here could be migrated into the actual [Metadata API](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_intro.htm) package in order to be deployed programmatically. But we ran out of time. Thus, this area is ripe for update if you would like to contribute! 😀

### Experience Cloud Site

1. Create an LWR Experience cloud site ([instructions](https://help.salesforce.com/s/articleView?id=sf.networks_creating.htm&type=5)). The recommended template is _Build Your Own (LWR)_.
1. Allowlist the URLs related to the companion [Slack app](../slack-app/README.md) (i.e. CSP of site, Trusted Sites, or Remote Site Settings), including:
   1. the webhook URL of the **[Receive a message](../slack-app/README.md)** Slack trigger
   1. domain(s) that Slack profile images may be hosted on, e.g. https://avatars.slack-edge.com
1. Open the Experience Builder > add the _"Question And Escalation"_ custom component to your desired page.
   1. Configure the _"Slack App Webhook URL"_ property of the component to use the **Receive a message** webhook URL of the companion [Slack app](../slack-app/README.md).

#### Guest User (optional)

To support non-authenticated users on the site, you will need to grant permissions to the site's [Guest user](https://help.salesforce.com/s/articleView?id=sf.rss_config_guest_user_profile.htm&type=5) to use the objects in this package.

1. In the Guest user's profile, enable CRUD access to the custom objects in this package ([instructions](https://help.salesforce.com/s/articleView?id=sf.os_configure_custom_object_permissions_for_community_profiles_42143.htm&type=5)):
   1. `ChatConversation__c`
   1. `ChatMessage__c`
1. In the Guest user's profile, enable access to the FLS of all fields of the custom objects (_profile > Custom Field-Level Security section > click "View" next to the object name_):
   1. `ChatConversation__c`
   1. `ChatMessage__c`
1. In the Guest user's profile, enable CRUD access to the custom Apex classes in this package ([instructions](https://help.salesforce.com/s/articleView?id=sf.users_profiles_apex_access.htm&type=5)):
   1. `ChatController.cls`
   1. `KnowledgeArticleSearch.cls`

Guest User profile needs access to the FLS of all fields on the custom objects

### Knowledge

The demo app contains a feature where a Slack user can trigger a workflow to save AI-generated text content into a new Salesforce Knowledge Article record. This is the last part of the demo flow and is not necessarily required for the app to function.

Follow the the [Enable and Configure Lightning Knowledge
trailhead](https://trailhead.salesforce.com/content/learn/projects/build-a-community-with-knowledge-and-chat/enable-and-configure-lightning-knowledge) to enable Lightning Knowledge for your Salesforce org. The basic steps are also outlined here:

#### Enable Knowledge for the Org

1. **Enable Admin as a Knowledge user**: Edit the Admin user object > enable as "Knowledge User"
1. **Enable Lightning Knowledge in the org**: Go to Settings > Knowledge Settings > Enable Knowledge
   1. Enable Lightning Knowledge
   1. Turn on “Use standard Salesforce sharing”. Or if you prefer Data Category-based visibility permissions, you must configure DCs separately from these instructions.
1. **Configure Knowledge object and page layout**: Go to Settings > Object Manager > Knowledge
   1. Page Layouts > edit Knowledge Layout > add “Visible in Public Knowledge Base” to the layout > Save (_this is already visible in Salesforce Classic_)
   1. Fields & Relationships > New > create the field that will contain your article body, e.g. Rich Text Area. Text-based fields are automatically included in searches against the object. Our demo app assumes a rich text field called `Description__c`.

#### Creating Knowledge Articles

Guide: https://help.salesforce.com/s/articleView?id=sf.knowledge_article_create.htm&type=5

Click on the App Launcher > Knowledge > click the _New_ button > create the article > check “Visible In Public Knowledge Base” if you want the article visible to guest users > Save > Publish.

#### Enable Knowledge for Guest (optional)

1. **Grant access to Knowledge object**: Open the site guest user’s profile
   1. Click Edit > grant READ permissions for the Knowledge Base object
   1. Field-Level Security > click “View” for Knowledge > Edit > give Read access for your custom field that holds the article body (for this field to be visible in API responses)
1. **Grant access to Knowledge article records**: Sharing Settings > Knowledge Sharing Rules > New > select “Guest user access, based on criteria” > create criteria that will apply to articles of your choice. For testing purposes you could create a rule that applies to _all_ articles, such as `Created By ID - not equal to - 123456`). Select your site’s guest user > click Save.

#### Enable Knowledge in the LWR Experience site

Guide: https://help.salesforce.com/s/articleView?id=sf.knowledge_add_knowledge_article_component.htm&language=en_US&type=5

1. Open the Experience Builder
   1. Create the Knowledge object pages: click the `+ New Page` button > select "Object Pages" > select "Knowledge"
   1. Open the Knowledge Detail Page > add the _Knowledge Article_ component to the page
1. Open the Workspaces view
   1. Select Administration > Preferences > check “_Allow guest users to access public APIs_” > click Save

## Develop

### Local Setup

Guide: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm

Open a new VS Code window at this directory.

### Authorize Your Org

Download the following VS Code extensions:

1. Salesforce Extension Pack
2. Salesforce CLI Integration

Open Command Palette (Ctrl+Shift+P):

- Select "> SFDX: Authorize an Org"
- Log in to the org to authorize

### Deploy Package to Your Org

Right-click any directory of the Salesforce project in the Explorer and select "SFDX: Deploy Source to Org".

Alternatively, you can use the Salesforce CLI:

```sh
# authorize the org
sfdx org:login:web --alias <ALIAS> --set-default
# set it as the default
sfdx force:config:set defaultusername=<USERNAME>
# confirm your orgs
sfdx force:org:list

# the -u is optional for default org
sfdx force:source:convert -d mdapioutput/
sfdx force:mdapi:deploy -d mdapioutput/ -w 100 -u <USERNAME>
```

## Resources

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
- [Salesforce Lightning Web Components (LWC)](https://developer.salesforce.com/developer-centers/lightning-web-components)
- [lightning/uiRecordApi wire adapter (LWC)](https://developer.salesforce.com/docs/platform/lwc/guide/reference-lightning-ui-api-record.html)
