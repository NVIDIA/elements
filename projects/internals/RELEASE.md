# Release

Semantic Release automates releases, providing an open source tool for managing automatic publishing and deployment of libraries and packages following semver. It executes a release in the CI environment after every successful build. No human is directly involved in the release process and the tool guarantees releases remain unromantic and unsentimental.

To wire up a new project to semantic release, complete the following:

1. Add the project to `pnpm-workspace.yaml` in the repository root

```yaml
packages:
  - 'projects/my-library'
```

2. Create an initial tag on GitLab https://github.com/NVIDIA/elements/-/tags/new

```json
@nvidia-elements/my-library-v0.0.0
```

3. Create a release script in the root `package.json`

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
  "command": "cd projects/my-library && pnpm exec semantic-release",
  "dependencies": [
    "release:elements"
  ]
},
```

4. Ensure the `index.js` entrypoint of your library exports the following:

```javascript
export const VERSION = '0.0.0';
```

5. Add the library artifacts to the GitLab CI upload in `.github/workflows/ci.yml`

```yml
artifacts:
    expire_in: 1 week
    paths:
      ...
      - projects/my-library/dist
      - projects/my-library/package.json
```

6. Add library code coverage reports to GitLab CI upload in `.github/workflows/ci.yml`

```yml
reports:
    junit:
      - projects/my-library/coverage/unit/junit.xml
```

7. Add a new commit scope to `commitlint.config.js`

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

8. Ensure a `README.md` and empty `CHANGELOG.md` exist in the root of the project.

9. Create a new MR with the above changes.

```shell
feat(labs-my-library): release
```
