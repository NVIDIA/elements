---
name: agent-dependencies
description: Perform one conservative dependency or toolchain upgrade in the Elements monorepo and open a validated pull request. Use for nightly or unattended dependency maintenance, outdated package checks, first-party `actions/*` GitHub Actions updates, and pinned mise tool updates. Use the github-dependabot skill instead when the task starts from a GitHub security alert.
---

# Agent Dependencies

You are the Elements dependency maintenance agent. You run unattended on a nightly schedule and produce at most one small pull request per run.

A reviewer must be able to identify the upgraded dependency, its affected project, and the validation evidence without untangling unrelated version changes. If you cannot isolate and verify one upgrade, make no commit or pull request and report why.

## Hard Constraints

These constraints apply to every scheduled run:

1. Select and update exactly one dependency update unit. An update unit is one direct dependency or one evidence-backed lockstep family.
2. Do not perform major upgrades. For a dependency below `1.0.0`, update only the patch version. Skip prerelease, deprecated, Git-based, aliased, and workspace dependencies.
3. Do not update a transitive dependency directly. Let the lockfile resolver change transitive packages only when the selected direct dependency requires them.
4. Except for one evidence-backed family, do not combine npm packages, GitHub Actions, Node.js, pnpm, or other mise tools in one pull request. Each is a separate update unit.
5. Preserve dependency sections, catalog references, version range styles, overrides, patches, and build permissions. Never edit `minimumReleaseAge`, `minimumReleaseAgeExclude`, `overrides`, `patchedDependencies`, or `allowBuilds` to force an update through.
6. Do not change source code, tests, snapshots, generated visual baselines, public APIs, or unrelated configuration. If the new version requires a migration or compatibility fix, stop and leave that upgrade for a supervised task.
7. Every changed non-generated line must be necessary for the selected dependency. Do not accept package manifest normalization, opportunistic formatting, or a lockfile rewritten by a different pnpm version.
8. Full local CI must pass before you open a pull request. Never dismiss a failure as unrelated.
9. Update only GitHub Actions in the `actions/*` namespace. Treat actions from every other owner as ineligible, including actions in other GitHub-owned namespaces.

Stopping is a successful nightly run. Do not widen the candidate merely to produce a pull request.

## Prepare the Run

1. Read the root `AGENTS.md` and run `git status --short --branch`. Preserve existing work. A scheduled run requires a clean worktree; stop unless the worktree is clean.
2. Fetch `origin`, resolve the current default branch, and base the work on it. Never push directly to the default branch.
3. Verify GitHub access with `gh auth status` before relying on GitHub metadata or preparing a pull request.

## Collect Candidate Facts

Run the collector from the repository root:

```shell
mise exec -- node .agents/skills/agent-dependencies/scripts/select-update.js
```

The collector is the source of truth for mechanical candidate facts. It:

- fetches the remote and stops when an unmerged `topic/dependencies/*` branch exists;
- discovers npm packages, GitHub Actions, and mise tools while handling each command's JSON and exit codes;
- scans direct declarations instead of trusting pnpm's aggregated dependency classification;
- reports distinct `wanted` and `latest` version options with major, prerelease, and pre-`1.0.0` boundary assessments;
- reports blockers for deprecated packages, unsupported specifiers, invalid scopes, runtime declarations across scopes, project declarations across scopes, and missing declarations;
- blocks every GitHub Action outside the `actions/*` namespace with an `unsupported-github-action-owner` reason;
- reports an existing open pull request, including a `Dependabot` pull request;
- classifies runtime versus dev usage and recommends the conventional commit type and scope; and
- orders mechanically eligible candidates by the documented blast-radius preferences without selecting one, and emits compact names and reasons for blocked candidates.

When the collector emits `"collected": false`, take no dependency update action. Stop immediately for a `guardrail` error. For an `environment` error, make one safe retry and stop if the retry fails.

## Choose One Update Unit

Use the collected facts as evidence, not as a mandatory selection. Review the emitted candidates in this order:

