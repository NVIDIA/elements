# Release

Semantic Release automates releases, providing an open source tool for managing automatic publishing and deployment of libraries and packages following semver. It executes a release in the CI environment after every successful build. No human is directly involved in the release process and the tool guarantees releases remain unromantic and unsentimental.

## How monorepo releases work

Each project in the monorepo releases independently based on the commit scope in conventional commits. The shared configuration in `release.config.js` dynamically derives the scope from each project's package name and uses it to filter commits at two levels:

1. **Commit analysis** (`@semantic-release/commit-analyzer`): `releaseRules` match commits by scope. Only `feat(scope)` (minor), `fix(scope)` (patch), and breaking changes with the matching scope trigger a release. Catch-all rules suppress all other commits to prevent defaults from applying.
2. **Release notes** (`@semantic-release/release-notes-generator`): The `ignoreCommits` option filters notes to only include commits matching the project's scope.

Wireit orchestrates release order in the root `package.json` to respect inter-package dependencies (for example, `release:core` depends on `release:themes`).

### Scope derivation

The `release.config.js` file derives the scope from the package name:

- `@nvidia-elements/*` packages: scope = package name (for example, `@nvidia-elements/core` → `elements`)
- `@nvidia-elements/*` packages: scope = `labs-` + package name (for example, `@nvidia-elements/cli` → `labs-cli`)

This must match the commit scope enforced by `commitlint.config.js`.

### Tag format

Each project uses a unique tag format: `@nvidia-elements/my-library-v${version}`. Semantic release uses this to determine which commits are new since the last release for each project.

## Adding a new project

To wire up a new project to semantic release, complete the following:

1. Add the project to `pnpm-workspace.yaml` in the repository root

```yaml
packages:
  - 'projects/my-library'
```

2. Create an initial tag on GitLab https://github.com/NVIDIA/elements/-/tags/new

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

6. Add the library artifacts to the GitLab CI upload in `.github/workflows/ci.yml`

```yml
artifacts:
    expire_in: 1 week
    paths:
      ...
      - projects/my-library/dist
      - projects/my-library/package.json
```

7. Add library code coverage reports to GitLab CI upload in `.github/workflows/ci.yml`

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
