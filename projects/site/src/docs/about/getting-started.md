---
{
  title: 'Getting Started',
  layout: 'docs.11ty.js'
}
---

<p id="getting-started-img"></p>

<div nve-layout="column gap:lg">
  <div nve-layout="row gap:md align:vertical-center"><nve-logo></nve-logo><h1 nve-text="display sm">Elements</h1></div>
  <h3 nve-text="heading lg">The Design Language for AI/ML Factories Building at the Speed of Light</h3>
</div>

<nve-divider></nve-divider>

```shell
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install core dependencies
npm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
```

<div nve-layout="grid gap:lg span-items:4 align:stretch">

```css
/* CSS */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
```

```typescript
// JavaScript
import '@nvidia-elements/core/button/define.js';
```

```html
<!-- HTML-->
<nve-button>hello there</nve-button>
```

</div>

<nve-divider></nve-divider>

{% svg-logos %}

<section nve-layout="row gap:sm align:center">
  <nve-button>
    <a href="./docs/integrations/typescript/"><svg width="18" height="18"><use href="#typescript-svg"></use></svg> TypeScript</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/lit/"><svg width="20" height="20"><use href="#lit-svg"></use></svg> Lit</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/angular/"><svg width="20" height="20"><use href="#angular-svg"></use></svg> Angular</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/vue/"><svg width="20" height="20"><use href="#vue-svg"></use></svg> Vue</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/preact/"><svg width="20" height="20"><use href="#preact-svg"></use></svg> Preact</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/nextjs/"><svg width="20" height="20"><use href="#nextjs-svg"></use></svg> NextJS</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/react/"><svg width="20" height="20"><use href="#react-svg"></use></svg> React</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/solidjs/"><svg width="20" height="20"><use href="#solidjs-svg"></use></svg> SolidJS</a>
  </nve-button>
  <nve-button>
    <a href="./docs/about/installation/"><svg width="18" height="18"><use href="#javascript-svg"></use></svg> JavaScript</a>
  </nve-button>
</section>

<section nve-layout="row gap:sm align:center">
  <nve-button>
    <a href="./docs/about/installation/"><nve-icon name="gear"></nve-icon> Installation</a>
  </nve-button>
  <nve-button>
    <a href="./docs/about/getting-started/" target="_blank"><svg width="18" height="18"><use href="#storybook-svg"></use></svg> API Documentation</a>
  </nve-button>
  <nve-button>
    <a href="https://github.com/NVIDIA/elements" target="_blank"><svg width="18" height="18"><use href="#gitlab-svg"></use></svg> Gitlab Repo</a>
  </nve-button>
  <nve-button>
    <a href="http://nv/elements-slack" target="_blank"><svg width="18" height="18"><use href="#slack-icon-svg"></use></svg> Slack Support</a>
  </nve-button>
  <nve-button>
    <a href="http://nv/elements-figma" target="_blank"><svg width="18" height="18"><use href="#figma-svg"></use></svg> Figma Library</a>
  </nve-button>
  <nve-button>
    <a href="https://registry.npmjs.org" target="_blank"><nve-icon name="archive" style="--color: var(--nve-sys-accent-primary-background)"></nve-icon> NPM Package</a>
  </nve-button>
</section>
