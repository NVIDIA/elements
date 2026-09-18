# Coverage reporting

The `coverage` task merges the Istanbul output from each package that runs `test:coverage`. It writes one XML coverage report to `coverage/cobertura.xml` for GitHub Code Quality.

The GitHub Actions workflow uploads coverage for pushes to `main` and for pull requests from branches in this repository. GitHub does not support coverage uploads from fork pull requests.

Enable GitHub Code Quality before running the upload workflow. After the first successful upload to `main`, configure the default branch ruleset to require at least 95% line coverage and allow a maximum decrease of 0.25 percentage points.
