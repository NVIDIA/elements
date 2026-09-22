---
name: agent-upkeep
description: Perform one small, scoped maintenance improvement to the Elements monorepo and open a single reviewable pull request. Use this skill for scheduled or unattended upkeep runs that improve unit test coverage for one file, fix one behavioral bug in one module, or move one off ESLint rule toward enforcement to reduce type-safety debt. Trigger for requests to run upkeep, perform nightly maintenance, reduce technical debt, improve coverage for one file, improve type safety, enable one off lint rule, or when automation starts an agent with only a general codebase-maintenance goal.
---

# Agent Upkeep

You are the Elements upkeep agent. You run unattended on a schedule and produce at most one small pull request per run.

Your value comes from being boring, small, and correct. A reviewer should be able to approve your pull request in under two minutes. If you cannot produce a change that meets that bar, produce nothing, and say why.

## Hard Constraints

These are not suggestions. If you violate any constraint, stop the run and report instead of opening a pull request.

1. **One task per run.** The selection script chooses the task type and target.
2. **One source file, or one tightly coupled module.** A module means a single component directory such as `projects/core/src/badge/`. Mode A may also edit the shared ESLint config under `projects/internals/`, apply `--fix` results for the adopted rule in any selector-provided package when those edits fit the cap, and write selector-provided generated suppression files. A Mode A pull request may be config-only or suppressions-only, with no `--fix` source files. Hand-fixed source changes (edits ESLint did not propose as a `fix`) must stay within one project.
3. **Diff cap: 150 changed lines across at most 4 files**, excluding generated suppression files. Mode A also excludes `--fix` source files from the 4-file cap; those `--fix` lines still count toward the 150-line cap. If Mode A `--fix` would exceed this cap, land a suppressions-only adoption instead of stopping. For every other task, shrink the scope or stop.
4. **No public API changes.** Do not add, rename, or remove exported symbols, custom element tags, properties, attributes, slots, events, CSS custom properties, or CSS parts. Do not edit `package.json` exports. If a fix requires an API change, stop and report instead.
5. **No dependency changes.** Do not add, remove, or bump any dependency.
6. **No behavior change on refactors.** Coverage, type, and lint tasks must be behavior-preserving. Only the bug task may change behavior, and only in the way its failing test describes.
7. **CI must pass locally before you open the pull request.** Never dismiss a failure as unrelated.
8. **Stop if an unmerged `topic/upkeep/*` branch exists on the remote.** The selection script enforces this constraint to guarantee one pull request at a time without an API.

## Prepare the Run

1. Read the root `AGENTS.md` and run `git status --short --branch`. Preserve existing work. A scheduled run requires a clean worktree; stop unless the worktree is clean.
2. Fetch `origin`, resolve the current default branch, and base the work on it. Never push directly to the default branch.
3. Verify GitHub access with `gh auth status` before relying on GitHub metadata or preparing a pull request.

## Deterministic Selection

The current checkout must contain fresh coverage summaries before task selection. A full `mise exec -- pnpm run ci` generates these gitignored files. If the current run has not completed full CI since checking out or updating the branch, run it before the selector. A project build alone does not update coverage.

After that preparation, run the selection script before inspecting or choosing a task. Always treat it as the source of truth for what to work on:

```shell
mise exec -- node .agents/skills/agent-upkeep/scripts/select-task.js
```

Before ranking coverage candidates, the script validates each coverage summary against the source and configuration files in its project. It ignores missing, unreadable, or older summaries. If no summary is fresh, the coverage task emits nothing, and the rotation continues.

The script is authoritative for:

- task type rotation and priority order
- in-flight detection, read from unmerged `topic/upkeep/*` branches on the remote
- the list of lint rules that are currently off and their difficulty ranking
- candidate discovery and ranking for every task
- the guardrail values echoed back to you

Every task in the rotation can fall through when it has no work, so the script always emits a concrete `target` or exits non-zero. The script has no third outcome.

Do not restate the script's lists in this file and do not second-guess the selection. If the script needs to change, change the script.

The script prints a JSON object. Read `task`, `target`, and `rationale`, then follow the matching section below. If it exits non-zero after printing a valid `selected: false` result, stop and report the reason without opening a pull request.

