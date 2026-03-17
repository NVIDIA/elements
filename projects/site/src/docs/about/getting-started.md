---
{
  title: 'Getting Started',
  layout: 'docs.11ty.js'
}
---

<p id="getting-started-img"></p>

<div nve-layout="column gap:lg">
  <div nve-layout="row gap:md align:vertical-center"><nve-logo></nve-logo><h1 nve-text="display sm">Elements</h1></div>
  <h2 nve-text="heading lg">The Design Language for AI/ML Factories Building at the Speed of Light</h2>
</div>

<nve-divider></nve-divider>

```shell
# install CLI
curl -fsSL https://NVIDIA.github.io/elements/install.sh | bash

# create a new project
nve project.create
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

<section nve-layout="row gap:sm align:center align:wrap pad-x:lg">
  <nve-button>
    <a href="./docs/integrations/installation/"><nve-icon name="gear"></nve-icon> Installation</a>
  </nve-button>
  <nve-button>
    <a href="cursor://anysphere.cursor-deeplink/mcp/install?name=elements&config=eyJkZXNjcmlwdGlvbiI6IkVsZW1lbnRzIEFQSSBhbmQgQ3VzdG9tIEVsZW1lbnQgU2NoZW1hIiwiZW52Ijp7Im5wbV9jb25maWdfcmVnaXN0cnkiOiJodHRwczovL3VybS5udmlkaWEuY29tL2FydGlmYWN0b3J5L2FwaS9ucG0vc3ctbmdjLXVuaWZpZWQtbnBtLXByb3h5LyJ9LCJjb21tYW5kIjoibnBtIGV4ZWMgLS1wYWNrYWdlPUBudmUtbGFicy9jbGlAbGF0ZXN0IC15IC0tcHJlZmVyLW9ubGluZSAtLSBudmUtbWNwIn0%3D"><svg width="18" height="18"><use href="#cursor-svg"></use></svg> Add to Cursor</a>
  </nve-button>
  <nve-button>
    <a href="docs/mcp/"><svg width="18" height="18"><use href="#claude-svg"></use></svg> Add to Claude</a>
  </nve-button>
  <nve-button>
    <a href="https://github.com/NVIDIA/elements" target="_blank"><svg width="18" height="18"><use href="#gitlab-svg"></use></svg> Gitlab Repo</a>
  </nve-button>
  <nve-button>
    <a href="http://nv/elements-slack" target="_blank"><svg width="18" height="18"><use href="#slack-svg"></use></svg> Slack Support</a>
  </nve-button>
  <nve-button>
    <a href="http://nv/elements-figma" target="_blank"><svg width="18" height="18"><use href="#figma-svg"></use></svg> Figma Library</a>
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
    <a href="./docs/integrations/go/"><svg width="18" height="18"><use href="#go-svg"></use></svg> Go</a>
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
