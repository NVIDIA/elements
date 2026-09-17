# Agents

Repository leveraged agent harness features. The `.agents` directory is the source of truth. Agent-specific directories keep only local config and relative symlinks into this directory.

## Features

Legend: ✅ supported | ⚠️ non-standard | ❌ blocked | ➖ not applicable

| Feature | Claude Code | Codex | Cursor | Open Code | Pi |
| --- | --- | --- | --- | --- | --- |
| **AGENTS.md** | ✅ [release](https://github.com/anthropics/claude-code/releases/tag/v2.1.277) - 2.1.277+ | ✅ [docs](https://developers.openai.com/codex/guides/agents-md) | ✅ [docs](https://cursor.com/docs/rules) | ✅ [docs](https://opencode.ai/docs/rules/) | ✅ [docs](https://pi.dev/docs/latest/usage#context-files) |
| **.agents/skills** | ⚠️ [issue](https://github.com/anthropics/claude-code/issues/31005) - `.claude/skills` (symlink) | ✅ [docs](https://developers.openai.com/codex/skills) | ✅ [docs](https://cursor.com/docs/skills) | ✅ [docs](https://opencode.ai/docs/skills) | ✅ [docs](https://pi.dev/docs/latest/skills) |
| **.agents/mcp.json** | ⚠️ [docs](https://code.claude.com/docs/en/mcp) - `.mcp.json` (symlink) | ⚠️ [docs](https://developers.openai.com/codex/mcp) - `.codex/config.toml` | ⚠️ [docs](https://cursor.com/docs/mcp) - `.cursor/mcp.json` (symlink) | ✅ [extension](https://opencode.ai/docs/plugins/) | ✅ [extension](https://pi.dev/docs/latest/extensions) |
| **.agents/hooks.json** | ⚠️ [docs](https://code.claude.com/docs/en/hooks) - `.claude/settings.json` | ⚠️ [docs](https://developers.openai.com/codex/hooks) - `.codex/hooks.json` (symlink) | ⚠️ [docs](https://cursor.com/docs/hooks) - `.cursor/hooks.json` | ✅ [extension](https://opencode.ai/docs/plugins/) | ✅ [extension](https://pi.dev/docs/latest/extensions) |
| **Language Server Protocol** | ⚠️ [docs](https://code.claude.com/docs/en/tools-reference#lsp-tool-behavior) - plugin required; unavailable in cloud sessions | ❌ [issue](https://github.com/openai/codex/issues/8745) | ✅ [docs](https://docs.cursor.com/context/) | ✅ [docs](https://opencode.ai/docs/lsp/) | ✅ [extension](https://pi.dev/docs/latest/extensions) |
| **MCP Apps/UI** | ✅ [docs](https://claude.com/docs/connectors/building/mcp-apps/getting-started) (desktop) | ⚠️ [docs](https://learn.chatgpt.com/docs/plugins) - desktop only | ✅ [docs](https://cursor.com/changelog/2-6) | ➖ cli | ➖ cli |

## Hook Events

All platforms call the same hook scripts. Event names and tool filters differ by platform.

| Purpose | Shared script | Claude Code | Codex | Cursor |
| --- | --- | --- | --- | --- |
| Session setup | `.agents/hooks/session-start.sh` | `SessionStart` + `startup` | `SessionStart` + `^startup$` | `sessionStart` |
| Shell guard | `.agents/hooks/pre-tool-use-bash.sh` | `PreToolUse` + `Bash` | `PreToolUse` + `^Bash$` | `preToolUse` + `Shell` |
| Write guard | `.agents/hooks/pre-tool-use-edit-write.sh` | `PreToolUse` + `Edit\|Write` | `PreToolUse` + `Edit\|Write` | `preToolUse` + `Write` |
| Format and lint | `.agents/hooks/post-tool-use-edit-write.sh` | `PostToolUse` + `Edit\|Write` | `PostToolUse` + `Edit\|Write` | `postToolUse` + `Write\|Edit` |
| End-of-turn checks | `.agents/hooks/stop.sh` | `Stop` | `Stop` | `stop` |

## Standardization Tracking

- https://github.com/modelcontextprotocol/modelcontextprotocol/issues/292
