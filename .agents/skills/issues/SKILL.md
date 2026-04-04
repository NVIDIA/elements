---
name: issues
description: Get open issues or a specific issue from the project. Use when the user asks about issues, bugs, feature requests, or wants to see open work.
argument-hint: [issue_number]
---

# Issues

Fetches open issues or a specific issue for the Elements project from GitLab.

## Prerequisites

This skill requires the **MaaS-GitLab** MCP server to be available. If the MCP server is not connected or not listed in the available tools, inform the user that this skill cannot run without it and suggest they check their MCP configuration.

## Instructions

### Mode A—List open issues (no issue number provided)

1. Call `mcp__MaaS-GitLab__gitlab_list_issues` with:

   - `project_id`: `"NVIDIA/elements"`
   - `state`: `"opened"` (default, or use value the user requests: `"closed"`, `"all"`)
   - `labels`: pass through if the user specifies labels (comma-separated)
   - `milestone`: pass through if the user specifies a milestone
   - `max_results`: `20`

2. Present a summary table: **IID**, **Title**, **Labels**, **Assignee**, **Created**

3. If no issues found, state that directly.

4. **Offer next steps:** "Want details on a specific issue?" (uses `gitlab_get_issue`)

### Mode B—Get single issue (issue number provided)

1. Call `mcp__MaaS-GitLab__gitlab_get_issue` with:

   - `project_id`: `"NVIDIA/elements"`
   - `issue_iid`: the issue number from the user

2. Present: title, state, author, assignees, labels, milestone, description, and recent comments.

3. **Offer next steps:** "Want to see all open issues?" (uses `gitlab_list_issues`)

## Example Output

### List mode

```
## Open Issues

| IID  | Title                            | Labels              | Assignee | Created    |
|------|----------------------------------|----------------------|----------|------------|
| #421 | Button focus ring missing in FF  | bug, elements        | @alice   | Mar 12     |
| #418 | Add dark mode tokens for badge   | feat, themes         | @bob     | Mar 10     |
| #415 | Dropdown ARIA role incorrect     | a11y, elements       |          | Mar 08     |

Want details on a specific issue?
```

### Single-issue mode

```
## Issue #421: Button focus ring missing in FF

- **State:** opened
- **Author:** @alice
- **Assignees:** @alice, @bob
- **Labels:** bug, elements
- **Milestone:** v2.4.0

### Description
The focus ring on `nve-button` does not render in Firefox 125+...

### Recent Comments
**@bob** (Mar 14): Confirmed on FF 125.0.1, works fine on Chrome...

Want to see all open issues?
```
