import { svgLogosShortcode } from '../../_11ty/shortcodes/svg-logos.js';
import { siteData } from '../../index.11tydata.js';

export function renderInstallArtifactoryShortcode() {
  return /* html */ `
## Install

If not yet done, install [NodeJS](https://nodejs.org/en/download/). NodeJS is a JavaScript runtime that has a large ecosystem of tooling and packages for Web Development. Once installed the Node Package Manager (NPM) will be available for use.

<nve-alert status="warning">AVInfra monorepo users skip .npmrc setup/login and use pnpm to install base packages.</nve-alert>

\`\`\`shell
# setup artifactory registry
npm config set registry https://registry.npmjs.org

# https://registry.npmjs.org
npm login
\`\`\`
`;
}

export function renderInstallShortcode() {
  return /* html */ `
${renderInstallArtifactoryShortcode()}

Once the registry is setup and authenticated, install the core dependencies:

\`\`\`shell
# install core dependencies
npm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
\`\`\`  
`;
}

export function renderIntegrationShortcode(integration) {
  const integrationData = siteData.integrations[integration] ?? {};

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
