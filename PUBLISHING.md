# Publishing

1. Update changelog `/elements/docs/changelog.stories.mdx`

2. Update pacakge version in root `elements-workspace` following semver
```json
{
  "name": "elements-workspace",
  "version": "0.21.0",
  ...
}
```

3. Validate expected artifacts
```bash
pnpm publish:dryrun
```

5. Login and publish URM
```bash
pnpm run login

pnpm run publish
```

6. Login and publish Maglev
```bash
pnpm run login:elements

pnpm run publish
```

4. Open a release MR for review and merge. Example: https://git-av.nvidia.com/r/c/elements/+/182070

5. Deploy documentation after release. https://prod.blsm.nvidia.com/elements-sre-deployments/job/release/job/deploy/build

  - Set `"Deploy to"` select input to `"sjc4-prod"`

  - Set `"Deploy apps"` text input to `"elements-ui-storybook-elements"`

  - Set `"Deploy action"` select input to `"sync"`

  - Click `"Build"` button

  - Verify Changelog https://elements.nvidia.com/ui/storybook/elements
