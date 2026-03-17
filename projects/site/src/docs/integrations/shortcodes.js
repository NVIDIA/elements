import { svgLogoShortcode } from '../../_11ty/shortcodes/svg-logo.js';
import { siteData } from '../../index.11tydata.js';

export function renderInstallArtifactoryShortcode() {
  return /* html */ `
If not yet done, install [NodeJS](https://nodejs.org/en/download/). NodeJS is a JavaScript runtime that has a large ecosystem of tooling and packages for Web Development. Once installed the Node Package Manager (NPM) will be available for use.

\`\`\`shell
# login to artifactory (AVInfra monorepo users can skip this step)
npm config set registry https://registry.npmjs.org && npm login --auth-type=legacy
\`\`\`
`;
}

export function renderInstallCLIShortcode() {
  return /* html */ `
## Install CLI

Install the Elements CLI to your system. This will add the \`nve\` command to your path and provide several helpful commands for working with Elements.

<div id="install-cli-tab-group">
  <nve-tabs id="install-cli-tabs">
    <nve-tabs-item selected value="install-cli-macos">MacOS / Linux</nve-tabs-item>
    <nve-tabs-item value="install-cli-windows">Windows CMD</nve-tabs-item>
    <nve-tabs-item value="install-cli-nodejs">NodeJS</nve-tabs-item>
  </nve-tabs>
  <nve-divider></nve-divider>
  <br />

<div id="install-cli-macos" style="height: 65px">

\`\`\`shell
curl -fsSL https://NVIDIA.github.io/elements/install.sh | bash
\`\`\`

</div>

<div id="install-cli-windows" hidden style="height: 65px">

\`\`\`shell
curl -fsSL https://NVIDIA.github.io/elements/install.cmd -o install.cmd && install.cmd && del install.cmd
\`\`\`

</div>

<div id="install-cli-nodejs" hidden style="height: 130px">

\`\`\`shell
# login to artifactory (AVInfra monorepo users can skip this step)
npm config set registry https://registry.npmjs.org && npm login --auth-type=legacy

# install the CLI
npm install -g @nvidia-elements/cli
\`\`\`

</div>
</div>

<script type="module">
  (function() {
    const section = document.querySelector('#install-cli-tab-group');
    const tabItems = document.querySelectorAll('#install-cli-tabs nve-tabs-item');
    const panels = Array.from(document.querySelectorAll('#install-cli-tab-group > div'));

    const ua = navigator.userAgent;
    const os = ua.includes('Win') ? 'windows' : ua.includes('Mac') ? 'macos' : 'linux';
    const activeId = 'install-cli-' + os;

    tabItems.forEach(t => t.selected = t.value === activeId);
    panels.forEach(p => p.hidden = p.id !== activeId);

    section.addEventListener('click', e => {
      if (e.target.localName === 'nve-tabs-item') {
        tabItems.forEach(t => t.selected = false);
        panels.forEach(p => p.hidden = true);
        e.target.selected = true;
        document.querySelector('#' + e.target.value).hidden = false;
      }
    });
  })();
</script>
`;
}

export function renderInstallShortcode(starter) {
  const starterInstructions = `
## Create a New Project

Use the [Elements CLI](docs/cli/) to quickly bootstrap a new${starter ? ` ${starter} ` : ' '}project with the necessary dependencies:

\`\`\`shell
nve project.create ${starter ? `--type=${starter}` : ''}
\`\`\`
`;

  const setupInstructions = `
## Setup an Existing Project

Setup an existing project to use Elements you can use the setup command to add the necessary dependencies and configure the MCP server.

\`\`\`shell
nve project.setup
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
${renderInstallCLIShortcode()}
${starterInstructions}
${setupInstructions}
${renderInstallArtifactoryShortcode()}
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
