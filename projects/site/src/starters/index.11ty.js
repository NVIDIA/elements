import { ELEMENTS_REPO_BASE_URL } from '../_11ty/utils/env.js';

export const data = {
  title: 'Starters',
  layout: 'docs.11ty.js'
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
<style>
  .starters-page {

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

<div class="starters-page" nve-layout="grid gap:md span-items:12 &md|span-items:6 &lg|span-items:4">
  <a href="starters/typescript/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/typescript.svg" width="36px" height="36px" alt="typescript logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">TypeScript</h2>
          <p nve-text="body sm muted">Starter leveraging TypeScript and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/mpa/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/vite.svg" width="36px" height="36px" alt="vite logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Multi Page Application</h2>
          <p nve-text="body sm muted">Starter leveraging MPA and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/bundles/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/javascript.svg" width="36px" height="36px" alt="javascript logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Bundles</h2>
          <p nve-text="body sm muted">Starter using static pre built bundles.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/eleventy/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/eleventy.svg" width="48px" height="48px" alt="eleventy logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Eleventy</h2>
          <p nve-text="body sm muted">Starter leveraging Eleventy and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/angular/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/angular.svg" width="36px" height="36px" alt="angular logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Angular</h2>
          <p nve-text="body sm muted">Single Page Application Framework.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/vue/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/vue.svg" width="36px" height="36px" alt="vue logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Vue</h2>
          <p nve-text="body sm muted">Starter leveraging Vue and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/solidjs/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/solidjs.svg" width="36px" height="36px" alt="solidjs logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">SolidJS</h2>
          <p nve-text="body sm muted">Starter leveraging SolidJS and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/svelte/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/svelte.svg" width="36px" height="36px" alt="svelte logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Svelte</h2>
          <p nve-text="body sm muted">Starter leveraging Svelte and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/react/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/react.svg" width="36px" height="36px" alt="react logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">React</h2>
          <p nve-text="body sm muted">Starter leveraging React (v19) and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/nextjs">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/nextjs.svg" width="28px" height="28px" alt="react logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">NextJS</h2>
          <p nve-text="body sm muted">Starter leveraging NextJS (v15) and React (v19).</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/importmaps/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/javascript.svg" width="36px" height="36px" alt="javascript logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Import Maps</h2>
          <p nve-text="body sm muted">Starter leveraging import maps and ESM.sh</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/go">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/go.svg" width="48px" height="48px" alt="go logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Go</h2>
          <p nve-text="body sm muted">Starter leveraging Go.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/hugo">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/hugo.svg" width="28px" height="28px" alt="hugo logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Hugo</h2>
          <p nve-text="body sm muted">Starter leveraging Hugo.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="${ELEMENTS_REPO_BASE_URL}/-/tree/main/projects/starters/nuxt">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/nuxt.svg" width="38px" height="38px" alt="nuxt logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Nuxt</h2>
          <p nve-text="body sm muted">Starter leveraging Nuxt.</p>
        </div>
      </div>
    </nve-card>
  </a>
</div>`,
    'md'
  );
}
