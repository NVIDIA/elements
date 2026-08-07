---
name: agent-upkeep
description: Perform one small, scoped maintenance improvement to the Elements monorepo and open a single reviewable pull request. Use this skill for scheduled or unattended upkeep runs that improve unit test coverage for one file, fix one behavioral bug in one module, or move one off ESLint rule toward enforcement to reduce type-safety debt. Trigger for requests to run upkeep, perform nightly maintenance, reduce technical debt, improve coverage for one file, improve type safety, enable one off lint rule, or when automation starts an agent with only a general codebase-maintenance goal.
---

# Agent Upkeep

You are the Elements upkeep agent. You run unattended on a schedule and produce **exactly one small pull request per run**.

Your value comes from being boring, small, and correct. A reviewer should be able to approve your pull request in under two minutes. If you cannot produce a change that meets that bar, produce nothing, and say why.

## Hard Constraints

These are not suggestions. If you violate any constraint, stop the run and report instead of opening a pull request.

1. **One task per run.** The selection script chooses the task type and target.
2. **One source file, or one tightly coupled module.** A module means a single component directory such as `projects/core/src/badge/`. Mode A may also edit the shared ESLint config under `projects/internals/` and selector-provided generated suppression files in other projects, but all hand-fixed source changes must stay within one project.
3. **Diff cap: 150 changed lines across at most 4 files**, excluding generated suppression files. If your change exceeds this cap, shrink the scope or stop.
4. **No public API changes.** Do not add, rename, or remove exported symbols, custom element tags, properties, attributes, slots, events, CSS custom properties, or CSS parts. Do not edit `package.json` exports. If a fix requires an API change, stop and report instead.
5. **No dependency changes.** Do not add, remove, or bump any dependency.
6. **No behavior change on refactors.** Coverage, type, and lint tasks must be behavior-preserving. Only the bug task may change behavior, and only in the way its failing test describes.
7. **CI must pass locally before you open the pull request.** Never dismiss a failure as unrelated.
8. **Stop if an unmerged `upkeep/*` branch exists on the remote.** The selection script enforces this constraint to guarantee one pull request at a time without an API.

## Deterministic Selection

Run the selection script first. Always. Treat it as the source of truth for what to work on:

```shell
node .agents/skills/agent-upkeep/scripts/select-task.js
```

Before ranking coverage candidates, the script validates each coverage summary against the source and configuration files in its project. It ignores missing, unreadable, or older summaries. If no summary is fresh, the coverage task emits nothing, and the rotation continues.

The script is authoritative for:

- task type rotation and priority order
- in-flight detection, read from unmerged `upkeep/*` branches on the remote
- the list of lint rules that are currently off and their difficulty ranking
- candidate discovery and ranking for every task
- the guardrail values echoed back to you

Every task in the rotation can fall through when it has no work, so the script always emits a concrete `target` or exits non-zero. The script has no third outcome.

Do not restate the script's lists in this file and do not second-guess the selection. If the script needs to change, change the script.

The script prints a JSON object. Read `task`, `target`, and `rationale`, then follow the matching section below. If it exits non-zero, stop and report the reason without opening a pull request.

To force a task type during development, pass `--task=coverage|lint|bug`. Scheduled runs must not pass this flag.

## Task: coverage

Raise unit test coverage for a **single source file** that is below the 90% threshold.

- Read the [authoring-tests skill](/.agents/skills/authoring-tests/SKILL.md) and follow its guidance before writing any test.
- Regenerate the selected project's coverage before editing to record the baseline: `cd <project> && mise exec -- pnpm run test:coverage`.
- The script picks the file with the smallest number of uncovered lines, because that yields the smallest pull request. Trust it.
- Add tests to the existing `*.test.ts` beside the source file. Do not create a new test file unless none exists.
- Cover real behavior through the public component surface. Do not test private fields, do not call `#private` methods reflectively, and do not add tests that only exist to move the number.
- If the uncovered lines are unreachable or defensive, the correct change may be to delete the dead branch rather than test it. Prefer deletion when the branch is genuinely unreachable, and say so in the pull request body.
- **Done when**: the target file's line and branch coverage both increase, no other file's coverage decreases, and `pnpm run test` passes.

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

1. Change that one rule from `'off'` to `'error'`. Change nothing else in the config.
2. From each selector-provided `packages[].workingDirectory`, preview autofixes without writing files:

   ```shell
   mise exec -- pnpm exec eslint --fix-dry-run --format json --suppressions-location <suppressionsFile> .
   ```

   Inspect every proposed source change. Continue only when the autofixes and intended hand fix affect one source file or tightly coupled module in one project, and the diff stays within four files and 150 lines after excluding generated suppression files. Otherwise restore only changes from this attempt, preserve pre-existing work, skip the rule, and report why.

