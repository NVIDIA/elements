# Elements

## The Design Language for AI/ML Factories Building at the Speed of Light

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
