---
{
  title: 'Pi Agent',
  description: 'Install native NVIDIA Elements tools and guidance for Pi Agents.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

[`@nvidia-elements/pi`](https://www.npmjs.com/package/@nvidia-elements/pi) gives [Pi](https://pi.dev) agents native access to Elements API documentation, examples, design tokens, icons, package information, project checks, and template validation. Pi can also use our <a href="/docs/skills/">Skills</a> and <a href="/docs/cli/">CLI</a> directly without requiring the extension.

## Install

Install the package globally for every Pi project:

```shell
pi install npm:@nvidia-elements/pi
```

Install it only for the current project:

```shell
pi install -l npm:@nvidia-elements/pi
```

Pi loads the extension, the Pi-specific `elements-pi` skill, and workflow prompts as native package resources. The skill can coexist with a project or global `elements` skill.

## Use

Ask Pi to create, edit, review, or debug an Elements interface. The agent can look up `nve-*` APIs and examples before authoring HTML, then check the result with `nvidia_elements_api_validate`.

Pi exposes the Elements tools directly and makes them available to `codemode` scripts. `codemode` calls receive `{ status, message, result }`; tools with a `format` option can return structured data with `format: "json"`.

Use the skill command to load the complete Elements workflow explicitly:

```shell
/skill:elements-pi
```

You do not need MCP configuration or a separate CLI process. Use the [Elements CLI](/docs/cli/) when you need interactive shell commands, project creation, project setup, or MCP integrations.

### Use workflow prompts

The package provides these prompt-template commands:

- `/elements-artifact`: Create a standalone Elements HTML artifact.
- `/elements-doctor`: Check an Elements development setup.
- `/elements-create-project`: Create an Elements starter project.
- `/elements-migrate`: Migrate deprecated Elements packages and APIs.

Add an optional request after a command, such as `/elements-artifact create a settings page`.

### Manage automatic validation

Automatic validation runs by default after Pi edits supported HTML files. Turn it off when starting Pi:

```shell
pi --no-elements-auto-validate
```

You can manage it for the current session:

```shell
/elements-auto-validate off
/elements-auto-validate on
/elements-auto-validate status
```

When enabled, the extension checks `.html` and `.htm` files after successful Pi `edit` and `write` calls. It appends the validation summary and diagnostics to the tool result, including the parent result when `codemode` calls either tool.

## Manage

```shell
pi update npm:@nvidia-elements/pi
pi remove npm:@nvidia-elements/pi
pi config
```

Pi extensions run with your system permissions. Review package sources before installation and use Pi project trust for project-local packages and resources.
