---
name: agent-web-modernization
description: Fix one evidence-backed browser modernization issue in the Elements monorepo and open a validated pull request. Use to remove obsolete browser polyfills, legacy platform fallbacks, or browser workarounds, or replace custom code with supported native APIs. Use agent-dependencies for ordinary dependency upgrades and audit-simplification for general implementation simplification.
---

# Agent Web Modernization

Fix one browser modernization issue and produce at most one focused pull request per run. Find compatibility code that no longer serves its purpose, or a native browser API that can replace a custom implementation with a concrete maintenance benefit. Carry the selected improvement through implementation, validation, and a pull request.

The browser target is the Chromium build installed by the Playwright version pinned in the repository dependencies. Resolve that version and its Chromium build during each run from the repository's dependency declarations, lockfile, and installed Playwright package. Use this target for compatibility decisions and validation. Do not substitute system Chrome, the latest Chrome release, or a separately installed Chromium version, and do not embed fixed browser versions in this skill.

Invocation of this skill authorizes one validated pull request, never a direct default-branch change or an automatic merge.

## Prepare the Run

1. Read the root `AGENTS.md` and run `git status --short --branch`. Preserve existing work. Start from a clean worktree; stop if the worktree has changes.
2. Fetch and prune `origin`, resolve its current default branch, and base the investigation and eventual change on its latest commit. Do not assume the checkout contains recent fixes.
3. Verify GitHub access with `gh auth status` before relying on GitHub metadata or preparing a pull request. Prefer available GitHub tools for metadata, with `gh` as a fallback.
4. Find local `topic/web-modernization/*` and remote `origin/topic/web-modernization/*` branches not merged into the current remote default branch, including unpublished local branches retained after a publishing failure. Stop when either exists and report its branch and associated PR, if any.
5. Search open PRs for browser modernization work and the affected area. Recheck the selected candidate before publishing to avoid duplicating another fix.

Read the target project's `DEVELOPMENT.md`, package manifest, and nearer agent instructions before analyzing or running its commands. Follow the required guidelines for any files that may change.

## Discover Candidates

Honor a user-specified project or feature. Otherwise, start with polyfill bundles and compatibility utilities across `projects/`. Include DOM and JavaScript APIs, CSS, component internals, starters, and site code. Exclude dependency trees, third-party source, generated output, snapshots, and build artifacts from candidate discovery.

Use repository search to locate polyfill imports and dependencies, prototype patches, feature detection, vendor prefixes, user-agent branches, old CSS syntax, bug links, and comments mentioning workarounds or legacy behavior. Treat matches as leads, not proof of obsolescence. Inspect these three kinds of opportunity:

- **Obsolete polyfill:** all behavior supplied by a patch or dependency is native in the target browser, including the particular methods and options its consumers use.
- **Legacy browser fallback:** a compatibility branch, syntax translation, or browser bug workaround addresses versions outside the target, and no other supported execution environment needs it.
- **Native replacement:** a supported standard browser API can replace custom logic while preserving the required semantics and reducing maintenance, synchronization, or resource ownership.

Do not interpret every `legacy` or `deprecated` match as browser compatibility. Existing Elements API migrations, TypeScript decorator modes, SSR guards, and build-tool limitations have separate lifetimes. A newly available API needs a concrete benefit beyond novelty.

Trace each candidate's consumers across every project, including tests, examples, docs, and internal patterns. Inspect history and linked browser issues when they explain why the code exists. Determine whether the compatibility code is optional, global, automatically imported by tests, or part of a published entrypoint. Treat `/internal` exports as published boundaries too.

## Verify Compatibility and Behavior

Read `projects/site/src/docs/about/support.md` and relevant project support notes for additional support obligations. Use the repository-pinned Playwright Chromium as this workflow's compatibility baseline, and assess each optional polyfill's purpose separately.

For each serious candidate:

