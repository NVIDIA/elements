# Publishing

1. Update Version following semver versioning:

    ```json
    {
      "name": "@elements/elements",
      "version": "0.16.0",
      ...
    }
    ```

2. Upate the changelog in storybook to reflect the latest version and release notes. `docs/changelog.stories.mdx`

3. Update metrics metadata.

    ```bash
    pnpm run metrics
    ```

4. Open a release MR for review and merge. Example: https://git-av.nvidia.com/r/c/elements/+/182070

5. Run full CI build.

    ```bash
    pnpm ci:nocache
    ```

6. Validate expected artifacts in `/dist` folder, then run a dry publish and validate contents and package size that will be uploaded to artifactory:

    ```bash
    pnpm publish --dry-run
    ```

7. Publish to URM

    ```bash
    pnpm login --scope=@elements --registry=https://registry.npmjs.org
    ```

    ```bash
    pnpm publish --registry https://registry.npmjs.org
    ```

8. Publish to Maglev

    ```shell
    pnpm login --scope=@elements --registry=https://artifactory.build.nvidia.com/artifactory/api/npm/elements-ui-npm/
    ```

    ```bash
    pnpm publish --registry https://artifactory.build.nvidia.com/artifactory/api/npm/elements-ui-npm/
    ```

9. Deploy documentation after release. Navigate to https://prod.blsm.nvidia.com/elements-sre-deployments/job/release/job/deploy/build

    - Set `"Deploy to"` select input to `"sjc4-prod"`
  
    - Set `"Deploy apps"` text input to `"elements-ui-storybook-elements"`

    - Set `"Deploy action"` select input to `"sync"`

    - Click `"Build"` button

    - Once completed, check https://elements.nvidia.com/ui/storybook/elements?path=/docs/about-changelog--docs to see if changelog has been updated.
