# Build, Infrastructure, and CI/CD

This is an outline of the tooling that runs the Elements monorepo. This tooling powers a fully automated continuous deployment of many npm packages as well as documentation. This configuration enables:

- Building 30+ libraries, packages and starter projects
- 3500+ unit tests, visual regressions tests and performance lighthouse tests
- Fully automated deployment, versioning and publishing of packages and documentation

The **CI pipeline takes an average of ~10 minutes** from the moment a PR merges to deploying and becoming available to end users. The average clone, install, and build of the **CI pipeline locally takes about ~1-2 min** on a MacBook M series.

The local CI job is the same CI job run in GitHub Actions, this ensures that if it passes locally, there is a high probability it passes in CI without issue.

## GitHub Features and Integrations

The Elements repo uses standard GitHub tooling to run its CI/CD pipeline.
The [`.github/workflows/ci.yml`](https://github.com/NVIDIA/elements/blob/main/.github/workflows/ci.yml) contains the configuration for the entire pipeline.

- [GitHub Pages Hosting](https://docs.github.com/en/pages)

  Deploy static site hosting with GitHub Actions workflows.

- [GitHub Actions CI/CD](https://docs.github.com/en/actions)

  Automated workflows for building, testing, and deploying on every push and pull request.

- [GitHub Actions Caching](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows)

  The pipeline leverages GitHub Actions cache to cache pnpm installations between jobs, which drastically improves CI speed.

- [Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)

  Issues templates provide an easy way for users to file bugs or feature requests. This helps ensure the teams get the information they need to have a productive discussion with users.

- [Code Scanning / Security Audits](https://docs.github.com/en/code-security/code-scanning)

  Security audits such as runtime, dependency, and secret detection scanning.

- [Git LFS (Large File System)](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)

  Standardized way to source control large files without bloating git history. Useful for visual regression baseline images.

- [GitHub Actions Runners](https://docs.github.com/en/actions/using-github-hosted-runners)

  GitHub-hosted runners for executing CI/CD workflows.

- [GitHub Actions Artifacts](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow)

  Ability to upload job build artifacts and outputs that other jobs or CI jobs can reference.

- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)

  Tag artifacts with specific Git tags for standardized release artifact history and tracking.

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)

  Standardized way to store API keys/secrets.

- [Dependabot](https://docs.github.com/en/code-security/dependabot)

  Automated dependency updates and security vulnerability alerts.

- [Publishing with existing Git Tags with Semantic Release](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#existing-version-tags)

  Configure Semantic Release to recognize pre-existing version tags so releases continue from the correct version after migration.

- [Commit Signatures and Verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)

  Cryptographically sign commits to verify author identity and ensure code integrity across the supply chain.

- [Immutable Releases](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/preventing-changes-to-your-releases)

  Prevent published releases from being modified or deleted, ensuring downstream consumers always get the exact artifacts that were reviewed and tested.

- [Code Quality Check](https://docs.github.com/en/code-security/how-tos/secure-at-scale/configure-enterprise-security/configure-specific-tools/allow-github-code-quality-in-enterprise)

  Enforce automated code quality gates on pull requests to catch issues before they merge to main.

- [Custom Keyword Detections](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/customize-leak-detection/defining-custom-patterns-for-secret-scanning)

  Define custom secret scanning patterns to detect internal tokens, API keys, or proprietary identifiers that GitHub's built-in patterns may not cover.

- [Enable DCO](https://github.com/apps/dco)

  Enforce the Developer Certificate of Origin on all pull requests, requiring contributors to sign off on their commits to certify they have the right to submit the code.

- [Code of Conduct](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project)

  Establish community standards and expectations for contributor behavior in an open source project.

- [Secret Scanning and Push Protection](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/prevent-future-leaks/enabling-push-protection-for-your-repository)

  Block pushes that contain detected secrets before they reach the remote, preventing accidental credential leaks in the repository history.

- [Dependency Monitoring and Alerts](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configuring-dependabot-alerts)

  Receive alerts when dependencies have known security vulnerabilities so they can be patched or upgraded promptly.

- [Dependabot Auto-Updates for Actions](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/keeping-your-actions-up-to-date-with-dependabot)

  Keep GitHub Actions workflow dependencies up to date automatically, reducing exposure to vulnerabilities in third-party actions.

- [Disable Public Issues](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/disabling-issues)

  Disable the public issue tracker when bug reports and feature requests should be routed through a different channel.

- [Private Security Disclosures](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/privately-reporting-a-security-vulnerability)

  Allow external security researchers to report vulnerabilities privately, giving maintainers time to patch before public disclosure.

- [Encrypted Secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)

  Store sensitive values like API keys and tokens securely, accessible only to GitHub Actions workflows at runtime.

- [Trusted Publishers](https://docs.npmjs.com/trusted-publishers)

  Link the GitHub repository directly to npm so packages can be published via OIDC tokens without storing long-lived npm credentials.

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

## Repo Configuration

The following GitHub settings optimize code quality and stability within the repo.

- [Protected Tags](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/configuring-tag-protection-rules)

  Ensure Git tags cannot be overridden or accidentally deleted. This is important for stability and Semantic Release based releases.

- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

  Protects the `main` branch and requires going through the PR Review/CI Pipeline process.

- [Branch Protection: Require Linear History](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-linear-history)

  Enforce that PRs must be rebased before merging. This ensures a clean Git history with no merge commits. This also ensures there is a 1:1 match of a commit and its release.

- [Branch Protection: Require Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)

  Ensure the PR passes the CI pipeline which includes automated unit, integration, and performance tests.

- [GitHub Pages](https://docs.github.com/en/pages)

  Provides an easy to deploy static host for documentation and UI applications.

- [Scheduled Workflows](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule)

  Scheduled workflows run nightly builds of the documentation as well as full runs of [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) against each of the 50+ components in the Elements library.

## Release

[Semantic Release](https://github.com/semantic-release/semantic-release) is an open source tool for managing automatic publishing and deployment of libraries and packages following [SEMVER](https://semver.org/). This enables a fix or feature to be available within minutes of it merging and passing the CI automated tests. To integrate into GitHub, complete the following:

- Generate a `GITHUB_TOKEN` (automatically available in GitHub Actions)
- Generate an `NPM_TOKEN` via npm [trusted publishers](https://docs.npmjs.com/trusted-publishers) or access token
- Add `NPM_TOKEN` to the [repository secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
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
