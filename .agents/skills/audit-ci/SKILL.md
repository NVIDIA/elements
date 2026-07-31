---
name: audit-ci
description: Run and analyze Elements cold CI performance profiles and propose evidence-backed build, test, lint, and dependency-graph improvements. Use whenever asked to profile or benchmark pnpm run ci, rerun ci:profile, create a CI performance audit, compare CI timings, find bottlenecks or the completion path, investigate a CI performance regression, or recommend measured CI/build optimizations.
---

# Audit CI

Produce a repeatable cold-CI profile, explain what controls wall-clock completion, and turn the evidence into prioritized, testable recommendations.

## Required context

1. Read the repository `AGENTS.md`.
2. Read `projects/internals/BUILD.md`.
3. Inspect the current root `ci:profile` script and `projects/internals/ci/ci-profile.js`. Treat the script as the profiling source of truth.
4. Read a project's `DEVELOPMENT.md` before running project-specific commands when that file exists.

Do not copy profiling logic into this skill. Update the repository profiler when its behavior needs to change.

## Choose the workflow

- Run a new profile when the user asks to rerun, benchmark current changes, refresh an audit, or verify an optimization.
- Analyze existing `.metrics/ci-profile.{json,md}` artifacts without rerunning when the user asks only for interpretation and the artifacts match the intended commit and worktree state.
- Create recommendations without implementing them unless the user also asks for the changes.

## Profile safely

Run all repository commands through mise.

1. Inspect `git status --short`.
2. Preview ignored files that reset would delete with `git clean -ndX`.
3. Stop and ask before profiling if that preview includes user data, local assets, secrets, or other non-reproducible files. The profiler runs `pnpm run ci:reset`, which deletes ignored files and reinstalls dependencies before every sample.
4. Never stash, commit, discard, or clean tracked changes merely to make the profiler accept the worktree.
5. Use the clean command when the worktree is clean:

   ```shell
   mise exec -- pnpm run ci:profile
   ```

6. When the dirty changes are the intentional subject of the audit, preserve them and run:

   ```shell
   CI_PROFILE_ALLOW_DIRTY=1 mise exec -- pnpm run ci:profile
   ```

   Record the dirty-worktree condition in the report. Do not use this override for unrelated or unexplained changes.

Allow all three cold samples to finish. Dependency installation or browser setup can require network access. If a run fails, inspect the copied `.metrics/ci-profile-run-*.log` and reset logs, report the incomplete profile, and do not invent missing samples.

## Verify the artifacts

The profiler writes ignored artifacts under `.metrics/`:

- `ci-profile.json`: structured metadata, run durations, and per-script samples
- `ci-profile.md`: generated method and top-ten summary
- `ci-profile-run-{1,2,3}.log`: complete CI logs
- `ci-profile-reset-{1,2,3}.log`: reset and install logs

Before analysis, confirm:

- all three runs exist;
- every run has zero incomplete scripts;
- each ranked script has three samples;
- commit, dirty state, tool versions, CPU, and memory describe the intended environment;
- the generated Markdown agrees with the JSON.

Use JSON as the numeric source of truth. Keep full precision during calculations and round only for presentation.

## Analyze wall-clock relevance

The slowest command is not automatically the critical path.

1. Rank leaf scripts by median duration from `ci-profile.json`.
2. Inspect the end of each run log to identify the scripts that consistently complete last.
3. Trace those scripts through their Wireit `dependencies` in the relevant `package.json` files.
4. Separate:
   - final or near-final dependency branches;
   - long parallel work that consumes CPU, memory, filesystem, or browser capacity;
   - upstream work that delays a final branch;
   - composite commands whose phases need separate timing.
5. Inspect each candidate's command, configuration, file count, output, output consumers, and serialization settings before suggesting a change.
6. Compare with the existing audit only when its environment and method are compatible. Describe before/after changes as concurrent cold-CI measurements, not isolated causal proof.

Read [the optimization playbook](references/optimization-playbook.md) when generating recommendations or designing follow-up experiments.

## Create the audit

Create or refresh `projects/internals/ci/CI-PERFORMANCE.md`. Use `.metrics/ci-profile.md` as generated evidence, not as the finished audit.

Include:

1. Frontmatter and generation context
2. Executive summary with median CI time and comparison when available
3. Method, environment, and all run results
4. Current top-ten scripts
5. Completion-path analysis
6. Numbered open findings
7. Verified completed changes when a prior audit exists
8. Recommended experiment order
9. Raw artifact location

For every finding, provide:

- **Evidence:** measurements plus current configuration or dependency facts
- **Recommendation:** one bounded change or experiment
- **Validation:** output-equivalence checks, metrics to compare, and resource checks
- **Confidence:** confidence in the diagnosis and in the proposed approach

Keep completed work out of the open priority list. Mark an item verified only when the configuration changed and a comparable full profile confirms the result.

## Recommendation guardrails

- Do not add CI-share percentages together; scripts overlap.
- Do not claim a critical path from rankings alone.
- Do not recommend more concurrency without checking isolation, shared state, ports, output paths, report merging, memory, and machine-wide contention.
- Do not remove a quality check unless the same coverage remains in another required workflow.
- Prefer one-variable experiments and compare at least three samples when variance matters.
- Distinguish targeted project benchmarks from full concurrent CI results.
- Treat cache optimization separately from this cold profile because the profiler disables Wireit caching.
- Label estimates and inferred causes. Do not present them as measurements.
- Keep dependency upgrades separate from performance changes unless the upgrade is the explicit experiment.

## Check the report

Run:

```shell
mise exec -- pnpm exec prettier --write projects/internals/ci/CI-PERFORMANCE.md
mise exec -- pnpm exec vale --config .vale.ini projects/internals/ci/CI-PERFORMANCE.md
git diff --check
```

If `projects/internals/ci/ci-profile.test.js` exists, also run:

```shell
mise exec -- node --test projects/internals/ci/ci-profile.test.js
```

Do not rerun the full CI merely to validate the report: the profiler already completed it three times. Report the median, comparison, top remaining opportunities, artifact paths, and validation results to the user.
