---
{
  title: 'Support',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Libraries and Community

Reach out to the Slack support channel or find more resources in the Figma libraries.

<section nve-layout="row gap:sm pad-bottom:lg">
  <nve-button>
    <a href="http://nv/elements-slack" target="_blank">{% svg-logo 'slack' '18' %} Slack Support</a>
  </nve-button>
  <nve-button>
    <a href="{{ELEMENTS_REPO_BASE_URL}}" target="_blank">{% svg-logo 'gitlab' '18' %} Gitlab</a>
  </nve-button>
  <nve-button>
    <a href="http://nv/elements-figma" target="_blank">{% svg-logo 'figma' '18' %} Figma Library</a>
  </nve-button>
  <nve-button>
    <a href="https://registry.npmjs.org" target="_blank"><nve-icon name="archive" style="--color: var(--nve-sys-accent-primary-background)"></nve-icon> npm Package</a>
  </nve-button>
</section>

## Frameworks

Elements [supports a wide variety](https://custom-elements-everywhere.com) of JavaScript frameworks and libraries as well as vanilla JS. Read more at the [installation](./docs/about/installation/) page.

<section nve-layout="row gap:sm pad-bottom:lg">
  <nve-button>
    <a href="./docs/integrations/typescript/">{% svg-logo 'slack' '18' %} TypeScript</a>
  </nve-button>
  <nve-button>
    {% svg-logo 'lit' '20' %} Lit</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/angular/">{% svg-logo 'angular' '20' %} Angular</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/vue/">{% svg-logo 'vue' '20' %} Vue</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/preact/">{% svg-logo 'preact' '20' %} Preact</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/nextjs/">{% svg-logo 'nextjs' '20' %} NextJS</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/react/">{% svg-logo 'react' '20' %} React</a>
  </nve-button>
  <nve-button>
    <a href="./docs/integrations/solidjs/">{% svg-logo 'solidjs' '18' %} SolidJS</a>
  </nve-button>
  <nve-button>
    <a href="./docs/about/installation/">{% svg-logo 'javascript' '18' %} JavaScript</a>
  </nve-button>
</section>

## Browsers

To enable and support cutting edge features for all users the primary browser support is Chrome.

<section nve-layout="row gap:sm pad-bottom:md">
  <nve-button>
    <a href="https://www.google.com/chrome/">{% svg-logo 'chrome' '20' %} Chrome</a>
  </nve-button>
</section>

If a polyfill reasonably supports a browser API then the team may add it to the optional polyfill bundle.

```typescript
import '@nvidia-elements/core/polyfills';
```

## Versioning

The Elements package follows [semantic versioning](https://semver.org/) and is now in its stable 1.x release cycle. You can find changes in the [Changelog](./docs/changelog/). A debug utility is available
on the global window object to help identify the active versions in use at runtime. This log lists all the registered elements and active versions.

- API <strong>Breaking</strong> changes are at most once per <strong>three months</strong>.
- API <strong>Deprecations</strong> remain supported for at least <strong>three months</strong>.

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
