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

<div class="starters-page" nve-layout="grid gap:md span-items:12 span-items@md:6 span-items@lg:4">
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
  <a href="starters/react/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/react.svg" width="36px" height="36px" alt="react logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">React</h2>
          <p nve-text="body sm muted">Starter leveraging React and Vite.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/remix">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/remix.svg" width="24px" height="24px" alt="remix logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Remix</h2>
          <p nve-text="body sm muted">Starter leveraging Remix and React 19.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/nextjs">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/nextjs.svg" width="28px" height="28px" alt="react logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">NextJS</h2>
          <p nve-text="body sm muted">Starter leveraging NextJS and React 19.</p>
        </div>
      </div>
    </nve-card>
  </a>
  <a href="starters/buildless/">
    <nve-card>
      <div nve-layout="row gap:sm align:vertical-center">
        <nve-logo color="gray-denim" size="lg">
          <img src="/static/images/integrations/javascript.svg" width="36px" height="36px" alt="javascript logo" />
        </nve-logo>
        <div nve-layout="column pad:xs gap:xs">
          <h2 nve-text="label medium">Buildless</h2>
          <p nve-text="body sm muted">Starter leveraging standard JavaScript via a CDN.</p>
        </div>
      </div>
    </nve-card>
  </a>
</div>`,
    'md'
  );
}