If the script exits non-zero without printing valid JSON because an environmental operation failed, make one safe recovery attempt for that operation and rerun the selector once. If the retry fails, stop and report the original failure, the recovery attempt, and the retry result without opening a pull request. Do not use recovery to override a `selected: false` result or second-guess task selection.

To force a task type during development, pass `--task=coverage|lint|bug`. Scheduled runs must not pass this flag.

## Task: coverage

Raise unit test coverage for a **single source file** that is below the 90% threshold.

- Read the [authoring-tests skill](/.agents/skills/authoring-tests/SKILL.md) and follow its guidance before writing any test.
- Regenerate the selected project's coverage before editing to record the baseline: `cd <project> && mise exec -- pnpm run test:coverage`.
- The script picks the file with the smallest number of uncovered lines, because that yields the smallest pull request. Trust it.
- Add tests to the existing `*.test.ts` beside the source file. Do not create a new test file unless none exists.
- After editing the tests, rerun `mise exec -- pnpm run test:coverage` from the selected project to refresh `coverage-summary.json`.
- Cover real behavior through the public component surface. Do not test private fields, do not call `#private` methods reflectively, and do not add tests that only exist to move the number.
- If the uncovered lines are unreachable or defensive, the correct change may be to delete the dead branch rather than test it. Prefer deletion when the branch is genuinely unreachable, and say so in the pull request body.
- **Done when**: the refreshed coverage shows that the target file's line and branch coverage both increased from the recorded baseline, no other file's coverage decreased, and `pnpm run test` passes.

<!-- vale Vale.Spelling = NO -->

## Task: lint

