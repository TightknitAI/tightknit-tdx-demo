# AI + Slack + Experience Sites

This repo contains the Tightknit TDX Demo app for an LWC on Salesforce Experience Cloud sites that syncs chat messages with Slack.

## Overview

Polls custom object

## Setup

Ripe for contribution

### Experience Cloud Site

1. Create an LWR Experience cloud site ([instructions](https://help.salesforce.com/s/articleView?id=sf.networks_creating.htm&type=5)). The recommended template is _Build Your Own (LWR)_.
1. Allowlist the URLs related to the companion [Slack app](../slack-app/README.md) (i.e. CSP of site, Trusted Sites, or Remote Site Settings), including:
   1. the webhook URL of the **[Receive a message](../slack-app/README.md)** Slack trigger
   1. domain(s) that Slack profile images may be hosted on, e.g. https://avatars.slack-edge.com

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

### Org / Experience Setup

#### Developer Org

### Local Setup

Download the Salesforce CLI: https://developer.salesforce.com/tools/salesforcecli

#### VS Code

Open a new VS Code window at this directory.

##### Authorize

Download the following extensions:

1. Salesforce Extension Pack
2. Salesforce CLI Integration

Open Command Palette (Ctrl+Shift+P):

- Select "> SFDX: Authorize an Org"
- Select "sandbox"
- Enter an org alias name.
- Log in to the org to authorize

##### Deploy

Right-click any directory of the Salesforce project in the Explorer and select "SFDX: Deploy Source to Org"

#### Salesforce CLI

##### Authorize

```sh
# authorize the org
sfdx org:login:web --alias <ALIAS> --set-default
# set it as the default
sfdx force:config:set defaultusername=<USERNAME>
# confirm your orgs
sfdx force:org:list
```

##### Deploy

```sh
# the -u is optional for default org
sfdx force:source:convert -d mdapioutput/
sfdx force:mdapi:deploy -d mdapioutput/ -w 100 -u <USERNAME>
```

## Salesforce DX Project: Next Steps

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

### How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

### Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

### Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
