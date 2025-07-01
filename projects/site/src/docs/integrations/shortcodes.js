import { svgLogosShortcode } from '../../_11ty/shortcodes/svg-logos.js';
import docsData from '../docs.11tydata.js';

export function renderInstallationShortcode() {
  return /* html */ `

## NPM/Artifactory

<nve-alert status="warning">AVInfra monorepo users skip .npmrc setup/login and use pnpm to install base packages.</nve-alert>

Create/add the following references to a \`.npmrc\` file in the root of your project where your \`package.json\` is located.

\`\`\`shell
registry=https://registry.npmjs.org
\`\`\`

Login to [Artifactory](https://registry.npmjs.org once logged in run the following:

\`\`\`shell
# login to artifactory
npm login

# install base packages
npm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
\`\`\`
`;
}

export function renderIntegrationShortcode(integration) {
  const integrationData = docsData().integrations[integration] ?? {};

  return integrationData.logo
    ? /* html */ `
${svgLogosShortcode(integrationData.logo)}

<div nve-layout="row gap:xs">
  ${
    integrationData.playgroundURL
      ? /* html */ `<nve-button>
    <nve-icon name="beaker" size="sm"></nve-icon>
    <a target="_blank" href="${integrationData.playgroundURL}">Playground</a>
  </nve-button>`
      : ''
  }

  ${
    integrationData.starterDemo
      ? /* html */ `
  <nve-button>
    <nve-icon name="browser"></nve-icon>
    <a target="_blank" href="${integrationData.starterDemo}"> Demo</a>
  </nve-button>`
      : ''
  }

  ${
    integrationData.starterDownload
      ? /* html */ `
  <nve-button>
    <nve-icon name="download" size="sm"></nve-icon>
    <a target="_blank" href="${integrationData.starterDownload}">Download</a>
  </nve-button>`
      : ''
  }

  ${
    integrationData.starterSource
      ? /* html */ `
  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a target="_blank" href="${integrationData.starterSource}">Source</a>
  </nve-button>`
      : ''
  }

  ${
    integrationData.documentation
      ? /* html */ `
  <nve-button>
    <svg width="18" height="18"><use href="#${integrationData.logo}-svg"></use></svg>
    <a target="_blank" href="${integrationData.starterSource}">Documentation</a>
  </nve-button>`
      : ''
  }
</div>
`
    : '';
}