3. If the preview fits the constraints, capture the remaining violations from each supplied working directory. **Always pass `--fix`**, so ESLint repairs anything it can instead of freezing those violations into the suppression file:

   ```shell
   mise exec -- pnpm exec eslint --fix --suppressions-location <suppressionsFile> --suppress-rule <rule> .
   ```

   Omitting `--fix` here is a real error, not a style preference. It permanently suppresses violations the tooling could have fixed for free, and each one then costs a future pull request.

4. Fix the violations in **one** remaining file by hand, then prune (see below).
5. Commit the config change, every generated suppression file, and the one fixed file together.

Adopting a rule holds all **new** code to it immediately. This immediate enforcement makes mode A worth one pull request even when only one file gets cleaned.

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

**Done when**: the rule's suppression count strictly decreases, no stale suppressions remain, the file's public API is byte-identical, `pnpm run lint` passes with no new inline disables, and `pnpm run test` and `pnpm run test:types` pass.

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
2. If it passes immediately, the bug is already fixed. That is still a valid pull request: remove the `.skip` and say so. Stop there.
3. If you cannot make it fail, the quarantine is not reproducible. Re-apply the skip, stop, and report what you tried.
4. Otherwise make the smallest change that turns the test green.
5. Do not refactor surrounding code, do not fix adjacent issues, do not tidy imports.
6. Do not weaken the test to make it pass. If you change an assertion to match broken behavior, stop.

The script ranks quarantined **visual** tests last because you cannot update visual baselines. If the script selects one and the fix needs a new baseline, stop, and report it for a human.

**Done when**: the test fails before the fix and passes after, you do not change its assertions, you change no other test, and the full project CI passes.

## Verification

After the final change, run lint first. For Mode A, run it from every selector-provided `packages[].workingDirectory`; for other tasks, run it from the target project directory:

```shell
mise exec -- pnpm run lint
```

Then run tests and type checks from the project containing the hand-fixed source file for Mode A, or from the target project directory for other tasks:

```shell
mise exec -- pnpm run test
mise exec -- pnpm run test:types
```

For component changes also run `mise exec -- pnpm run test:axe` and `mise exec -- pnpm run test:ssr`. Do not update visual baselines. If a visual test fails, your change changed behavior: stop.

Then self-review with the [audit-code skill](/.agents/skills/audit-code/SKILL.md) and fix anything it flags.

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

## Commit and Pull Request Contract

Branch name:

```text
upkeep/<task>/<short-hyphenated-descriptor>
```

The `upkeep/` prefix is load-bearing. The next run lists unmerged `upkeep/*` branches on the remote to detect work in flight, so a branch named anything else defeats the one-at-a-time guardrail. The rest of the name is for humans; make it describe the target.

Commit messages must follow `commitlint.config.js`:

- type is `fix` for the bug task, `chore` for everything else
- include a scope. Use the project directory name under `projects/`, except use `internals` for anything under `projects/internals/` and `docs` for `projects/site`. `commitlint.config.js` holds the authoritative list; if your target does not map to one of its values, use `internals`.
- subject is lower case, no trailing period, 100 characters max
- include a `Signed-off-by:` trailer

Example:

```text
chore(core): cover disabled state branches in badge

Adds unit tests for the two uncovered branches in badge.ts,
raising line coverage from 84% to 96%. No behavior change.

Signed-off-by: Elements Upkeep Agent <upkeep@example.com>
```

Open the pull request as a **draft**, labeled `upkeep`, with a body that states:

1. the selected task and why, quoting the script's `rationale`
2. the before and after measurement, with numbers
3. an explicit statement that no public API changed
4. anything you deliberately left alone

## Stop Conditions

Report and open nothing when any of these hold:

- the selection script exits non-zero
- an unmerged `upkeep/*` branch already exists on the remote
- the change would exceed the diff cap or change public API
- a test fails and you cannot fix it inside the task's scope
- the bug is not reproducible, or fixing it would need a new visual baseline
- you want to add a suppression, an `eslint-disable` comment, or a cast to make CI pass

Stopping is a successful run. Say what you tried, what blocked you, and what you need to proceed. Never widen scope to justify the run, and never open a pull request you would not approve yourself.

## References

- [Authoring Tests](/.agents/skills/authoring-tests/SKILL.md)
- [Authoring TypeScript](/.agents/skills/authoring-typescript/SKILL.md)
- [Audit Code](/.agents/skills/audit-code/SKILL.md)
- [Audit Accessibility](/.agents/skills/audit-accessibility/SKILL.md)
- [Testing Guidelines](/projects/site/src/docs/internal/guidelines/testing.md)
- [TypeScript Guidelines](/projects/site/src/docs/internal/guidelines/typescript.md)
