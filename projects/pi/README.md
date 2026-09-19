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

The package declares its Pi-specific `elements-pi` skill and workflow prompts as native Pi package resources. The distinct name lets it coexist with a project or global `elements` skill.

Use the skill command to load the complete Elements workflow explicitly:

```text
/skill:elements-pi
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
| `nvidia_elements_api_list` | List Elements components and attribute APIs. |
| `nvidia_elements_api_get` | Get component or attribute API documentation. |
| `nvidia_elements_api_validate` | Check HTML and JSON with Elements lint rules. |
| `nvidia_elements_api_imports_get` | Get ESM imports for an Elements template. |
| `nvidia_elements_api_tokens_list` | List semantic design tokens. |
| `nvidia_elements_api_icons_list` | List icon names. |
| `nvidia_elements_examples_list` | List known patterns and examples. |
| `nvidia_elements_examples_get` | Get a complete example template. |
| `nvidia_elements_packages_list` | List current Elements package versions. |
| `nvidia_elements_packages_get` | Get package integration details. |
| `nvidia_elements_packages_changelogs_get` | Get package changelog entries. |
| `nvidia_elements_project_validate` | Check Elements project configuration. |

The `nvidia_elements_` prefix identifies this package's tools and reduces naming conflicts with other Pi packages.

Pi exposes these tools directly and makes them available to `codemode` scripts. Direct calls return readable text. `codemode` calls receive `{ status, message, result }`; use `format: "json"` on tools that support it when a script needs structured data.

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

When enabled, the extension runs Elements validation after successful Pi `edit` and `write` calls for `.html` and `.htm` files. It appends the validation summary and diagnostics to the tool result. When `codemode` calls those tools, the extension also adds the validation result to the parent `codemode` result so the agent sees it even if the script omits the nested tool output.

## Manage

```shell
pi update npm:@nvidia-elements/pi
pi remove npm:@nvidia-elements/pi
pi config
```

Pi extensions execute with the user's system permissions. Install packages only from trusted sources and use Pi project trust for project-local resources.

## Related packages

Use [`@nvidia-elements/cli`](https://www.npmjs.com/package/@nvidia-elements/cli) for interactive shell commands, project creation, project setup, and MCP integrations. This package invokes the same internal Elements tools directly through Pi's extension API; it does not start the CLI or an MCP server.
