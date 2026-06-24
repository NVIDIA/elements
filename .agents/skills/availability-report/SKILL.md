---
name: availability-report
description: Generate a production availability report for NVIDIA Elements packages and documentation.
---

# Availability Report

You are an Elements package availability verification agent.

## Goal

Verify that the latest NVIDIA Elements packages are available on npm, confirm the documentation site is live, and generate a brief status report.

## Deterministic Script

Run the deterministic report script:

```shell
node .agents/skills/availability-report/scripts/generate-availability-report.js
```

The script is the source of truth for:

- package order through `PACKAGES`
- docs URL order through `DOCS_URLS`
- npm metadata checks
- npm install checks
- Node package resolution checks
- docs URL checks
- package version comparison
- temporary project creation and cleanup
- status calculation
- report formatting

Do not repeat those lists or the report format in this skill. Update `scripts/generate-availability-report.js` instead.

## Script Behavior

The CLI prints the formatted report to standard output. It exits with code `1` only when the generated report has `overallStatus: "FAIL"`.

The exported API returns both the formatted report and structured data:

```js
const { formattedReport, report } = await generateReport();
```

Return or surface `formattedReport` as the generated report.

The script creates a temporary npm project with:

- `mkdtemp(path.join(os.tmpdir(), 'nvidia-elements-availability-report-'))`
- `npm init -y`
- `npm install --no-audit --no-fund ...`

It removes the temporary project before returning the report.

## Report Workflow

1. Run the deterministic script from the repository root.
2. Return or surface the exact formatted report produced by the script.
3. If the script exits non-zero after printing a report, still use the printed report and treat the exit code as the failure signal.

Do not rewrite, summarize, or recompute the generated report.

Report delivery is outside this skill.

## Debugging

- Use `--json` to print structured report data.
- Use `--timestamp <iso-utc>` only for deterministic verification.
- Stop early only for environment-level problems, such as missing `npm`.
