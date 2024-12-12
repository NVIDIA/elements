# Metadata

The metadata scripts generate common metadata about projects in the repo. This information is then consumed in a variety of ways such as displaying information in [Storybook](https://NVIDIA.github.io/elements/api/?path=/docs/about-metrics--docs) or reporting to [GitLab](https://github.com/NVIDIA/elements/-/graphs/main/charts).

## Commands

- `pnpm run ci`: runs the metadata script, runs and gathers all project metadata, test results and code coverage to generate a single JSON report
- `pnpm run build:lighthouse`: runs all lighthouse tests and generates the source controlled `/static/lighthouse.json` metadata.
- `pnpm run build:elements`: generates the source controlled `/static/elements.json` metadata. This file reports elements usage within the elements repo. This script asumes the path to the elements repo is cloned as a sibling relative to this repo.