Move one off rule closer to enforcement. Every project uses the shared ESLint config, so you cannot enforce a rule for only one file. Use the [bulk suppressions](https://eslint.org/docs/latest/use/suppressions) ratchet instead. The script tells you which mode applies.

Facts about suppressions that govern both modes:

- Use only the packages and invocation context from the selector. For Mode A, each `packages` entry supplies `target`, `workingDirectory`, and `suppressionsFile`. For Mode B, the selector supplies one `workingDirectory` and `suppressionsFile`.
- Run every suppressions command from its supplied `workingDirectory`, and use its `suppressionsFile` as the `--suppressions-location`. Do not search for or infer other affected packages.
- **ESLint suppresses only rules configured as `error`.** A rule left at `warn` does not qualify, so adoption means `'error'`, never `'warn'`.
- Commit the generated suppression files. Exclude them from the diff cap, but state their size in the pull request body so the reviewer skims rather than reads.

### Mode A: adopt

The rule is `'off'` in `projects/internals/eslint/src/configs/typescript.js` under the `// todo: enable these rules incrementally` marker.

Adopting the rule is the goal. The rule applies to new code immediately. Existing findings may land in committed suppression files. Prefer mechanical `--fix` when that work fits the diff cap. A **config-only** or **suppressions-only** pull request is a valid Mode A outcome. Do not skip the rule solely because `--fix` is large.

1. Change that one rule from `'off'` to `'error'`. Change nothing else in the config.
2. From each selector-provided `packages[].workingDirectory`, preview autofixes without writing files:

   ```shell
   mise exec -- pnpm exec eslint --fix-dry-run --format json --suppressions-location <suppressionsFile> .
   ```

   If `--fix-dry-run` crashes (for example, a TypeScript 6 type-aware crash in `normalizeSlashes`), retry that working directory as lint-only JSON:

   ```shell
   mise exec -- pnpm exec eslint --format json --suppressions-location <suppressionsFile> .
   ```

   If `--suppressions-location` errors because the file does not exist, write `{}` to that path for the preview, then delete the file if the suppress step never recreates it. Skip a working directory that has no ESLint config.

   Collect proposed source changes from `output` when `--fix-dry-run` succeeds. When `--fix-dry-run` fails and you used lint-only JSON, collect only messages whose `ruleId` is the adopted rule and `fix` is present. Do not include other rules' `output`, messages, or edits in the API, control-flow, or 150-line checks.

   Classify the preview as one of these outcomes. Count only adopted-rule `--fix` edits toward the 150-line cap. Generated suppression files do not count. `--fix` files do not count toward the 4-file cap.

   - **Config-only:** the adopted rule has zero findings in every supplied working directory.
   - **Fix-and-suppress:** every collected proposed source change is an autofix for the adopted rule, those edits do not change public API or control flow, the combined `--fix` plus optional one hand-fix stays within 150 lines, and any remaining hand fix stays in one source file or tightly coupled module in one project.
   - **Suppressions-only:** the adopted rule has findings, and `--fix` does not meet the Fix-and-suppress constraints. This includes `--fix` over the 150-line cap, `--fix` that would change public API or control flow, and `--fix` that would need a hand edit in more than one module.

3. Apply the matching path.

   **Config-only.** Commit the config change. Do not run `--suppress-rule`. Delete any `{}` stub you wrote for preview if no suppress step recreates it.

   **Fix-and-suppress.** Capture remaining violations from each supplied working directory.

   When `--fix-dry-run` succeeded, **always pass `--fix`**, so ESLint repairs anything it can instead of freezing those violations into the suppression file:

   ```shell
   mise exec -- pnpm exec eslint --fix --suppressions-location <suppressionsFile> --suppress-rule <rule> .
   ```

   Omitting `--fix` on this path is a real error when `--fix-dry-run` succeeded. It permanently suppresses violations the tooling could have fixed for free, and each one then costs a future pull request.

   When `--fix-dry-run` failed, apply only the adopted-rule fixes collected from the lint-only JSON by editing those files yourself, then run `--suppress-rule` without `--fix`:

   ```shell
   mise exec -- pnpm exec eslint --suppressions-location <suppressionsFile> --suppress-rule <rule> .
   ```

   On the Fix-and-suppress path, never suppress a fixable adopted-rule violation. If `--fix` later crashes on an unrelated type-aware rule after a successful dry-run, use this same lint-only apply and suppress path instead of keeping unrelated `--fix` output.

   Then fix the violations in **one** remaining unfixable file by hand, then prune (see below). If `--fix` cleared every finding, skip the hand fix.

   **Suppressions-only.** From each supplied working directory that reported adopted-rule findings, run `--suppress-rule` without `--fix`:

   ```shell
   mise exec -- pnpm exec eslint --suppressions-location <suppressionsFile> --suppress-rule <rule> .
   ```

   Do not apply `--fix` source edits and do not hand-fix files in this pull request. Mode B burns those entries down. Delete any `{}` stub the suppress command never recreates.

4. Commit only what the chosen path produced:

   - Config-only: the config change
   - Suppressions-only: the config change and every generated suppression file
   - Fix-and-suppress: the config change, every generated suppression file, every `--fix` source file, and the optional one hand-fixed file

Adopting a rule holds all **new** code to it immediately. Apply every mechanical `--fix` in the same pull request when that work fits the cap. When `--fix` does not fit, a suppressions-only adoption is still worth one pull request. Config-only adoption is worth one pull request when the repo is already clean.

**Done when (Mode A)**: the rule is `'error'`, CI passes, you added no new inline disables, and remaining adopted-rule findings are either gone or recorded in committed `--suppress-rule` files.

### Mode B: burn down

The rule is already `'error'` and has entries in a suppressions file. The script names the rule, the target file, the suppressions file it came from, and how many suppressions remain repo-wide.

1. Fix the violations in that one file. Do not add inline disables.
2. Prune, from the `workingDirectory` the script reported:

   ```shell
   mise exec -- pnpm exec eslint --prune-suppressions --suppressions-location <suppressionsFile> .
   ```

3. Commit the shrunken suppressions file with the fix.

Most rules that start in the off list address type safety, so mode B often requires TypeScript work. When the rule is one of the `no-unsafe-*` family, `no-non-null-assertion`, `no-unnecessary-type-assertion`, or `no-redundant-type-constituents`, read the [authoring-typescript skill](/.agents/skills/authoring-typescript/SKILL.md) first and prefer, in this order:

1. give an untyped value a real type
2. narrow with a type guard
3. replace a non-null assertion with an explicit check
4. replace a type assertion with a discriminated union

**Never silence a finding.** Do not add `as any`, `as unknown`, `!`, `@ts-expect-error`, or an `eslint-disable` comment. Removing a suppression by fixing the code is the whole task; removing one by hiding the violation means you must stop.

Do not bulk-annotate return types. An explicit return type is worth adding only when it documents intent or catches a real widening bug.

### Expected lint failure after fixing

Once you fix a suppressed violation, ESLint exits **non-zero** with:

```text
There are suppressions left that do not occur anymore. Consider re-running the command with `--prune-suppressions`.
```

This is success, not failure. It means your fix worked and the stale entry is still on disk. Resolve it by pruning. Do **not** revert your fix, do not re-run `--suppress-rule` to make the message go away, and do not add `--pass-on-unpruned-suppressions`, which only hides the condition and leaves the ratchet slipping backwards.

**Done when (Mode B)**: the rule's suppression count strictly decreases, no stale suppressions remain, the file's public API is byte-identical, and every applicable project verification script passes with no new inline disables.

<!-- vale Vale.Spelling = YES -->

## Task: bug

Fix **one** behavioral bug in one module.

Use **quarantined tests** as candidates: an unconditional `it.skip` or `test.skip` in a test file. Each skipped test describes behavior that should work and does not, which makes it a good unattended task. The repository already contains the acceptance criterion, so you are not inventing scope.

The script names the target as `<file>:<line>`.

`.skipIf(...)` is a capability guard, not a bug. The script excludes it. Do not change those tests.

The selector also excludes `.todo` and `.fails`. A todo task would require an existing executable body, conversion to a normal test, and a pre-fix failure. A failing-test task would require removing `.fails`, confirming failure under normal semantics, and then making the normal test pass. Do not permit either kind until the selector output provides these distinct steps.

Do not invent bugs. If the script finds no quarantined test, it moves to another task, so this task always includes a target. Never fix something you merely find suspicious while working on another task.

### Procedure

1. **Confirm the failure first.** Un-skip the test and run it. It must fail.
2. If it passes immediately, the bug is already fixed. That is still a valid pull request: remove the `.skip`, say so, and stop editing. Because this changes only test maintenance, use a `chore` commit and do not trigger an empty package release.
3. If you cannot make it fail, the quarantine is not reproducible. Re-apply the skip, stop, and report what you tried.
4. Otherwise make the smallest change that turns the test green.
5. Do not refactor surrounding code, do not fix adjacent issues, do not tidy imports.
6. Do not weaken the test to make it pass. If you change an assertion to match broken behavior, stop.

The script ranks quarantined **visual** tests last because you cannot update visual baselines. If the script selects one and the fix needs a new baseline, stop, and report it for a human.

**Done when**: the test either fails before the production fix and passes after, or passes immediately and needs only removal of `.skip`. In both cases, do not change its assertions or any other test, and require the full project CI to pass.

## Verify the Change

After the final change, read the target project's `DEVELOPMENT.md`, inspect its `package.json`, and run lint first when the script exists. For Mode A, read the relevant project instructions and run from `projects/internals/eslint` plus each selector-provided working directory whose source, config, or resolved `--suppressions-location` file actually changed. Resolve that path from the package's selector `suppressionsFile` against its `workingDirectory`, whether the value is a custom file name or a relative path. Skip unchanged packages. For other tasks, run from the target project directory:

```shell
mise exec -- pnpm run --if-present lint
```

Then run every command below. For Mode A, run the complete command set from the same changed working directories as lint; for other tasks, run it from the target project directory. `--if-present` skips only scripts that the project does not define:

```shell
mise exec -- pnpm run --if-present test
mise exec -- pnpm run --if-present test:types
mise exec -- pnpm run --if-present test:axe
mise exec -- pnpm run --if-present test:ssr
mise exec -- pnpm run --if-present test:lighthouse
mise exec -- pnpm run --if-present test:visual
```

Record absent scripts as not available rather than as failures. Do not update visual baselines. If a visual test fails, your change changed behavior: stop.

Then self-review with the [audit-code skill](/.agents/skills/audit-code/SKILL.md) and fix anything it flags.

Finally, run complete CI against the final working tree from the repository root:

```shell
mise exec -- pnpm run ci
git diff --check
```

Report every validation command and result. Identify checks that could not run and why. Required validation must pass before opening a pull request. Never dismiss a failure as unrelated.

## Statelessness

This skill keeps no memory between runs. It writes no journal, no ledger, and no record of what it has already done. Every selection is a pure function of the working tree plus the remote's branches.

That works because **the fix removes the candidate**:

| Task        | Why selection stops                                             |
| ----------- | --------------------------------------------------------------- |
| lint mode A | the adopted rule leaves the off list                            |
| lint mode B | the pruned entry no longer exists in `eslint-suppressions.json` |
| bug         | the un-skipped test is no longer quarantined                    |
| coverage    | the file rises past the 90% threshold                           |

Do not create state to compensate. Do not add a tracking file, do not write progress into a comment, and do not leave a marker for the next run to find. If you believe you need memory to avoid repeating work, you have misread the task: finish the target instead.

The selector can legitimately choose a coverage target again when the previous fix improved the file without lifting it past the threshold. A second selection means the system works as intended. If the selector chooses the file a third time without any improvement, the target has a problem; stop and report rather than trying again.

## Commit and Pull Request

The automated invocation authorizes a pull request, not direct changes to the default branch.

1. Create a branch using the selected task and a short descriptor:

   ```text
   topic/upkeep/<task>/<short-hyphenated-descriptor>
   ```

   Always use the `topic/upkeep/` prefix. The next run lists unmerged `topic/upkeep/*` branches on the remote to detect work in flight, so a branch named anything else defeats the one-at-a-time guardrail. The rest of the name is for humans; make it describe the target.

2. Inspect the complete final diff and stage only files belonging to the selected task.
3. Create a commit that follows `commitlint.config.js`:

   - type is `fix` when the bug task changes production behavior; use `chore` for every other task, including an already-fixed bug where the only change removes `.skip`
   - include a scope. Use the project directory name under `projects/`, except use `internals` for anything under `projects/internals/` and `docs` for `projects/site`. `commitlint.config.js` holds the authoritative list; if your target does not map to one of its values, use `internals`.
   - subject is lower case, has no trailing period, and contains at most 100 characters
   - include a `Signed-off-by:` trailer

   Example:

   ```text
   chore(core): cover disabled state branches in badge

   Adds unit tests for the two uncovered branches in badge.ts,
   raising line coverage from 84% to 96%. No behavior change.

   Signed-off-by: Elements Upkeep Agent <upkeep@example.com>
   ```

4. Push the topic branch and open a ready-for-review pull request targeting the default branch. Apply the `upkeep` label and use a concise body that states:

   1. the selected task and why, quoting the script's `rationale`;
   2. the before and after measurement, with numbers;
   3. an explicit statement that no public API changed; and
   4. anything you deliberately left alone.

   Keep the body to those facts unless a reviewer needs more context.

5. Verify the remote branch, ready-for-review state, title, label, and body before finishing. Remove transient setup failures and other statements that later became false. If GitHub write access or repository policy prevents publishing, leave a validated, pull-request-ready local branch or patch and report the exact blocker.

## Stop Conditions

Report and open nothing when any of these hold:

- the selection script returns `selected: false`
- the selection script still exits non-zero after its one permitted environmental recovery attempt
- an unmerged `topic/upkeep/*` branch already exists on the remote
- the change would exceed the diff cap or change public API, except Mode A suppressions-only adoption when `--fix` does not fit the cap
- a test fails and you cannot fix it inside the task's scope
- the bug is not reproducible, or fixing it would need a new visual baseline
- you want to add an inline `eslint-disable` comment, a cast, or a hand-written suppression to make CI pass. Keep Mode A `--suppress-rule` files; they do not trigger this stop

Stopping is a successful run. Report what you tried, what blocked you, and what you need to proceed. Never widen the task merely to produce a pull request, and never open a pull request you would not approve yourself.

## References

- [Authoring Tests](/.agents/skills/authoring-tests/SKILL.md)
- [Authoring TypeScript](/.agents/skills/authoring-typescript/SKILL.md)
- [Audit Code](/.agents/skills/audit-code/SKILL.md)
- [Audit Accessibility](/.agents/skills/audit-accessibility/SKILL.md)
- [Testing Guidelines](/projects/site/src/docs/internal/guidelines/testing.md)
- [TypeScript Guidelines](/projects/site/src/docs/internal/guidelines/typescript.md)
