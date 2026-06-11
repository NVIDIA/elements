export const data = {
  title: 'Integrations',
  layout: 'docs.11ty.js'
};

const integrations = [
  {
    href: 'docs/integrations/angular/',
    icon: 'angular.svg',
    title: 'Angular',
    description: 'Use Elements with Angular templates and events.'
  },
  {
    href: 'docs/integrations/bundles/',
    icon: 'javascript.svg',
    title: 'Bundles',
    description: 'Load prebuilt Elements bundles in static pages.'
  },
  {
    href: 'docs/integrations/cdn/',
    nveIcon: 'globe-alt-stroke',
    title: 'CDN',
    description: 'Load Elements from CDN-hosted npm packages.'
  },
  {
    href: 'docs/integrations/custom-elements/',
    nveIcon: 'code',
    title: 'Custom Elements',
    description: 'Use Elements package metadata with Web Component tooling.'
  },
  {
    href: 'docs/integrations/go/',
    icon: 'go.svg',
    iconSize: '48px',
    title: 'Golang',
    description: 'Use Elements with Go-backed web applications.'
  },
  {
    href: 'docs/integrations/hugo/',
    icon: 'hugo.svg',
    iconSize: '28px',
    title: 'Hugo',
    description: 'Use Elements in Hugo static sites.'
  },
  {
    href: 'docs/integrations/importmaps/',
    icon: 'javascript.svg',
    title: 'Import Maps',
    description: 'Load Elements from browser-native import maps.'
  },
  {
    href: 'docs/integrations/lit/',
    icon: 'lit.svg',
    title: 'Lit',
    description: 'Use Elements alongside Lit components and SSR.'
  },
  {
    href: 'docs/integrations/lit-library/',
    icon: 'lit.svg',
    title: 'Lit Library',
    description: 'Build a distributable Custom Element library with Lit and Elements.'
  },
  {
    href: 'docs/integrations/mcp-apps/',
    nveIcon: 'connected-blocks',
    title: 'MCP Apps',
    description: 'Use Elements in iframe-based MCP UI hosts.'
  },
  {
    href: 'docs/integrations/nextjs/',
    icon: 'nextjs.svg',
    iconSize: '28px',
    title: 'NextJS',
    description: 'Use Elements with NextJS and React.'
  },
  {
    href: 'docs/integrations/nuxt/',
    icon: 'nuxt.svg',
    iconSize: '38px',
    title: 'Nuxt',
    description: 'Use Elements with Nuxt applications.'
  },
  {
    href: 'docs/integrations/preact/',
    icon: 'preact.svg',
    title: 'Preact',
    description: 'Use Elements with Preact JSX and custom events.'
  },
  {
    href: 'docs/integrations/react/',
    icon: 'react.svg',
    title: 'React',
    description: 'Use Elements with React and native custom events.'
  },
  {
    href: 'docs/integrations/solidjs/',
    icon: 'solidjs.svg',
    title: 'SolidJS',
    description: 'Use Elements with SolidJS and Vite.'
  },
  {
    href: 'docs/integrations/svelte/',
    icon: 'svelte.svg',
    title: 'Svelte',
    description: 'Use Elements with Svelte and Vite.'
  },
  {
    href: 'docs/integrations/typescript/',
    icon: 'typescript.svg',
    title: 'TypeScript',
    description: 'Use Elements with TypeScript and Vite.'
  },
  {
    href: 'docs/integrations/vue/',
    icon: 'vue.svg',
    title: 'Vue',
    description: 'Use Elements with Vue and Vite.'
  }
];

const renderLogo = ({ icon, iconSize = '36px', nveIcon, title, color = 'gray-denim' }) => {
  if (icon) {
    return /* html */ `<nve-logo color="${color}" size="lg">
          <img src="/static/images/integrations/${icon}" width="${iconSize}" height="${iconSize}" alt="${title.toLowerCase()} logo" />
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
${integrations.map(renderIntegration).join('\n')}
</div>`,
    'md'
  );
}
