---
name: pipelines
description: Get CI/CD pipelines from GitLab using the MCP server. Use when the user asks about pipelines, CI status, builds, failing pipelines, or wants to inspect jobs and logs.
argument-hint: "[status] [branch]"
---

# Pipelines

Fetches CI/CD pipelines for the Elements project from GitLab.

## Prerequisites

This skill requires the **MaaS-GitLab** MCP server to be available. If the MCP server is not connected or not listed in the available tools, inform the user that this skill cannot run without it and suggest they check their MCP configuration.

## Instructions

### Mode A—List pipelines (default)

1. Call `mcp__MaaS-GitLab__gitlab_list_pipelines_jobs` with:

   - `project_id`: `"NVIDIA/elements"`
   - `pipeline_status`: use the status the user requested (`"failed"`, `"success"`, `"running"`, `"pending"`, `"canceled"`), or omit to return all statuses
   - `max_results`: `20`
   - `pipeline_ref`: use the branch name the user supplied, or `"main"` if they omitted it

2. Compute the start of the current week (Monday) from {{ currentDate }}. Filter pipelines to only those created **on or after that Monday** unless the user requests a different time range.

3. Present a summary table with:

   - **Pipeline ID** (link-friendly)
   - **Status** (failed, success, running, etc.)
   - **Branch/Ref**
   - **Commit title** (short SHA + message)
   - **Triggered by** (user)
   - **Created at** (date and time)
   - **Failed jobs** (only for failed pipelines, if job data is available)

4. For failed pipelines, highlight the **failed job names and stages** so the user can quickly see what broke.

5. If no pipelines match the filters, state that directly.

6. **Offer next steps:**
   - "Want to inspect a specific pipeline's job logs?" (uses `gitlab_get_job_log`)
   - "Want to see the full pipeline tree?" (uses `gitlab_get_pipeline_tree`)

### Mode B—Failing pipelines

When the user specifically asks about failures, broken builds, or what's failing:

1. Follow Mode A with `pipeline_status` set to `"failed"`.

2. Additionally highlight any **recurring failures** (same job failing across several pipelines) to help identify systemic issues.

### Mode C—Pipeline details (pipeline ID provided)

When the user provides a specific pipeline ID:

1. Call `mcp__MaaS-GitLab__gitlab_get_pipeline_tree` with:

   - `project_id`: `"NVIDIA/elements"`
   - `pipeline_id`: the pipeline ID from the user

2. Present the full pipeline tree showing all stages and jobs with their statuses.

3. For any failed jobs, offer to fetch logs: "Want to see the logs for a failed job?" (uses `gitlab_get_job_log`)

### Mode D—Job logs (job ID provided)

When the user asks for logs of a specific job:

1. Call `mcp__MaaS-GitLab__gitlab_get_job_log` with:

   - `project_id`: `"NVIDIA/elements"`
   - `job_id`: the job ID from the user

2. Display the relevant log output, focusing on error messages and the tail of the log.

## Example Output

### List mode (all statuses)

```
## Pipelines This Week (Mon Mar 16 – Fri Mar 20) — main

| Pipeline | Status | Commit | By | Created | Notes |
|----------|--------|--------|----|---------|-------|
| #123458  | ✅ success | abc124 fix(core): badge a11y | @alice | Mar 20 09:10 | |
| #123457  | ❌ failed  | def456 feat(themes): dark mode | @bob | Mar 20 14:05 | build |
| #123456  | ❌ failed  | abc123 fix(core): button focus | @alice | Mar 18 10:23 | lint, test:visual |
| #123455  | ✅ success | ghi789 chore(ci): update config | @carol | Mar 17 16:30 | |

Want to inspect a specific pipeline or see job logs?
```

### Failing pipelines mode

```
## Failing Pipelines This Week (Mon Mar 16 – Fri Mar 20)

| Pipeline | Branch | Commit | By | Created | Failed Jobs |
|----------|--------|--------|----|---------|-------------|
| #123456  | main   | abc123 fix(core): button focus | @alice | Mar 18 10:23 | lint, test:visual |
| #123457  | topic/foo | def456 feat(themes): dark mode | @bob | Mar 20 14:05 | build |

⚠️ "build" failed in 2 pipelines this week — possible systemic issue.

Want to dig into the logs for any of these?
```
