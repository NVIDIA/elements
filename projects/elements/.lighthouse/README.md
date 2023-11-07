# Lighthouse

This directory contains the tests for running Lighthouse audits on all components. This will run a series of Accessibility, Performance and Best Practice tests against each component in isolation. Due to the isolation required for the tests the entire suite can take between 5-10 mins to run.

To run the suite in the root of `/elements` run the command `pnpm run test:lighthouse`. A final JSON report will be created in `.lighthouse/dist/report.json` which is used in storybook. Each component will have a isolated build output and `report.html` that can be viewed for additional details.