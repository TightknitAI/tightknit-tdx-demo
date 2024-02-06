# AI + Slack + Experience Sites

This repo contains the Tightknit TDX Demo code for Salesforce Experience sites.

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
