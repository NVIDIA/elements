# Agents

https://agentskills.io/

Common skills and hooks shared across agent platforms. Symlinks are source controlled by default.

```shell
# symlink skills
ln -sfn ../.agents/skills .claude/skills

# hooks
# .claude/settings.json references .agents/hooks directly
# .codex/config.toml enables hooks and .codex/hooks.json references .agents/hooks
# Hooks resolve the project root from AGENTS_PROJECT_DIR, agent-specific env vars,
# hook JSON cwd fields, the hook script location, or git.

# symlink context
ln -s AGENTS.md CLAUDE.md
```
