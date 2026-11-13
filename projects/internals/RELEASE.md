# Release

Semantic Release automates releases, providing an open source tool for managing automatic publishing and deployment of libraries and packages following semver. It executes a release in the CI environment after every successful build. No human is directly involved in the release process and the tool guarantees releases remain unromantic and unsentimental.

## How monorepo releases work

Each project in the monorepo releases independently based on the commit scope in conventional commits. The shared configuration in `release.config.js` dynamically derives the scope from each project's package name and uses it to filter commits at two levels:

1. **Commit analysis** (`@semantic-release/commit-analyzer`): `releaseRules` match commits by scope. Only `feat(scope)` (minor), `fix(scope)` (patch), and breaking changes with the matching scope trigger a release. Catch-all rules suppress all other commits to prevent defaults from applying.
2. **Release notes** (`@semantic-release/release-notes-generator`): The `ignoreCommits` option filters notes to only include commits matching the project's scope.

Wireit orchestrates release order in the root `package.json` to respect inter-package dependencies (for example, `release:core` depends on `release:themes`).

### Scope derivation

The `release.config.js` file derives the scope from the package name:

- `@nvidia-elements/*` packages: scope = the package name without the organization (for example, `@nvidia-elements/core` → `core`, `@nvidia-elements/cli` → `cli`)

This must match the commit scope enforced by `commitlint.config.js`.

### Tag format

Each project uses a unique tag format: `@nvidia-elements/my-library-v${version}`. Semantic release uses this to determine which commits are new since the last release for each project.

## Concurrent merges

Main push workflows and manual requests to publish pending releases share a concurrency group with `queue: max`. An active run finishes, including publication; up to 100 pending runs wait without replacing each other. If the queue is full, GitHub cancels additional requests. An older revision's rerun cannot evict the current revision's pending release. Pending order follows arrival at the concurrency group, not commit recency. Pull request and merge queue runs use separate groups and can validate in parallel. Superseded validation runs still cancel. Manual runs without a publication request and scheduled runs do not replace a pending publication run.

Both `ci` and `lighthouse` must pass before package release or Pages deployment. Package releases run for pushes to `main` or explicit manual publication requests on `main`. Pages also supports manual runs on `main` without a package release. Validation on other branches and merge queue candidates does not publish.

The release job checks out `github.sha` and downloads `build-artifacts` from its own workflow run. Before publishing, an inline Git check verifies that the checkout matches `GITHUB_SHA`, then reads the live main ref from the remote. A mismatched checkout or failed remote lookup fails the job. If main has advanced, the job defers publication and skips the MCP manifest handoff. The latest validated main run releases all pending changes using the existing scope rules and package release order.

The `ci` job waits for its concurrent artifact uploads before allowing release or Pages deployment to start. After a current release, the release job uploads the MCP manifest as the unzipped `server.json` artifact for `publish-mcp`. The [build guide's artifact reference](./BUILD.md#artifact-uploads) lists the IndexNow artifacts, download paths, retention periods, and verification steps.

The source check is a checkpoint, not a lock on the merge queue. Main can advance during an active release. Semantic release checks whether its branch is current, and release commit pushes must remain fast-forward updates. Do not pull newer source into the release checkout or force-push release commits. If publication stops partway through the package list, inspect the failed step and compare each affected package's Git tag with its npm version before following the recovery steps below. Do not rerun a superseded build to bypass the source check.

The [GitHub concurrency behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#concurrency) serializes publication requests without canceling an active publisher or replacing pending requests. The source check lets the current main run combine pending changes from superseded revisions. Configure the merge queue separately using the [build guide](./BUILD.md#merge-queue).

### Release recovery

Semantic release determines pending changes from each package's release tag and later scoped commits. A tag can exist even when npm publication failed, because semantic release pushes tags before npm publishing. Choose recovery based on the failed stage:

| Failure                                                 | Recovery                                                                                                                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CI or Lighthouse fails before release preparation       | Retry failed jobs on the current revision for a transient failure, or merge a passing fix or revert PR. Untagged changes remain pending for a later validated run. |
| Publication stops between packages                      | Confirm that completed packages have both their release tags and npm versions, then publish the remaining untagged changes from current main.                      |
| A release tag exists but its npm version is missing     | Repair that package's missing npm publication before continuing. The manual option does not automatically republish a version already marked by a Git tag.         |
| Pages or MCP publishing fails after package publication | Retry or repair the affected downstream stage. Check whether the npm packages already published before starting another package release attempt.                   |

To publish pending releases from a fresh validation of current main:

1. Open **Actions → CI → Run workflow** in GitHub.
2. Select the **main** branch and enable **Publish pending releases from current main**.
3. Run the workflow. It rebuilds and runs both validation jobs before publishing eligible pending releases.

The option defaults to off. It uses the same publication lock, source check, and MCP handoff as an automatic main release. If main advances during validation, the source check defers publication; use the latest main run or submit another request for current main. A publication request on another branch fails validation. Leave the option unchecked to run validation and, on main, deploy Pages without publishing packages.

## Adding a new project

To wire up a new project to semantic release, complete the following:

1. Add the project to `pnpm-workspace.yaml` in the repository root

```yaml
packages:
  - 'projects/my-library'
```

2. Create an initial tag on GitHub

```
@nvidia-elements/my-library-v0.0.0
```

3. Add `release.config.js` resolution to the project's `package.json`

```json
"release": {
  "extends": "../../release.config.js"
}
```

4. Create a release script in the root `package.json` wireit config

```json
"release": {
  "command": "echo 'Releasing...'",
  "dependencies": [
    ...
    "release:my-library"
  ]
},
```

```json
"release:my-library": {
  "command": "cd projects/my-library && HUSKY=0 pnpm exec semantic-release",
  "dependencies": [
    "release:elements"
  ]
},
```

5. Ensure the `index.js` entrypoint of your library exports the following:

```javascript
export const VERSION = '0.0.0';
```

6. Add the library artifacts to the CI upload in `.github/workflows/ci.yml`

```yml
artifacts:
    expire_in: 1 week
    paths:
      ...
      - projects/my-library/dist
      - projects/my-library/package.json
```

7. Add library code coverage reports to CI upload in `.github/workflows/ci.yml`

```yml
reports:
    junit:
      - projects/my-library/coverage/unit/junit.xml
```

8. Add a new commit scope to `commitlint.config.js`

```javascript
'scope-enum': [
  2,
  'always',
  [
    ...
    'labs-my-library'
  ]
]
```

9. Ensure a `README.md` and empty `CHANGELOG.md` exist in the root of the project.

10. Create a new MR with the above changes.

```shell
feat(labs-my-library): release
```