1. patch before minor;
2. one project scope before general tooling;
3. one direct dependency and one manifest before larger units; and
4. package name as a stable tie-break.

Review candidates in that order until one passes the release and compatibility review. If a candidate is unsafe, skip it and continue within the same run. Do not stop merely because the first candidate is unsuitable.

Before treating a candidate as independent, inspect its direct consumers and related packages for evidence that it belongs to a coordinated dependency family. Evidence includes peer dependency ranges, a shared upstream release train, matching versions or coordinated release notes, framework tooling documented to move with runtime packages, or an existing manifest that pins related packages to one version.

Common signals include `@angular/*`; Vue packages such as `vue` and `@vue/*`; Vite packages such as `vite` and `@vite/*`; Vitest packages such as `vitest` and `@vitest/*`; and Lit packages such as `lit` and `@lit/*`. These examples neither define an exhaustive list nor create an automatic grouping rule. A shared namespace alone is insufficient, and a family can combine scoped package names with names that have no scope.

When evidence supports a family:

1. collect every direct member used by the affected project;
2. choose the highest stable version compatible with every member without exceeding any member's eligible reported boundary;
3. use `mise exec -- pnpm view <package> versions --json` when reported boundaries differ;
4. classify all family declarations together, with runtime usage taking precedence; and
5. skip the entire family and continue to the next candidate if it cannot remain aligned.

Do not update one member independently when peer or release evidence shows that related direct dependencies must move with it.

Before editing, review the target release notes and package metadata for the dependency or family. Skip the candidate when the release introduces a breaking change, incompatible engines or peers, new install or build steps, a license concern, or a migration that exceeds this skill's scope. Continue reviewing candidates and stop only when none remain. Respect the repository's configured release-age policy without adding an exclusion.

## Enforce the Selected Scope

The collector recommends a commit type and scope for each independent candidate:

| Selected usage                | Commit                                               |
| ----------------------------- | ---------------------------------------------------- |
| Runtime in one project scope  | `fix(<project>): update <dependency> to <version>`   |
| Dev-only in one project scope | `chore(<project>): update <dependency> to <version>` |
| General internal tooling      | `chore(ci): update <dependency> to <version>`        |

Use the collected recommendation unless family evidence changes the combined usage. The collector reads `commitlint.config.js` as the authoritative scope list, maps `projects/site/` to `docs`, maps starter projects to `starters`, and blocks a project without a valid scope.

For a family, classify all direct declarations together. Runtime usage in any family member takes precedence over dev-only usage, so a family that includes a runtime dependency uses `fix(<project>)`.

A project-scoped commit may contain only the affected project's `package.json` and generated `NOTICE.md`, plus these shared dependency artifacts:

- `pnpm-workspace.yaml`;
- `pnpm-lock.yaml`;
- the root `NOTICE.md`; and
- that same project's generated `NOTICE.md`.

It must not contain a file from another project scope. A `chore(ci)` commit may contain root tooling files, `.github/`, `projects/internals/`, and exact version mirrors required by the selected tool. If notice generation changes a published project's `NOTICE.md`, reclassify the dependency as runtime or stop when changes span more than one project scope.

## Apply One Upgrade

Change the narrowest existing version source:

- For a family, update every selected member to the common target. Preserve each member's dependency section and range style. Stop instead of applying a partial family update.
- For a catalog dependency, edit its version once in `pnpm-workspace.yaml`. Keep `catalog:` and `catalog:publish` references in package manifests.
- For a project-local dependency, edit only that project's manifest and preserve its existing range style.
- For an eligible `actions/*` GitHub Action, update every pinned SHA occurrence of that one action and no other action.
- For a mise tool, update only that tool and all existing exact mirrors of its version. Run `mise lock <tool>` after changing `mise.toml`.
- Node.js and pnpm are separate upgrades. Keep their existing pins synchronized, but never update both in one run.

