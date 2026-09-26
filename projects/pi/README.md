# @nvidia-elements/pi

Native [Pi](https://pi.dev) extension for the NVIDIA Elements Design System. It provides structured Elements API discovery, examples, design tokens, icons, package information, project checks, and template validation directly to Pi agents.

## Install

Install globally for every Pi project:

```shell
pi install npm:@nvidia-elements/pi
```

Install for the current project:

```shell
pi install -l npm:@nvidia-elements/pi
```

The package declares its Elements skill and workflow prompts as native Pi package resources. Pi handles discovery, precedence, configuration, and duplicate resources.

Use the skill command to load the complete Elements workflow explicitly:

```text
/skill:elements
```

## Workflow prompts

| Command | Workflow |
| --- | --- |
| `/elements-artifact` | Create a standalone Elements HTML artifact. |
| `/elements-doctor` | Check an Elements development setup. |
| `/elements-create-project` | Create an Elements starter project. |
| `/elements-migrate` | Migrate deprecated Elements packages and APIs. |

Each command accepts an optional request, such as `/elements-artifact create a settings page`.

## Tools

| Tool | Description |
| --- | --- |
| `elements_api_list` | List Elements components and attribute APIs. |
| `elements_api_get` | Get component or attribute API documentation. |
| `elements_api_validate` | Check HTML and JSON with Elements lint rules. |
| `elements_api_imports_get` | Get ESM imports for an Elements template. |
| `elements_api_tokens_list` | List semantic design tokens. |
| `elements_api_icons_list` | List icon names. |
| `elements_examples_list` | List known patterns and examples. |
| `elements_examples_get` | Get a complete example template. |
| `elements_packages_list` | List current Elements package versions. |
| `elements_packages_get` | Get package integration details. |
| `elements_packages_changelogs_get` | Get package changelog entries. |
| `elements_project_validate` | Check Elements project configuration. |

The `elements_` prefix prevents tool-name collisions with other Pi packages.

## Automatic validation

Automatic validation runs by default after Pi edits supported HTML files. Turn it off when starting Pi:

```shell
pi --no-elements-auto-validate
```

You can manage it for the current session:

```text
/elements-auto-validate off
/elements-auto-validate on
/elements-auto-validate status
```

When enabled, the extension runs Elements validation after successful Pi `edit` and `write` calls for `.html` and `.htm` files. The extension appends the validation summary and diagnostics to the tool result so the agent can address issues immediately.

## Manage

```shell
pi update npm:@nvidia-elements/pi
pi remove npm:@nvidia-elements/pi
pi config
```

Pi extensions execute with the user's system permissions. Install packages only from trusted sources and use Pi project trust for project-local resources.

## Related packages

Use [`@nvidia-elements/cli`](https://www.npmjs.com/package/@nvidia-elements/cli) for interactive shell commands, project creation, project setup, and MCP integrations. This package invokes the same internal Elements tools directly through Pi's extension API; it does not start the CLI or an MCP server.
