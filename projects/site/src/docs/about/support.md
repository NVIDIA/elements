---
{
  title: 'Support',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Libraries and Community

Reach out to our slack support chanel or find additional resources in our Figma libraries.

<section nve-layout="row gap:sm pad-bottom:lg">
  <nve-button>
    <a href="http://nv/elements-slack" target="_blank"><svg width="18" height="18"><use href="#slack-icon-svg"></use></svg> Slack Support</a>
  </nve-button>
  <nve-button>
    <a href="https://github.com/NVIDIA/elements" target="_blank"><svg width="18" height="18"><use href="#gitlab-svg"></use></svg> Gitlab</a>
  </nve-button>
  <nve-button>
    <a href="http://nv/elements-figma" target="_blank"><svg width="18" height="18"><use href="#figma-svg"></use></svg> Figma Library</a>
  </nve-button>
  <nve-button>
    <a href="https://registry.npmjs.org" target="_blank"><nve-icon name="archive" style="--color: var(--nve-sys-accent-primary-background)"></nve-icon> NPM Package</a>
  </nve-button>
</section>

## Frameworks

Elements [supports a wide variety](https://custom-elements-everywhere.com) of JavaScript frameworks and libraries as well as vanilla JS. Read more at our [installation](/docs/about/installation/) page.

<section nve-layout="row gap:sm pad-bottom:lg">
  <nve-button>
    <a href="/docs/integrations/typescript/"><svg width="18" height="18"><use href="#typescript-svg"></use></svg> TypeScript</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/lit/"><svg width="20" height="20"><use href="#lit-svg"></use></svg> Lit</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/angular/"><svg width="20" height="20"><use href="#angular-svg"></use></svg> Angular</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/vue/"><svg width="20" height="20"><use href="#vue-svg"></use></svg> Vue</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/preact/"><svg width="20" height="20"><use href="#preact-svg"></use></svg> Preact</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/nextjs/"><svg width="20" height="20"><use href="#nextjs-svg"></use></svg> NextJS</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/react/"><svg width="20" height="20"><use href="#react-svg"></use></svg> React</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/solidjs/"><svg width="20" height="20"><use href="#solidjs-svg"></use></svg> SolidJS</a>
  </nve-button>
  <nve-button>
    <a href="/docs/about/installation/"><svg width="18" height="18"><use href="#javascript-svg"></use></svg> JavaScript</a>
  </nve-button>
</section>

## Browsers

To enable and support cutting edge features for our users the primary browser support is Chrome.

<section nve-layout="row gap:sm pad-bottom:md">
  <nve-button>
    <a href="https://www.google.com/chrome/"><svg width="20" height="20"><use href="#chrome-svg"></use></svg> Chrome</a>
  </nve-button>
</section>

If a browser API is reasonably supported via a polyfill then it may be added to our optional polyfill bundle.

```typescript
import '@nvidia-elements/core/polyfills';
```

## Versioning

The Elements package follows [semantic versioning](https://semver.org/) and is now in its stable 1.x release cycle. Changes can be found in the [Changelog](/docs/about/changelog/). A debug utility is available
on the global window object to help identify the active versions being used at runtime. This log will list out all the registered elements and active versions.

- API <strong>Breaking</strong> changes are maximum once per <strong>three months</strong>.
- API <strong>Deprecations</strong> are supported for minimum of <strong>three months</strong>.

```typescript
window.NVE_ELEMENTS.debug()
```

```json
{
  "versions": ["0.0.0"],
  "elementRegistry": {
    "nve-icon": "0.0.0",
    "nve-alert": "0.0.0",
    "nve-button": "0.0.0",
    "nve-input": "0.0.0",
    "nve-dropdown": "0.0.0",
    "nve-dialog": "0.0.0",
  },
  "i18nRegistry": {
    "close": "close",
    "expand": "expand",
    "sort": "sort",
    "show": "show",
    "hide": "hide",
    "loading": "loading"
  }
}
```
