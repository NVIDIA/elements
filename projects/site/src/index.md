---
{
  title: 'Getting Started',
  description: 'Get started with NVIDIA Elements: install Web Components, themes, and starter templates for building framework-agnostic UI for AI/ML factories.',
  layout: 'docs.11ty.js'
}
---

<div nve-layout="column gap:lg pad-top:lg">
  <h1 nve-text="display sm">Elements</h1>
  <h2 nve-text="heading">The Design Language for AI/ML Factories, Robotics, and Autonomous Vehicles</h2>
</div>

<nve-divider></nve-divider>

```shell
# install CLI
curl -fsSL {{ELEMENTS_PAGES_BASE_URL}}/install.sh | bash

# create a new project
nve project.create
```

<div nve-layout="grid gap:md span-items:12 @md|span-items:4">
<style>
  @scope {
    pre {
      display: block !important;
      height: 98px;
    }
    code > nve-codeblock {
      --padding: var(--nve-ref-space-lg) var(--nve-ref-space-xxl) var(--nve-ref-space-lg) var(--nve-ref-space-lg) !important;
    }
  }
</style>

```css
/* CSS */
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

<section nve-layout="row gap:sm align:center align:wrap pad-x:md">
  <nve-button>
    <a href="./docs/integrations/installation/"><nve-icon name="gear"></nve-icon> Installation</a>
  </nve-button>
  <nve-button>
    <a href="docs/mcp/"><svg width="18" height="18"><use href="#cursor-svg"></use></svg> Add to Cursor</a>
  </nve-button>
  <nve-button>
    <a href="docs/mcp/"><svg width="18" height="18"><use href="#codex-svg"></use></svg> Add to Codex</a>
  </nve-button>
  <nve-button>
    <a href="docs/mcp/"><svg width="18" height="18"><use href="#claude-svg"></use></svg> Add to Claude</a>
  </nve-button>
  <nve-button>
    <a href="{{ELEMENTS_REPO_BASE_URL}}" target="_blank"><nve-icon name="fork"></nve-icon> GitHub</a>
  </nve-button>
  <nve-button>
    <a href="https://registry.npmjs.org" target="_blank"><nve-icon name="archive" style="--color: var(--nve-sys-accent-primary-background)"></nve-icon> npm Package</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/typescript/"><svg width="18" height="18"><use href="#typescript-svg"></use></svg> TypeScript</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/installation/"><svg width="18" height="18"><use href="#javascript-svg"></use></svg> JavaScript</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/go/"><svg width="18" height="18"><use href="#go-svg"></use></svg> Golang</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/hugo/"><svg width="18" height="18"><use href="#hugo-svg"></use></svg> Hugo</a>
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
    <a href="./docs/integrations/svelte/"><svg width="20" height="20"><use href="#svelte-svg"></use></svg> Svelte</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/nuxt/"><svg width="20" height="20"><use href="#nuxt-svg"></use></svg> Nuxt</a>
  </nve-button>
</section>
