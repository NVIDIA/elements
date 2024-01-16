# Elements

## The Design Language for AI/ML Factories Building at the Speed of Light

[![pipeline status](https://github.com/NVIDIA/elements/badges/main/pipeline.svg)](https://github.com/NVIDIA/elements/-/commits/main) [![Latest Release](https://github.com/NVIDIA/elements/-/badges/release.svg)](https://github.com/NVIDIA/elements/-/releases) ![coverage](https://github.com/NVIDIA/elements/badges/main/coverage.svg?job=coverage)


- [Elements Storybook](https://NVIDIA.github.io/elements/)
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

Each project/demo has a set of available and standardized NPM scripts. To build all elements projects run `npm run ci` in the root of this directory. This will build/test all demos and packages.

- `ci`: run full build/lint/test
- `build`: run library build
- `dev`: run in watch mode
- `test`: run unit tests
- `test:watch`: run unit tests in watch mode
