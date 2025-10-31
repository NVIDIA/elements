# Metadata

The metadata scripts generate common metadata about projects in the repo. This information is then consumed in a variety of ways such as displaying information our [documentation](https://NVIDIA.github.io/elements/docs/metrics/) or reporting to [GitLab](https://github.com/NVIDIA/elements/-/graphs/main/charts).

## Generate Report Commands

## Tasks that run with each build
- `pnpm run generate:metadata`: runs metadata script gathering stability and API details of the packages.
- `pnpm run generate:tests`: runs the test metadata script gathering all the test results of the repo.
- `pnpm run generate:examples`: runs the examples metadata script gathering all the source examples from the packages.
- `pnpm run generate:wireit`: runs the wireit script that gathers all metadata details about the CI build and wireit dependencies.

## Tasks that must run manually

Due to some of the metadata reports being expensive to run some are source controlled via Git LFS.

- `pnpm run generate:releases`: runs the releases metadata script gathering all the package release information based on the git history.
- `pnpm run generate:lighthouse`: runs all lighthouse tests and generates the source controlled `/static/lighthouse.json` metadata.
- `pnpm run generate:downloads`: fetches download statistics for all configured packages (e.g., @nvidia-elements/core, @nvidia-elements/core-react) from multiple Artifactory instances and generates the source controlled `/static/downloads.json` metadata. Requires `URM_ARTIFACTORY_TOKEN` and `MAGLEV_ARTIFACTORY_TOKEN` environment variables to be set. Each package can be tracked across different instances and repositories.
- `pnpm run generate:usage`: fetches all known projects in Gitlab and AVInfra (elements) repos using elements then searches for any source code references. Requires `GITLAB_TOKEN` environment variable to be set. Warning: this is a very slow and intensive script. Monitor Gitlab request failures as we need to throttle usage.