# Elements

The Design Language for AI/ML Factories Building at the Speed of Light

[![Latest Release](https://github.com/NVIDIA/elements/-/badges/release.svg)](https://github.com/NVIDIA/elements/-/releases)
[![pipeline status](https://github.com/NVIDIA/elements/badges/main/pipeline.svg)](https://github.com/NVIDIA/elements/-/commits/main)
[![coverage](https://github.com/NVIDIA/elements/badges/main/coverage.svg?min_good=90)](https://github.com/NVIDIA/elements/-/graphs/main/charts)

- [Elements Storybook](https://NVIDIA.github.io/elements/api/)
- [Elements Playground](http://nv/elements-playground)
- [Elements Figma](http://nv/elements-figma)

## Requests and Contributions

- [Contribution Guidelines](https://NVIDIA.github.io/elements/api/?path=/docs/about-contributions--docs)
- [Feature request](https://github.com/NVIDIA/elements/-/issues/new?issuable_template=feature)
- [Bug report](https://github.com/NVIDIA/elements/-/issues/new?issuable_template=default)

## Projects

- `/projects/demos` - Suite of standardized demo apps for Elements and Patterns
- `/projects/elements` - Elements library: curated UI maintained by the Elements team
- `/projects/elements-react` - Elements React library for React compatibility/support
- `/projects/testing` - A set of testing utilities for Lit based Web Components.

## Development

### Setup

To setup repository dependencies and run the full build, run the following commands:

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
. ~/.nvm/nvm.sh
nvm install
corepack enable
corepack prepare --activate
pnpm i
pnpm run ci
```

### Building

Each project/demo has a set of available and standardized NPM scripts. To build and test all projects run `pnpm run ci` in the root of this directory.

- `ci`: run full build/lint/test
- `build`: run library build
- `dev`: run in watch mode
- `test`: run unit tests
- `test:watch`: run unit tests in watch mode

To learn in detail how the repo is built and run see our [build README.md](https://github.com/NVIDIA/elements/-/blob/main/build/README.md).

### Branching

The Gitlab repo enforces branches to use the `topic/` prefix for branches to be merged. Example `topic/my-bug-fix`. Once a MR is merged the topic branch will automatically be deleted from the remote repo on Gitlab.

### Commit Messages

The repo uses [Semantic Release](https://semantic-release.gitbook.io/semantic-release/) to manage package changes. Commit messages determine the type of release on merge. [Commit Lint](https://commitlint.js.org/) will enforce and catch any formating issues in commits.

```
fix(elements): disabled multi-select
```

[Example Commit](https://github.com/NVIDIA/elements/-/commit/990d8f43a4a055c2f1ca1a6aa0af39f099d04649)

| Types   | Description                                                     |
| ------- | --------------------------------------------------------------- |
| `fix`   | bug fixes, performance fixes                                    |
| `feat`  | new features, components, APIs                                  |
| `chore` | non production code modifications, build tooling, internal docs |

| Scopes           | Description                |
| ---------------- | -------------------------- |
| `demos`          | `/projects/demos`          |
| `elements`       | `/projects/elements`       |
| `elements-react` | `/projects/elements-react` |
| `labs`           | `/labs`                    |
| `pages`          | `/pages`                   |
| `playground`     | `/playground`              |
| `testing`        | `/testing`                 |
