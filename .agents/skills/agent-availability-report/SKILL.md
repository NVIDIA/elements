---
name: agent-availability-report
description: Generate a production availability report for NVIDIA Elements packages, skill registry, and documentation.
---

# Agent Availability Report

You are an Elements package availability verification agent.

## Goal

Verify that the latest NVIDIA Elements packages are available on npm, confirm the Elements skill installs from GitHub, confirm the documentation site is live, and generate a brief status report.

## Prepare the Run

1. Read the root `AGENTS.md`.
2. Run from the repository root with the pinned toolchain through `mise`.
3. Preserve the current worktree. The report must not change tracked files.

## Deterministic Script

Run the deterministic report script:

```shell
mise exec -- node .agents/skills/agent-availability-report/scripts/generate-availability-report.js
```

The script is the source of truth for:

- package order through `PACKAGES`
- docs URL order through `DOCS_URLS`
- npm metadata checks
- npm install checks
- Node package resolution checks
- Elements skill installation through the public `skills` CLI
- docs URL checks
- package version comparison
- temporary project creation and cleanup
- status calculation
- report formatting

Do not repeat those lists or the report format in this skill. Update `scripts/generate-availability-report.js` instead.

## Script Behavior

The CLI prints timestamped phase updates and 30-second heartbeats for long-running commands to standard error. Concurrent checks can finish in any order. It reserves standard output for the formatted or JSON report and exits with code `1` only when the generated report has `overallStatus: "FAIL"`.

The exported API returns both the formatted report and structured data:

```js
const { formattedReport, report } = await generateReport();
```

Return or surface `formattedReport` as the generated report.

The script creates temporary projects with:

- `mkdtemp(path.join(os.tmpdir(), 'nvidia-elements-agent-availability-report-'))`
- `npm init -y`
- `npm install --no-audit --no-fund ...`
- `mkdtemp(path.join(os.tmpdir(), 'nvidia-elements-agent-skill-availability-'))`
- `npx skills@1.7.0 add https://github.com/nvidia/elements --skill elements`
- verification that `.agents/skills/elements/SKILL.md` declares the `elements` skill

It removes the temporary projects before returning the report.

## Report Workflow

1. Run the deterministic script from the repository root.
2. Return or surface the formatted report produced by the script.
3. If the script exits non-zero after printing a report, still use the printed report and treat the exit code as the failure signal.

Do not rewrite, summarize, or recompute the generated report.

Report delivery is outside this skill.

## Debugging

- Use `--json` to print structured report data.
- Use `--timestamp <iso-utc>` only for deterministic verification.
- Stop early only for environment-level problems, such as missing `npm`.
