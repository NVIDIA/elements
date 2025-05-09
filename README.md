# Elements

The Design Language for AI/ML Factories Building at the Speed of Light

[![release](https://github.com/NVIDIA/elements/-/badges/release.svg?value_width=200)](https://github.com/NVIDIA/elements/-/releases)
[![pipeline status](https://github.com/NVIDIA/elements/badges/main/pipeline.svg)](https://github.com/NVIDIA/elements/-/commits/main)
[![coverage](https://github.com/NVIDIA/elements/badges/main/coverage.svg?min_good=90&key_width=170&key_text=coverage)](https://github.com/NVIDIA/elements/-/graphs/main/charts)

- [Elements Storybook](https://NVIDIA.github.io/elements/api/)
- [Elements Playground](http://nv/elements-playground)
- [Elements Figma](http://nv/elements-figma)

## Requests and Contributions

- [Contribution Guidelines](https://NVIDIA.github.io/elements/docs/about/contributions/)
- [Feature request](https://github.com/NVIDIA/elements/-/issues/new?issuable_template=feature)
- [Bug report](https://github.com/NVIDIA/elements/-/issues/new?issuable_template=default)
- [Slack Support](https://nvidia.enterprise.slack.com/archives/C03BDL2UCGK)

## Organization

The repository is organized as a top-level **overall** repository and, inside that, libraries are broken up into individual **project** directories.

Project directories have their own `package.json` and commands. But all setup for the CI and development needs to happen at the root **repository** level.

Examples of projects include:

- `/projects/starters` - Suite of standardized starter apps for Elements and Patterns
- `/projects/elements` - Elements library: curated UI maintained by the Elements team
- `/projects/elements-react` - Elements React library for React compatibility/support
- `/projects/testing` - A set of testing utilities for Lit based Web Components.
- `/projects/themes` - Elements Theme library: provides a set of supported themes for Element based projects
- `/projects/styles` - Elements Styles library: provides a set of CSS utilities for layout and typography

## Development

### Setup

To setup repository dependencies and run the full build, run the following commands at the **root** of the repository:

```shell
# required only if https://git-lfs.com not already installed on system
brew install git-lfs
git lfs install
git lfs pull
```

```shell
# install required dependencies
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install
npm install -g corepack@0.32.0
corepack enable
corepack prepare --activate
pnpm i --frozen-lockfile --prefer-offline
```

```shell
# run ci pipeline locally (lint, build, test)
pnpm run ci
```

#### Troubleshooting

If you are coming from development from a different repository, you may need to install a new version of node in `nvm`. If you see an error message to this effect, [refer to the nvm docs](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage) for installing the missing node version and for directions on switching between versions of `node` using `nvm`. Once `nvm` is installed you can switch to the repository defined node and pnpm verisons by re-running the [setup/install step](#setup) above.

If you actively work/switch between different repositories run `nvm use && corepack prepare --activate` in the root of the project to ensure use of the correct node/pnpm version.

### Building

Both the top-level repository and each project has a set of standardized NPM scripts. To build and test all projects run `pnpm run ci` at the root of repository.

#### Top-Level Repository

- `ci`: run full build/lint/test
- `ci:all`: entire CI process: build, lint, unit/lighthouse/visual tests
- `ci:reset`: clear all caches/dependencies then reinstall dependencies

#### Individual Projects

- `dev`: run in watch mode
- `build`: run project/library build
- `test`: run unit tests
- `test:lighthouse`: run lighthouse performance tests
- `test:visual`: run playwright visual regression tests
- `test:axe`: run axe tests for a11y

To learn in detail how the repo is built and run see our [build README.md](https://github.com/NVIDIA/elements/-/blob/main/build/README.md).

## Workflow

Before creating a branch or merge request be sure to make a [new issue or feature request](https://github.com/NVIDIA/elements/-/issues/new) first for the team to evaluate. This will help ensure that your work aligns with the goals of the project and that you are not duplicating effort.

### Create a Branch

The Gitlab repo enforces branches to use the `topic/` prefix for branches to be merged. Example `topic/bug-fix`. Once a MR is merged the topic branch will automatically be deleted from the remote repo on Gitlab.

```shell
git checkout -b topic/bug-fix
```

Once your branch is created, make your source code changes. Once your changes are complete run `pnpm run ci` in the root of the repo to run all the builds and tests. If all tests pass, you are ready to create a MR.

### Commit Messages

The repo uses [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) to manage package changes. Commit messages determine the type of release on merge. [Commit Lint](https://commitlint.js.org/) will enforce and catch any formating issues in commits.

```shell
git commit -a -m "fix(core): disabled multi-select"
```

[Example Commit](https://github.com/NVIDIA/elements/-/commit/990d8f43a4a055c2f1ca1a6aa0af39f099d04649)

| Types   | Description                                                     |
| ------- | --------------------------------------------------------------- |
| `fix`   | bug fixes, performance fixes                                    |
| `feat`  | new features, components, APIs                                  |
| `chore` | non production code modifications, build tooling, documentation |

| Scopes                       | Description                   |
| ---------------------------- | ----------------------------- |
| `ci`                         | `/projects/internals`         |
| `starters`                   | `/projects/starters`          |
| `elements`                   | `/projects/elements`          |
| `elements-react`             | `/projects/elements-react`    |
| `pages`                      | `/projects/pages`             |
| `playground`                 | `/projects/playground`        |
| `testing`                    | `/projects/testing`           |
| `themes`                     | `/projects/themes`            |
| `monaco`                     | `/projects/monaco`            |
| `labs`                       | `/projects/labs`              |
| `labs-behaviors-alpine`      | `/labs/behaviors-alpine`      |
| `labs-playwright-screencast` | `/labs/playwright-screencast` |
| `labs-brand`                 | `/labs/brand`                 |
| `labs-code`                  | `/labs/code`                  |
| `labs-forms`                 | `/labs/forms`                 |

Keep commit names focused on the changes you are making as the commit message is what is used to determine the next release and generated changelog notes.

### Opening a Merge Request

Once you have commited your changes to your branch locally, push them to the remote Gitlab repository.

```bash
git push --set-upstream origin topic/bug-fix
```

Open a new [Merge Request](https://github.com/NVIDIA/elements/-/merge_requests) in GitLab. Request review from the team members and apply the appropriate labels it the GitLab UI for example, `type:fix` and `scope:elements`. View Gitlab updates in the [#elements-ci](https://nvidia.enterprise.slack.com/archives/C06QATGH15M) Slack Channel.

#### Amending Commit

**If there are changes requested**, make the requested changes locally and amend the commit.

```shell
git commit -a --amend --no-edit
```

This will add the changes to your existing commit. Then push the updated commit back to the remote branch for review.

```shell
git push --force origin topic/bug-fix
```

#### Rebasing Commit

Sometimes changes are merged to main before your MR is approved. To update your local branch to contain the latest changes from main you will need to rebase.

```shell
git checkout main # Switch to main branch
git pull # Pull down any new changes
git checkout topic/bug-fix # Switch back to your topic branch
git rebase main # Rebase your branch onto the latest main
```

You may have to resolve any merge conflicts that arise from this process. Once complete, push the updated branch back to the remote repository for review.

### New Project

When creating a new project, ex: `./projects/labs/code`, make sure to add the project to the `pnpm-workspace.yaml` located at the root directory.

### Release

Once your Merge Request is approved, you can merge it into `main` via the Gitlab UI. This will trigger a [new release](https://github.com/NVIDIA/elements/-/releases) of the package automatically. The version number will be bumped based on the type of commit (see above). The [changelog](https://NVIDIA.github.io/elements/docs/changelog/) will also be updated with the changes from the commits in the MR.
