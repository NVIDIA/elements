# Build, Infrastructure, and CI/CD

This is an outline of the tooling that runs the Elements monorepo. This tooling powers a fully automated continuous deployment of many npm/Artifactory packages as well as documentation. This configuration enables:

- Building 30+ libraries, packages and starter projects
- 1400+ unit tests, visual regressions tests and performance lighthouse tests
- Fully automated deployment, versioning and publishing of packages and documentation

The **CI pipeline takes an average of [~10 minutes](https://github.com/NVIDIA/elements/-/pipelines/12762390)** from the moment a MR merges to deploying and becoming available to end users. The average clone, install, and build of the **CI pipeline locally takes about ~1-2 min** on a MacBook M1.

The local CI job is the same CI job run in the GitLab Pipeline, this ensures that if it passes locally, there is a high probability it passes in CI without issue.

## GitLab Features and Integrations

The Elements repo uses standard GitLab tooling to run its CI/CD pipeline.
The root [.github/workflows/ci.yml](https://github.com/NVIDIA/elements/-/blob/main/.github/workflows/ci.yml?ref_type=heads) contains the configuration for the entire pipeline.

- [GitLab Pages Hosting / MR Previews](https://gitlab.com/gitlab-org/gitlab/-/issues/422145)

  Deploy static site hosting and MR previews with CI/MR pipelines.

- [GitLab Page Redirects](https://docs.gitlab.com/ee/user/project/pages/redirects.html)

  Gitlab Page redirects for redirecting URLs between deployment URLs.

- [GitLab Slack Notifications](https://docs.gitlab.com/ee/user/project/integrations/slack.html)

  This sends notifications to the support Slack channel any time a release publishes.

- [Unit Test Reporting](https://docs.gitlab.com/ee/ci/testing/unit_test_reports.html)

  When opening MRs GitLab generates a test report in the UI to quickly see any potential issues.

- [Code Coverage Reporting](https://docs.gitlab.com/ee/ci/testing/code_coverage.html)

  When opening MRs GitLab generates a coverage report in the UI to quickly see uncovered branches.

- [CI Caching](https://docs.gitlab.com/ee/ci/caching/)

  The pipeline leverages GitLab CI Cache to cache pnpm installations between jobs, which drastically improves CI speed.

- [Issue Templates](https://docs.gitlab.com/ee/user/project/description_templates.html)

  Issues templates provide an easy way for users to file bugs or feature requests. This helps ensure the teams get the information they need to have a productive discussion with users.

- [Security Audits](https://docs.gitlab.com/ee/user/application_security/sast/index.html)

  Security audits such as runtime, dependency, and secret detection scanning.

- [Open Metrics](https://docs.gitlab.com/ee/ci/testing/metrics_reports.html)

  Standardized metrics tracking for repo and code quality health.

- [Git LFS (Large File System)](https://docs.gitlab.com/ee/topics/git/lfs/)

  Standardized way to source control large files without bloating git history. Useful for visual regression baseline images.

- [GitLab Runners/Docker Containers](https://docs.gitlab.com/ee/ci/docker/using_docker_images.html)

  Standardized Docker Containers and NV provided containers for GitLab Runners.

- [GitLab Container Registry](https://docs.gitlab.com/ee/user/packages/container_registry/)

  Upload [prebuilt containers](https://github.com/NVIDIA/elements/container_registry) for use in CI jobs.

- [GitLab Container Registry Automated Cleanup](https://github.com/NVIDIA/elements/-/settings/packages_and_registries)

  Automate cleanup and deletion of stale containers in the registry.

- [GitLab Job Artifacts](https://docs.gitlab.com/ee/ci/jobs/job_artifacts.html)

  Ability to upload job [build artifacts](https://github.com/NVIDIA/elements/-/artifacts) and outputs that other jobs or CI jobs can reference.

- [Gitlab Releases](https://docs.gitlab.com/ee/user/project/releases/)

  Tag artifacts with specific Git tags for standardized release artifact [history and tracking](https://github.com/NVIDIA/elements/-/releases).

- [GitLab Env Variables](https://github.com/help/ci/variables/index) + [NVault](https://confluence.nvidia.com/pages/viewpage.action?spaceKey=IPPSEC&title=GitLab+Secrets+using+Vault+Plugin+for+GitLab) (WIP)

  Standardized way to store API keys/secrets.

- [GitLab Runners](https://docs.gitlab.com/runner/)

  Spin up [self managed VMs](https://confluence.nvidia.com/pages/viewpage.action?pageId=1227431373) for creating GitLab Runners. Perflab provides basic shared [managed runners](https://confluence.nvidia.com/display/PERFLABGRP/Perflab+GitLab+Runner+Tagging+Standard). An initiative exists for a [company wide managed GitLab Runner farm](https://docs.google.com/document/d/1UJE_bHzGgAn9KZZlXh7uQnd7gFz2h-igC0xLyypFZqo/edit?tab=t.0).

- [GitLab Analytics](https://docs.gitlab.com/ee/user/analytics/)

  Provided analytics dashboards covering [CI/CD status](https://github.com/NVIDIA/elements/-/pipelines/charts), [code coverage](https://github.com/NVIDIA/elements/-/graphs/main/charts), [merge requests](https://github.com/NVIDIA/elements/-/analytics/merge_request_analytics), and [contributors](https://github.com/NVIDIA/elements/-/graphs/main?ref_type=heads).

- [Gitlab Usage Quotas](https://github.com/NVIDIA/elements/-/usage_quotas)

  Easily track/triage artifacts and resource usage on GitLab instance.

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

The following GitLab settings optimize code quality and stability within the repo.

- [Protected Tags](https://github.com/help/user/project/protected_tags)

  Ensure Git tags cannot be overridden or accidentally deleted. This is important for stability and Semantic Release based releases.

- [Protected Branches](https://github.com/help/user/project/protected_branches)

  Protects the `main` branch and requires going through the MR Review/CI Pipeline process.

- [Push Rules](https://github.com/help/user/project/repository/push_rules)

  Enforce rules such as topic branch names, commit message formats and Git tag stability.

- [Fast Forward Merge (Enforced Rebase)](https://github.com/help/user/project/merge_requests/methods/index#fast-forward-merge)

  Enforce that MRs must be rebased before merging. This ensures a clean Git history with no merge commits. This also ensures there is a 1:1 match of a commit and its release.

- [Disable Squash and Merge](https://github.com/help/user/project/merge_requests/squash_and_merge)

  Disable squashing commits in a MR ensures MRs with many small isolated change commits do not lose their commit history on merge to main.

- [Pipelines must succeed](https://github.com/help/user/project/merge_requests/merge_when_pipeline_succeeds.md#require-a-successful-pipeline-for-merge)

  Ensure the MR passes the CI pipeline which includes automated unit, integration, and performance tests.

- [Git strategy to fetch](https://github.com/help/ci/pipelines/settings#choose-the-default-git-strategy)

  To improve speed of the CI jobs, the CI fetches and updates a repo if existing already in the runner rather than a full clone.

- [Git shallow clone](https://github.com/help/ci/pipelines/settings#limit-the-number-of-changes-fetched-during-clone)

  If a Git fetch is not possible then a shallow clone occurs with the latest 10 commits. This improves CI job speed.

- [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/)

  Provides an easy to deploy static host for documentation and UI applications.

- [GitLab Scheduled Pipelines](https://docs.gitlab.com/ee/ci/pipelines/schedules.html)

  Scheduled pipelines run nightly builds of the documentation as well as full runs of [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) against [each of the 50+ components](https://github.com/NVIDIA/elements/-/jobs/82739890) in the Elements library.

## Release

[Semantic Release](https://github.com/semantic-release/semantic-release) is an open source tool for managing automatic publishing and deployment of libraries and packages following [SEMVER](https://semver.org/). This enables a fix or feature to appear in Artifactory within minutes of it merging and passing the CI automated tests. To integrate into GitLab, complete the following:

- Create `GITLAB_TOKEN` with maintainer permissions using a GitLab service account
- Generate Artifactory Identity Token via a service account named `NPM_TOKEN`
- Add tokens `GITLAB_TOKEN` and `NPM_TOKEN` to the [repo variables](https://github.com/help/ci/variables/index)
- Note, the bot name ran by Semantic Release is the [name of your provided GitLab Access Token](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html#bot-users-for-projects) (`GITLAB_TOKEN`) you can change this default if desired.
- Follow standard [Semantic Release](https://github.com/semantic-release/semantic-release) tooling/configuration. To see an example of this look at the Elements [release.config.cjs](https://github.com/NVIDIA/elements/-/blob/main/release.config.cjs?ref_type=heads) file.

## Git LFS

To add large static assets such as images and video use Git LFS.

1. Add the asset paths to the `.gitattributes` file. Be sure to commit the update to `.gitattributes` first.

```shell
# example path
projects/site/assets/**/*.webm filter=lfs diff=lfs merge=lfs -text
projects/site/assets/**/*.webp filter=lfs diff=lfs merge=lfs -text
```

2. Once you commit `.gitattributes`, add the assets as a followup commit to ensure Git LFS stores them.

## Resources

- [Publishing a Package by Using a GitLab CI/CD Pipeline](https://github.com/help/user/packages/npm_registry/index.md#publishing-a-package-by-using-a-cicd-pipeline)
- [Publishing with existing Git Tags with Semantic Release](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#existing-version-tags)
- [Semantic Release GitLab Example](https://docs.gitlab.com/ee/ci/examples/semantic-release.html)

## Migrating to GitLab

Below are the steps taken to migrate to GitLab from a larger mono-repo. If you move your existing repo in its entirety to GitLab then this process is not needed.

1. Clone the repo for migration
2. Install [git-filter-repo](https://github.com/newren/git-filter-repo) (Install via brew)
3. Update the following script to run the entire process at once. See the git-filter-repo documentation for API details.

```bash
#! /bin/bash

# Create a fresh clone of repo if needed
echo "Cloning repo..."
rm -rf ORIGINAL_FOLDER
git clone ORIGINAL_PATH

# Create a copy of original
echo "Creating copy of repo..."
cp -R ./original ./migrated
cd ./migrated

# Filter out the sub directory to move to the migrated GitLab repo
echo "Filtering history..."
git filter-repo --subdirectory-filter src/your-project-directory

# Remove any related commits that you may not want to migrate
echo "Removing history..."
git filter-repo --invert-paths --path src/ignore-directory

# Remove all old or unused branches so only `main` remains.
echo "Removing old branches..."
git branch | grep -v "main" | xargs git branch -D

echo "Migration complete! 🎉"
```

4. `git remote add origin ORGIN_NAME_URL` assign new origin
5. `git remote -v` verify origin
6. `git push -u origin main` push to main

### Resources

- [Splitting a Subfolder Out Into a New Repository (GitHub)](https://docs.github.com/en/get-started/using-git/splitting-a-subfolder-out-into-a-new-repository)
