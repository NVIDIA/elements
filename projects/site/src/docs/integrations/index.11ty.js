import { siteData } from '../../index.11tydata.js';

export const data = {
  title: 'Integrations',
  layout: 'docs.11ty.js'
};

const renderLogo = ({ icon, iconHeight, iconSize = '36px', iconWidth, nveIcon, title, color = 'gray-denim' }) => {
  if (icon) {
    return /* html */ `<nve-logo color="${color}" size="lg">
          <img src="/static/images/integrations/${icon}" width="${iconWidth ?? iconSize}" height="${iconHeight ?? iconSize}" alt="${title.toLowerCase()} logo" />
        </nve-logo>`;
  }

  return /* html */ `<nve-logo color="${color}" size="lg">
          <nve-icon name="${nveIcon}" aria-hidden="true"></nve-icon>
        </nve-logo>`;
};

const renderIntegration = integration => /* html */ `<a href="${integration.href}">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        ${renderLogo(integration)}
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">${integration.title}</h2>
          <p nve-text="body sm muted">${integration.description}</p>
        </div>
      </div>
    </nve-card>
  </a>`;

export function render(data) {
  return this.renderTemplate(
    /* html */ `
<style>
  .integrations-page {

    a:has(nve-card) {
      text-decoration: none;
      cursor: pointer;
    }

    a nve-card {
      cursor: pointer;
    }

    nve-card nve-logo {
      --border-radius: 0;
    }
  }
</style>

# ${data.title}

<h2 nve-text="heading sm muted">Use NVIDIA Elements across frameworks, runtimes, and Web Component tooling.</h2>

<div class="integrations-page" nve-layout="grid gap:md span-items:12 &md|span-items:6 &lg|span-items:4">
${Object.values(siteData.integrations).map(renderIntegration).join('\n')}
</div>`,
    'md'
  );
}
