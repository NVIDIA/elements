import { svgLogoShortcode } from '../../_11ty/shortcodes/svg-logo.js';
import { siteData } from '../../index.11tydata.js';

export function renderInstallArtifactoryShortcode() {
  return /* html */ `
## Install

If not yet done, install [NodeJS](https://nodejs.org/en/download/). NodeJS is a JavaScript runtime that has a large ecosystem of tooling and packages for Web Development. Once installed the Node Package Manager (NPM) will be available for use.

<nve-alert status="warning">AVInfra monorepo users skip .npmrc setup/login and use pnpm to install base packages.</nve-alert>

\`\`\`shell
# login to artifactory
npm config set registry https://registry.npmjs.org && npm login --auth-type=legacy
\`\`\`
`;
}

export function renderInstallShortcode(starter) {
  const starterInstructions = `
## Create a New Project

Use the [Elements CLI](docs/cli/) to quickly bootstrap a new${starter ? ` ${starter} ` : ' '}project with the necessary dependencies:

\`\`\`shell
npm create @nve ${starter ? starter : ''}
\`\`\`

Optionally, install the Elements CLI globally then run the CLI:

\`\`\`shell
npm install -g @nvidia-elements/cli@latest

nve project.create ${starter ? `--type=${starter}` : ''}
\`\`\`
`;

  const dependencyInstructions = `
## Manual Integration

If installing to an existing project, install the core dependencies:

\`\`\`shell
# install core dependencies
npm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
\`\`\`  
`;

  return /* html */ `
${renderInstallArtifactoryShortcode()}
${starterInstructions}
${dependencyInstructions}
`;
}

export function renderIntegrationShortcode(integration) {
  const integrationData = siteData.integrations[integration] ?? {};

  return integrationData.logo
    ? /* html */ `
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
    ${svgLogoShortcode(integrationData.logo, '18')}
    <a target="_blank" href="${integrationData.starterSource}">Documentation</a>
  </nve-button>`
      : ''
  }
</div>
`
    : '';
}
