# @nvidia-elements/cli

## Installation

```shell
pnpm install -g @nvidia-elements/cli
```

```shell
nve
```

## Usage

| Command                                                           | Description                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `nve api.list [format] [format]`                                  | Get list of all available APIs and components.                       |
| `nve api.search [query] [format]`                                 | Get API information for specific APIs and components.                |
| `nve api.version`                                                 | Get latest versions of elements/@nve packages.                       |
| `nve changelogs.list [format]`                                    | Get changelog details for all @nve packages.                         |
| `nve changelogs.search [name] [format]`                           | Get changelog details for specific @nve package.                     |
| `nve examples.list [format]`                                      | Get list of available example templates/patterns.                    |
| `nve examples.search [query] [format]`                            | Search for example templates/patterns by name or description.        |
| `nve playground.validate [template]`                              | Get validated HTML string for an example template/playground.        |
| `nve playground.create [template] [type] [name] [author] [start]` | Creates a playground url/link generated from a html template string. |
| `nve project.create [type] [cwd] [start]`                         | Create a new starter project.                                        |
| `nve project.update [cwd]`                                        | Update a project to the latest versions of Elements packages.        |
| `nve project.health [type] [cwd]`                                 | Check the health of a project using Elements packages.               |
| `nve tokens.list [format] [format]`                               | Get available semantic CSS variables / design tokens for theming.    |

## MCP

### Local Development (Cursor)

```json
{
  "mcpServers": {
    "elements": {
      "command": "nve-mcp",
      "description": "Elements API and Custom Element Schema"
    }
  }
}
```

### Cursor

```json
{
  "mcpServers": {
    "elements": {
      "command": "pnpm",
      "description": "Elements API and Custom Element Schema",
      "args": [
        "--registry=https://registry.npmjs.org",
        "dlx",
        "nve-mcp"
      ]
    }
  }
}
```

### Prompts

| Prompt | Description | Example Prompt |
| ------ | ----------- | -------------- |
| `/about` | A brief introduction to Elements | `/about` |
| `/playground` | Context for creating playground prototypes | `/playground` Create an example login form |
| `/search` | Context for searching Elements APIs | `/search` What could I use for notifying user of a long running process? |
| `/new-project` | Context for creating a new Elements project. | `/new-project` Create a Angular todo app |

### Tools

| Tool | Description |
| ---- | ----------- |
| `nve api.list [format] [format]` | Get list of all available APIs and components. |
| `nve api.search [query] [format]` | Get API information for specific APIs and components. |
| `nve api.version` | Get latest versions of elements/@nve packages. |
| `nve changelogs.list [format]` | Get changelog details for all @nve packages. |
| `nve changelogs.search [name] [format]` | Get changelog details for specific @nve package. |
| `nve examples.list [format]` | Get list of available example templates/patterns. |
| `nve examples.search [query] [format]` | Search for example templates/patterns by name or description.` |
| `nve playground.validate [template]` | Get validated HTML string for an example template/playground. |
| `nve playground.create [template] [type] [name] [author] [start]` | Creates a playground url/link generated from a html template string. |
| `nve project.create [type] [cwd] [start]` | Create a new starter project. |
| `nve project.update [cwd]` | Update a project to the latest versions of Elements packages. |
| `nve project.health [type] [cwd]` | Check the health of a project using Elements packages. |
| `nve tokens.list [format] [format]` | Get available semantic CSS variables / design tokens for theming. |