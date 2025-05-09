# Elements Styles

- [Documentation](https://NVIDIA.github.io/elements/)
- [Slack Support](https://nvidia.slack.com/archives/C03BDL2UCGK)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [Gitlab Repo](https://github.com/NVIDIA/elements)
- [Package Artifactory URM](https://registry.npmjs.org
- [Package Artifactory Maglev](ui/packages/npm:%2F%2F@nvidia-elements%2Fstyles)

Standalone CSS utilities for typography and layout.

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install core dependencies
npm install @nvidia-elements/styles
```

```css
/* import the global CSS into your project */
@import '@nvidia-elements/styles/dist/typography.css';
@import '@nvidia-elements/styles/dist/layout.css';
```

## Development

- `ci`: run full build/lint/test against final output
- `build`: run library build
