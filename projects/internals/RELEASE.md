# Release

Releases are automated via Semantic Release, an open source tool for managing automatic publishing and deployment of libraries and packages following semver. Executes a release in the CI environment after every successful build. No human is directly involved in the release process and the releases are guaranteed to be unromantic and unsentimental.

To wire up a new project to semantic release the following must be completed:

1. Create an initial tag on GitLab https://github.com/NVIDIA/elements/-/tags/new

```json
@nvidia-elements/my-library-v0.0.0
```

2. Create a release script in the root `package.json`

```json
"release": {
  "command": "echo 'Releasing...'",
  "dependencies": [
    ...
    "release:labs-my-library"
  ]
},
```

```json
"release:labs-my-library": {
  "command": "cd projects/labs/my-library && pnpm exec semantic-release",
  "dependencies": [
    "release:elements"
  ]
},
```

3. Ensure the `index.js` entrypoint of your library exports the following:

```javascript
export const VERSION = '0.0.0';
```

4. Add the library artifacts to the GitLab CI upload

```yml
artifacts:
    expire_in: 1 week
    paths:
      ...
      - projects/labs/my-library/dist
      - projects/labs/my-library/package.json
```

5. Add a new commit scope to `commitlint.config.js`

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

6. Ensure a `README.md` and empty `CHANGELOG.md` exist in the root of the project.

7. Create a new MR with the above changes.

```shell
feat(labs-my-library): release
```
