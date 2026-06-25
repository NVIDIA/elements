# NVIDIA Elements

NVIDIA Design System and UI Agent Harness for AI/ML Factories, Robotics, and Autonomous Vehicles.

- **Agent-ready tooling:** CLI and MCP expose component APIs, tokens, examples, imports, validation, and setup to terminals and AI assistants.
- **Framework agnostic:** Web Components run in React, Angular, Vue, Svelte, Lit, plain HTML, server-rendered templates, and mixed stacks.
- **Built for AI infrastructure:** Operational UI for AI/ML workloads, autonomous vehicle tools, and robotics consoles.
- **Stable API contracts:** Skills and lint guide authoring best practices, common UI patterns, and automated static analysis.

## Requests and Contributions

- [NVIDIA Elements Documentation](https://NVIDIA.github.io/elements/)
- [Contribution Guidelines](https://NVIDIA.github.io/elements/docs/about/contributions/)
- [Feature request](https://github.com/NVIDIA/elements/issues/new?issuable_template=feature)
- [Bug report](https://github.com/NVIDIA/elements/issues/new?issuable_template=default)

## Organization

The repository uses a top-level **repository** with individual **project** directories.

Project directories have their own `package.json` and commands. Run CI and development setup at the root **repository** level.

Examples of projects include:

- `/projects/starters` - Suite of standardized starter apps for Elements and Patterns
- `/projects/core` - Elements library: curated UI maintained by the Elements team
- `/projects/themes` - Elements Theme library: provides a set of supported themes for Element based projects
- `/projects/styles` - Elements Styles library: provides a set of CSS utilities for layout and typography

## Development

### Setup

To set up repository dependencies and run the full build, run the following commands at the **root** of the repository:

The CI pipeline also builds Go starters. Install [Go 1.26.x](https://go.dev/doc/install) before running the full local CI pipeline.

```shell
# install dependencies https://mise.en.dev/getting-started.html
curl https://mise.run | sh
~/.local/bin/mise run setup
```

#### Troubleshooting

If you are coming from development from a different repository, you may need to refresh the repository toolchain with mise. Run `mise run install` at the root of the project to install the Node.js, pnpm, Vale, Go, Git LFS, and package versions from `mise.toml` and `pnpm-lock.yaml`.

If you actively switch between different repositories, run commands through `mise exec --` or activate mise in your shell so it switches tools automatically.

### Building

Both the top-level repository and each project have a set of standardized npm scripts. To build and test all projects, run `mise exec -- pnpm run ci` at the root of the repository.

#### Top-Level Repository

- `ci`: run full build/lint/test
- `ci:all`: entire CI process: build, lint, unit/lighthouse/visual tests
- `ci:reset`: clear all caches/dependencies then reinstall dependencies

#### Individual Projects

Common project scripts include:

- `dev`: run in watch mode
- `build`: run project/library build
- `test`: run unit tests
- `test:lighthouse`: run lighthouse performance tests
- `test:visual`: run playwright visual regression tests
- `test:axe`: run axe tests for a11y

The available scripts vary by project. Check the project's `package.json` before running project-specific commands.

For details about the repository build and runtime flow, see the [build system documentation](https://github.com/NVIDIA/elements/blob/main/projects/internals/BUILD.md).

## Workflow

Before creating a branch or pull request, make a [new issue or feature request](https://github.com/NVIDIA/elements/issues/new) first so the team can check alignment and avoid duplicate work.

### Create a Branch

Use a descriptive branch name with the `topic/` prefix. Example `topic/bug-fix`.

```shell
git checkout -b topic/bug-fix
```

After creating your branch, make your source code changes. After you complete them, run `mise exec -- pnpm run ci` in the root of the repo to run all the builds and tests. If all tests pass, you are ready to create a PR.

### Commit Messages

The repo uses [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) to manage package changes. Commit messages determine the release on merge. [Commit Lint](https://commitlint.js.org/) enforces commit formatting.

```shell
git commit -a -s -m "fix(core): disable multi-select"
```

[Example Commit](https://github.com/NVIDIA/elements/commit/990d8f43a4a055c2f1ca1a6aa0af39f099d04649)

| Types   | Description                                                     |
| ------- | --------------------------------------------------------------- |
| `fix`   | bug fixes, performance fixes                                    |
| `feat`  | new features, components, APIs                                  |
| `chore` | non production code modifications, build tooling, documentation |

| Scopes      | Description                    |
| ----------- | ------------------------------ |
| `ci`        | CI and release automation      |
| `cli`       | `/projects/cli`                |
| `code`      | `/projects/code`               |
| `core`      | `/projects/core`               |
| `create`    | `/projects/create`             |
| `deps`      | dependency updates             |
| `docs`      | documentation and site content |
| `forms`     | `/projects/forms`              |
| `internals` | `/projects/internals`          |
| `lint`      | `/projects/lint`               |
| `markdown`  | `/projects/markdown`           |
| `media`     | `/projects/media`              |
| `monaco`    | `/projects/monaco`             |
| `pages`     | `/projects/pages`              |
| `starters`  | `/projects/starters`           |
| `styles`    | `/projects/styles`             |
| `themes`    | `/projects/themes`             |

Keep commit names focused on your changes. The release process uses the commit message to determine the next release and generated changelog notes.

### Opening a Pull Request

Once you have committed your changes to your branch locally, push them to the remote GitHub repository.

```bash
git push --set-upstream origin topic/bug-fix
```

Open a new [Pull Request](https://github.com/NVIDIA/elements/pulls) in GitHub. Request review from the team members and apply the appropriate labels in the GitHub UI, for example, `type:fix` and `scope(core)`.

#### Amending Commit

**If there are changes requested**, make the requested changes locally and amend the commit.

```shell
git commit -a --amend --no-edit
```

This adds the changes to your existing commit. Then push the updated commit back to the remote branch for review.

```shell
git push --force origin topic/bug-fix
```

#### Rebasing Commit

If main changes before PR approval, rebase your local branch to include the latest changes from main.

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

After approval, merge your Pull Request into `main` through the GitHub UI. GitHub Actions triggers a [new release](https://github.com/NVIDIA/elements/releases) automatically. Semantic Release calculates the version from the commit type. The [changelog](https://NVIDIA.github.io/elements/docs/changelog/) also includes the commits from the PR.