1. Resolve the repository's pinned Playwright version, including its catalog declaration in `pnpm-workspace.yaml` and resolution in `pnpm-lock.yaml`. Inspect the matching installed `playwright-core` package's `browsers.json` for the expected Chromium build. Launch Chromium through that Playwright installation and record the Playwright version, Chromium revision and runtime version, and check date. Confirm that the executable belongs to the expected build. If the browser is missing, use the repository's documented browser installation command with the pinned toolchain. Do not upgrade Playwright, select another browser channel, or override the executable to make a candidate qualify.
2. Consult current [MDN browser-compatibility data](https://github.com/mdn/browser-compat-data), the relevant platform specification, and official browser release notes or resolved browser issues. Link the exact evidence for the specific method, option, syntax, or bug. Do not rely on memory, a top-level compatibility badge, usage share, or a search snippet alone.
3. Verify that the required behavior ships by default in the targeted Chromium build. Experimental flags, origin trials, proposals, and support only in a newer build do not establish support in the target. Check constraints such as secure contexts and user activation when relevant.
4. Compare the native contract with the current implementation: event ordering, return values, error behavior, shadow DOM, styling, focus, accessibility, connection/disconnection, and cleanup where affected. Keep intentional differences.
5. Assess Firefox and Safari effects separately, including what optional-polyfill consumers would lose. Missing support there does not automatically veto a change supported by the targeted Chromium build, but preserve any explicit project support policy and document consumer impact.
6. Check SSR, DOM emulators, and build-tool requirements independently. Keep necessary guards or isolate test-only support when that separation is a small, justified part of the same change. Do not remove required test support merely because Chromium implements the API.

If sources are unavailable, incomplete, or contradictory, do not claim removal is safe. Continue to another candidate or report the missing evidence.

## Select One Improvement

Rank verified candidates by evidence, concrete benefit, confidence in behavioral equivalence, and migration risk. Prefer a bounded removal over a broad redesign. Skip unsuitable candidates and continue until one qualifies or no worthwhile opportunity remains.

Before editing, state the selected source locations, obsolete mechanism or native replacement, compatibility evidence, required behavior, consumer impact, and focused validation. Continue with the selected change rather than stopping at findings or recommendations.

Do not impose a one-file limit on a coherent cleanup. [PR #499](https://github.com/NVIDIA/elements/pull/499) removed a custom-state polyfill together with its import, package export, side-effects entry, and build entry. Use that as a completeness example, not evidence that the same change remains available on current main.

## Apply the Selected Change

Create `topic/web-modernization/<short-slug>` from the current default branch before editing. Establish a focused behavioral baseline and follow the applicable authoring skills and repository guidelines.

- Remove the obsolete implementation and its unnecessary branches, imports, feature probes, comments, and implementation-specific tests. Preserve tests of required observable behavior.
- Preserve public component APIs, exports, events, styling hooks, and intentional behavior. The narrow exception is an obsolete public polyfill entrypoint: you may remove it with its implementation, but document the lost import path and consumer migration. Check the repository's release and deprecation rules first; if they prevent removal now, choose another candidate or report the blocker. Absence of repository consumers does not prove absence of external users.
- Update associated package exports, side-effects declarations, build entries, bundle imports, docs, and examples when necessary. For packaging changes, read `projects/site/src/docs/api-design/packaging.md` and the build guidelines required by `AGENTS.md`.
- Remove a dependency or catalog entry only after checking all consumers. Preserve dependencies still used elsewhere. Regenerate the lockfile and notices through the pinned toolchain when dependency declarations change, and inspect generated diffs for unrelated churn.
- Keep the change to one opportunity. Do not combine dependency upgrades, unrelated cleanup, support-policy edits, or a broader API migration.

## Validate the Change

Use the pinned toolchain through `mise`. Read the affected projects' `DEVELOPMENT.md` files for their actual scripts.

1. Exercise the affected native behavior in the Chromium build installed by the repository-pinned Playwright, with the removed polyfill or fallback absent. Inspect test setup for imports that could silently restore it. Confirm that the runtime browser version matches the resolved target and record it. A DOM emulator or `CSS.supports` probe alone does not verify behavioral equivalence.
2. Run the focused behavioral tests and affected projects' lint, type, test, and build checks as applicable. Include SSR checks for import or environment changes, and accessibility and visual checks for focus, semantics, or styling changes. Add a regression test when it covers meaningful behavior, rather than merely asserting the deletion of code.
3. For packaging changes, inspect built exports and bundle output and verify surviving consumer imports without the removed artifact. Confirm that remaining polyfills still work independently.
4. Run formatting and prose checks for changed files, then `mise exec -- pnpm run ci` from the repository root. Stage only files belonging to the selected improvement, including newly created files, and run `git diff --cached --check` against the final staged changes. Restage and repeat the whitespace check if those files change before committing.

Required checks must pass before opening a PR. Never dismiss a failure as unrelated. Fix failures only within the selected opportunity; otherwise stop and report. Do not weaken assertions, skip tests, lower thresholds, or update visual baselines to force success.

## Commit and Pull Request

1. Review the complete final diff and stage only files belonging to the selected improvement. Check for remaining obsolete imports, registrations, exports, and terminology.
2. Use a conventional commit with an allowed project scope, an entirely lowercase subject, no trailing period, at most 100 characters, and a `Signed-off-by:` trailer. Follow `commitlint.config.js`. Classify runtime and tooling changes according to repository release rules; do not label a breaking entrypoint removal as harmless cleanup to bypass them.
3. Push the topic branch and open one ready-for-review PR targeting the default branch. Include the removed mechanism or native replacement and its benefit, the pinned Playwright version, Chromium revision and runtime version, check date, compatibility source links, preserved behavior, Firefox/Safari and public-entrypoint effects, and validation commands and results.
4. Verify the remote branch, ready-for-review state, target branch, title, and body. Remove transient setup failures and other statements that became false during validation. If access restrictions or repository policy prevent publishing, keep the validated local branch or patch and report the exact blocker. Do not merge the PR.

## Stop Conditions

Open no pull request when:

- the worktree has existing changes;
- an unmerged local or remote `topic/web-modernization/*` branch or an existing fix is in flight;
- no worthwhile candidate has sufficient compatibility evidence;
- the change requires an incompatible public API change or violates release or deprecation policy; or
- required validation does not pass.

Stopping is a successful run. Finish with the PR URL and validation outcome, or an evidence-backed explanation for opening nothing. Include necessary compatibility code retained and any deferred opportunities briefly. Never widen the task merely to produce a PR.

## Statelessness

Repository contents, open pull requests, and local and remote branches are the source of truth between runs. Do not create a journal, ledger, or tracking file. Resolve the pinned browser target and compatibility evidence afresh each run.