After editing an npm dependency, install from the repository root with the pinned toolchain:

```shell
CI=1 mise exec -- pnpm install --no-frozen-lockfile
mise exec -- pnpm run notice
```

Do not run `pnpm update --latest`, an unfiltered recursive update, or an automated fix that can rewrite manifests. Inspect the diff immediately after generation. The dependency source, lockfile resolution, and notices must all point to the intended target version.

Review the complete lockfile diff. Large generated diffs are not automatically wrong, but every changed resolution must trace to the selected dependency or its resolver-required transitive graph. Stop if the package manager version changed unexpectedly, unrelated direct versions moved, or you cannot explain the churn.

## Verify the Change

Read `projects/<name>/DEVELOPMENT.md` before running project-specific commands. For a project-scoped update, first run its complete CI target from that project directory:

```shell
mise exec -- pnpm run ci
```

For a tooling update, run the narrow validation that exercises that tool before full CI. For Node.js or pnpm, also run the root `ci:validate` target and confirm the active versions. For an eligible `actions/*` GitHub Action, inspect the complete workflow syntax and action inputs because local CI cannot execute the hosted action.

Then validate the final repository state from the root:

```shell
mise exec -- node .agents/skills/agent-dependencies/scripts/verify-update.js --type=<fix|chore> --scope=<scope>
CI=1 mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm run ci
git diff --check
```

The verifier checks the `topic/dependencies/<scope>/` branch, the commitlint scope, changed-file ownership, the allowed dependency artifacts, and the prohibition on source, test, and snapshot changes. Do not override a verifier failure.

Do not update snapshots or weaken checks. If any command fails, either prove and fix an error within the selected update-unit scope or stop without opening a pull request.

Report every validation command and result. Identify checks that could not run and why. Required validation must pass before opening a pull request. Never dismiss a failure as unrelated.

Before committing, verify these invariants:

- only the selected dependency update unit changed;
- every selected family member moved to the common target, with no partial update;
- the target version matches every intended pin and generated artifact;
- no unrelated direct dependency changed;
- no file belongs to another project scope;
- the commit type reflects runtime versus dev usage; and
- the working diff contains no pre-existing user work.

## Commit and Pull Request

The automated invocation authorizes a pull request, not direct changes to the default branch.

1. Create a branch using the selected commit scope and dependency or family slug:

   ```text
   topic/dependencies/<scope>/<dependency-slug>
   ```

2. Inspect the complete final diff and stage only files belonging to the selected update unit.
3. Use the classified conventional commit with an entirely lowercase subject, no trailing period, a maximum of 100 characters, and a `Signed-off-by:` trailer. Do not use the generic `deps` scope.
4. Push the topic branch and open a ready-for-review pull request targeting the default branch. Keep its body factual and concise:

   1. dependency or family and current-to-target version;
   2. whether the dependency is runtime, project dev-only, or general tooling, including its direct declaration locations;
   3. release-note or metadata risks reviewed;
   4. expected generated lockfile and notice changes; and
   5. every validation command and result.

5. Verify the remote branch, ready-for-review state, title, and body before finishing. If GitHub write access or repository policy prevents publishing, leave a validated, pull-request-ready local branch or patch and report the exact blocker.

## Stop Conditions

Open no pull request when any of these conditions applies:

- the collector returns `"collected": false`;
- no mechanically eligible candidate passes release and compatibility review;
- the selected release is too new for repository policy or its metadata introduces unacceptable risk;
- a selected family cannot remain aligned at its common target;
- direct declarations span more than one commit scope;
- the update needs source, test, snapshot, public API, migration, or unrelated configuration changes;
- generated files include another project scope or unexplained lockfile changes;
- the project has no valid commit scope; or
- required validation does not pass.

Stopping is a successful run. Report the selected candidate, what you checked, and the exact stop reason. Never widen the update merely to produce a pull request. Do not keep a journal or tracking file between runs; the manifests, lockfile, open pull requests, and remote branches are the source of truth.
