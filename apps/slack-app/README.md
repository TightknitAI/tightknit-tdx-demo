# Slack Next-Gen Demo App

## Overview

This is a sample app built on the [Slack Next-Gen automation platform](https://api.slack.com/start#next-gen-platform) for syncing a chat conversation between a service agent in Slack and a customer on an external source (i.e. Salesforce digital experience site).

It contains the following triggers...

- **Receive a message**: A webhook trigger through which callers can "send a chat message" from an external source, and the message will be synced to a specified Slack channel
  - When an external chat is started, the chat ID is saved in a Slack [datastore](https://api.slack.com/automation/datastores) for tracking, and further messages in the chats are added as replies in the same Slack thread.
- **Reply to external chat (link)**: A shortcut trigger through which the caller can "send a chat message" back to the external source. The message is also displayed in the Slack thread.
- **Create Knowledge Article (link)**: A shortcut trigger through which a user can click to generate a Knowledge Article in Salesforce
- **Emoji react added**: An event trigger that listens for ✅ emoji reactions added to "resolved conversations," and kicks off a workflow to suggest AI-generated articles from the information in the conversation

## Setup

Before getting started, first make sure you have a development Slack workspace where
you have permission to install apps. **Please note that the features in this
project (i.e. Slack Next-Gen apps) require that the workspace be part of
[a Slack paid plan](https://slack.com/pricing).** However, it is entirely possible to recreate this app ony any plan, using the original REST-based Slack platform instead; you simply lose the benefit of the app living on Slack's infrastructure.

### Install the Slack CLI (and Deno)

To use this sample, you need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/automation/quickstart).

#### Running Your Project Locally

While building your app, you can see your changes appear in your workspace in
real-time with `slack run`. You'll know an app is the development version if the
name has the string `(local)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

To stop running locally, press `<CTRL> + C` to end the process.

#### Deploying Your App

Once development is complete, deploy the app to Slack infrastructure using
`slack deploy`:

```zsh
$ slack deploy
```

When deploying for the first time, you'll be prompted to
[create a new link trigger](#creating-triggers) for the deployed version of your
app. When that trigger is invoked, the workflow should run just as it did when
developing locally (but without requiring your server to be running).

#### Viewing Activity Logs

Activity logs of your application can be viewed live and as they occur with the
following command:

```zsh
$ slack activity --tail
```

### Demo App Deployment

Perform the following steps to deploy this demo app:

1. Setup [Environment Variables](https://api.slack.com/automation/environment-variables):
   - Local: Copy `.env.default` to `.env` and fill in the values.
   - Deployed: Use `env add` command to deploy env vars to the workspace environment.
1. Start your local app or deploy your app to a workspace.
1. Use the `trigger create` command to create all the available [triggers](https://api.slack.com/automation/triggers/manage) for this app. You will be prompted to create at least one when you first run the app.

### Demo App Manual Configuration

There are a few manual steps at the moment to configure this app to work with your own deployment. We welcome contributions that remove any of these steps! In general, you can search for `TODO`s in the code to find the following:

1. **Replace all instances of `"C06FQR45E7R"` in the code with the ID of your own Slack channel.** This is the channel that will be used to sync incoming external messages from the Salesforce side, sync outgoing messages to the Salesforce side, and listen for resolved conversations via ✅ emoji reactions. You can find the ID of a Slack channel by right-clicking the channel name, selecting _View channel details_, and scrolling to the bottom of the details modal.
1. Use the [`triggers list`](https://api.slack.com/automation/cli/commands#trigger-list) command to view all of the triggers you have created and, for any link-type triggers, the shortcut URL link. Find the URL for the shortcut link called "_Create Knowledge Article (link)_". Replace the value for `createKnowledgeArticleTriggerLink` in [`generate_ai_knowledge_article.ts`](functions/generate_ai_knowledge_article.ts) with the URL.
1. If you use an external endpoint other than OpenAI's API, add the domain to `outgoingDomains` in [`manifest.ts`](manifest.ts).

Restart/re-deploy the app.

## Wishlist

- Move the configurable channel ID (see above) into the environment variables ([thread](https://community.slack.com/archives/C02C28Z3XA7/p1708984029721039))
- _Slack_: Make it less cumbersome for users to repeatedly trigger workflows with authenticated [Connector functions](https://api.slack.com/automation/connectors). Currently it takes at least 3 clicks to start the workflow.
- _Slack_: Add support for using a link trigger for workflows containing an `END_USER` credential source Connector function.

## Resources

To learn more about developing automations on Slack, visit the following:

- [Automation Overview](https://api.slack.com/automation)
- [CLI Quick Reference](https://api.slack.com/automation/cli/quick-reference)
- [Next-generation Slack platform](https://api.slack.com/start#next-gen-platform)
- [Slack Connector functions](https://api.slack.com/automation/connectors)
