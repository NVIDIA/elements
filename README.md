# Elements

The Design Language for AI/ML Factories Building at the Speed of Light

- [Elements Documentation](https://NVIDIA.github.io/elements/)

## Requests and Contributions

- [Contribution Guidelines](https://NVIDIA.github.io/elements/docs/about/contributions/)
- [Feature request](https://github.com/NVIDIA/elements/issues/new?issuable_template=feature)
- [Bug report](https://github.com/NVIDIA/elements/issues/new?issuable_template=default)

## Organization

The repository is organized as a top-level **overall** repository and, inside that, libraries are broken up into individual **project** directories.

Project directories have their own `package.json` and commands. But all setup for the CI and development needs to happen at the root **repository** level.

Examples of projects include:

- `/projects/starters` - Suite of standardized starter apps for Elements and Patterns
- `/projects/core` - Elements library: curated UI maintained by the Elements team
- `/projects/themes` - Elements Theme library: provides a set of supported themes for Element based projects
- `/projects/styles` - Elements Styles library: provides a set of CSS utilities for layout and typography

## Development

### Setup

To setup repository dependencies and run the full build, run the following commands at the **root** of the repository:

```shell
# install required dependencies
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install
npm install -g corepack@0.34.5
corepack enable
corepack prepare --activate
pnpm i --frozen-lockfile --prefer-offline
```

```shell
# run ci pipeline locally (lint, build, test)
pnpm run ci
```

#### Troubleshooting

If you are coming from development from a different repository, you may need to install a new version of node in `nvm`. If you see an error message to this effect, [refer to the nvm docs](https://github.com/nvm-sh/nvm?tab=readme-ov-file#usage) for installing the missing node version and for directions on switching between versions of `node` using `nvm`. Once `nvm` is installed you can switch to the repository defined node and pnpm versions by re-running the [setup/install step](#setup) above.

If you actively work/switch between different repositories run `nvm use && corepack prepare --activate` in the root of the project to ensure use of the correct node/pnpm version.

### Building

Both the top-level repository and each project has a set of standardized npm scripts. To build and test all projects run `pnpm run ci` at the root of repository.

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

To learn in detail how the repo is built and run see our [build README.md](https://github.com/NVIDIA/elements/blob/main/build/README.md).

## Workflow

Before creating a branch or pull request be sure to make a [new issue or feature request](https://github.com/NVIDIA/elements/issues/new) first for the team to evaluate. This will help ensure that your work aligns with the goals of the project and that you are not duplicating effort.

### Create a Branch

Use a descriptive branch name with a prefix. Example `feature/bug-fix`.

```shell
git checkout -b topic/bug-fix
```

Once your branch is created, make your source code changes. Once your changes are complete run `pnpm run ci` in the root of the repo to run all the builds and tests. If all tests pass, you are ready to create a PR.

### Commit Messages

The repo uses [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) to manage package changes. Commit messages determine the type of release on merge. [Commit Lint](https://commitlint.js.org/) will enforce and catch any formatting issues in commits.

```shell
git commit -a -m "fix(elements): disabled multi-select"
```

[Example Commit](https://github.com/NVIDIA/elements/commit/990d8f43a4a055c2f1ca1a6aa0af39f099d04649)

| Types   | Description                                                     |
| ------- | --------------------------------------------------------------- |
| `fix`   | bug fixes, performance fixes                                    |
| `feat`  | new features, components, APIs                                  |
| `chore` | non production code modifications, build tooling, documentation |

| Scopes                       | Description                   |
| ---------------------------- | ----------------------------- |
| `ci`                         | `/projects/internals`         |
| `starters`                   | `/projects/starters`          |
| `elements`                   | `/projects/core`          |
| `themes`                     | `/projects/themes`            |
| `monaco`                     | `/projects/monaco`            |
| `labs-cli`                   | `/cli`                        |
| `labs-code`                  | `/code`                       |
| `forms`                      | `/projects/forms`             |

Keep commit names focused on the changes you are making as the commit message is what is used to determine the next release and generated changelog notes.

### Opening a Pull Request

Once you have committed your changes to your branch locally, push them to the remote GitHub repository.

```bash
git push --set-upstream origin topic/bug-fix
```

Open a new [Pull Request](https://github.com/NVIDIA/elements/pulls) in GitHub. Request review from the team members and apply the appropriate labels it the GitHub UI for example, `type:fix` and `scope:elements`.

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

Sometimes changes are merged to main before your PR is approved. To update your local branch to contain the latest changes from main you will need to rebase.

```shell
git checkout main # Switch to main branch
git pull # Pull down any new changes
git checkout topic/bug-fix # Switch back to your topic branch
git rebase main # Rebase your branch onto the latest main
```

You may have to resolve any merge conflicts that arise from this process. Once complete, push the updated branch back to the remote repository for review.

### New Project

When creating a new project, ex: `./projects/code`, make sure to add the project to the `pnpm-workspace.yaml` located at the root directory.

### Release

Once your Pull Request is approved, you can merge it into `main` via the GitHub UI. This will trigger a [new release](https://github.com/NVIDIA/elements/releases) of the package automatically. The version number will be bumped based on the type of commit (see above). The [changelog](https://NVIDIA.github.io/elements/docs/changelog/) will also be updated with the changes from the commits in the PR.
