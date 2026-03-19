# Build, Infrastructure, and CI/CD

This is an outline of the tooling that runs the Elements monorepo. This tooling powers a fully automated continuous deployment of many npm/Artifactory packages as well as documentation. This configuration enables:

- Building 30+ libraries, packages and starter projects
- 1400+ unit tests, visual regressions tests and performance lighthouse tests
- Fully automated deployment, versioning and publishing of packages and documentation

The **CI pipeline takes an average of ~10 minutes** from the moment a MR merges to deploying and becoming available to end users. The average clone, install, and build of the **CI pipeline locally takes about ~1-2 min** on a MacBook M1.


## Build

The following are the repo wide tools that apply to all source code and projects.

- [NodeJS/Corepack](https://nodejs.org/api/corepack.html)

  Corepack is a tool to help with managing versions of your package managers. It identifies the package manager configured for the repo, transparently installs it if needed, and runs it without requiring explicit user interactions. This ensures that everyone uses exactly the same package manager version without them having to manually synchronize it each time someone makes an update.

- [pnpm Package Manager](https://pnpm.io/)

  pnpm is a NodeJS package manager that enables highly cacheable and fast installs of Node packages.

- [Wireit](https://github.com/google/wireit)

  Wireit provides a way to unify node based build tooling across the repo, enabling build caching and dependency based build systems like Bazel.

- [Semantic Release](https://github.com/semantic-release/semantic-release)

  An open source tool for managing automatic publishing and deployment of libraries and packages following semver. Executes a release in the CI environment after every successful build. No human is directly involved in the release process and the tool guarantees releases remain unromantic and unsentimental.

- [Vite](https://vite.dev/)

  A open source tool for compiling and building web applications. Built on Rollup and ESBuild to provide a large plugin ecosystem and fast builds.

## Linting/Formatting

- [Husky](https://github.com/typicode/husky)

  Husky provides Git hooks to run pre code check ins such as linting and commit formatting. This reduces the turnaround time catching errors before they land in a CI job.

- [Lint Staged](https://github.com/lint-staged/lint-staged)

  Provides a way to lint and format source code only within Git staging.

- [Prettier](https://prettier.io/)

  Ensures consistent code formatting for the entire repo.

- [Vale](https://vale.sh/)

  Prose linter for documentation and JSDoc comments. Enforces consistent technical writing using the Google developer documentation style guide and write-good rules. Configuration is in `.vale.ini` with custom vocabulary and rules in `config/vale/styles/`. Vale runs against `*.md` and `*.ts` files in `projects/` source directories. The Vale binary is auto-installed via `config/vale/install.mjs` during `pnpm install`.

## Testing

- [Playwright](https://playwright.dev/)

  Used for real browser unit testing and visual regression testing.

- [Vitest](https://vitest.dev/)

  Built on Vite, Vitest provides testing tools and runners to execute automated tests. These tests can be unit tests, e2e tests or visual snapshots.

- [Lighthouse](https://github.com/GoogleChrome/lighthouse)

  An open source project providing a suite of e2e tests for performance, accessibility, and general best practices for web development.

## Release

[Semantic Release](https://github.com/semantic-release/semantic-release) is an open source tool for managing automatic publishing and deployment of libraries and packages following [SEMVER](https://semver.org/). This enables a fix or feature to appear in Artifactory within minutes of it merging and passing the CI automated tests. To integrate with GitHub, complete the following:

- Create `GITHUB_TOKEN` with maintainer permissions using a GitHub service account or GitHub App
- Generate npm Identity Token via a service account named `NPM_TOKEN`
- Add tokens `GITHUB_TOKEN` and `NPM_TOKEN` to the [repository secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- Note, the bot name ran by Semantic Release is the [name of your provided GitHub Access Token](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#bot-users-for-projects) (`GITHUB_TOKEN`) you can change this default if desired.
- Follow standard [Semantic Release](https://github.com/semantic-release/semantic-release) tooling/configuration. To see an example of this look at the Elements [release.config.cjs](https://github.com/NVIDIA/elements/blob/main/release.config.cjs) file.

## Git LFS

To add large static assets such as images and video use Git LFS.

1. Add the asset paths to the `.gitattributes` file. Be sure to commit the update to `.gitattributes` first.

```shell
# example path
projects/site/assets/**/*.webm filter=lfs diff=lfs merge=lfs -text
projects/site/assets/**/*.webp filter=lfs diff=lfs merge=lfs -text
```

2. Once you commit `.gitattributes`, add the assets as a followup commit to ensure Git LFS stores them.

