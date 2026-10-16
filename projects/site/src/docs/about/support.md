---
{
  title: 'Support',
  description: 'How to get help with NVIDIA Elements: support channels, response expectations, and where to escalate production issues.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

## Libraries and Community

<section nve-layout="row gap:sm">
  <nve-button>
    <a href="{{ELEMENTS_REPO_BASE_URL}}" target="_blank">Repo</a>
  </nve-button>
  <nve-button>
    <a href="https://registry.npmjs.org" target="_blank">npm Package</a>
  </nve-button>
</section>

## Frameworks

Elements components are custom elements. Frameworks that support custom elements can host them, and so can vanilla JavaScript. [Custom Elements Everywhere](https://custom-elements-everywhere.com) tracks framework interoperability. Start with the [installation](/docs/integrations/installation/) guide, then open the integration page for the framework you use.

Those pages describe client-side registration. A framework page is not a browser-support expansion, and a server-rendering package stays experimental when that page says so. The environment table below separates the browser policy, the browsers CI exercises, and the documented server-rendering paths.

<section nve-layout="row gap:sm align:wrap">
  <nve-button>
    <a href="/docs/integrations/typescript/">{% svg-logo 'typescript' '18' %} TypeScript</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/lit/">{% svg-logo 'lit' '20' %} Lit</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/angular/">{% svg-logo 'angular' '20' %} Angular</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/vue/">{% svg-logo 'vue' '20' %} Vue</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/preact/">{% svg-logo 'preact' '20' %} Preact</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/nextjs/">{% svg-logo 'nextjs' '20' %} NextJS</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/react/">{% svg-logo 'react' '20' %} React</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/solidjs/">{% svg-logo 'solidjs' '18' %} SolidJS</a>
  </nve-button>
  <nve-button>
    <a href="/docs/integrations/installation/">{% svg-logo 'javascript' '18' %} JavaScript</a>
  </nve-button>
</section>

## Browsers

Chrome is the primary supported browser. Elements uses current web platform features, including the [Popover API](/docs/foundations/popovers/).

<section nve-layout="row gap:sm">
  <nve-button>
    <a href="https://www.google.com/chrome/">{% svg-logo 'chrome' '20' %} Chrome</a>
  </nve-button>
</section>

Automated tests run in Chromium through Playwright. Unit, accessibility, visual, and Lighthouse tests use that browser in CI. Those runs record the browser the suite exercises. They leave the support policy on Chrome.

If a polyfill reasonably supports a browser API, the team may add it to the optional polyfill bundle.

```typescript
import '@nvidia-elements/core/polyfills';
```

## Environments

| Environment                                                    | Status                                                                                                  |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Chrome                                                         | Primary supported browser.                                                                              |
| Chromium through Playwright                                    | Browser used by unit, accessibility, visual, and Lighthouse tests.                                      |
| React server rendering with `@lit-labs/ssr-react`              | Experimental. See [React SSR](/docs/integrations/react/#react-ssr).                                     |
| NextJS server rendering with `@lit-labs/nextjs`                | Experimental. See [NextJS SSR](/docs/integrations/nextjs/#ssr).                                         |
| Eleventy server rendering with `@lit-labs/eleventy-plugin-lit` | Experimental. See [Eleventy server-side rendering](/docs/integrations/eleventy/#server-side-rendering). |
| Component SSR tests                                            | String-render check. See [SSR testing](/docs/internal/guidelines/testing-ssr/).                         |

## Versioning

The Elements packages follow [semantic versioning](https://semver.org/). Install the current stable major release from the public npm registry. The [migration guide](/docs/about/migration/#stability-and-versioning) explains how that public release relates to the earlier internal `1.x` generation and the public `0.x` preview packages. The [Changelog](/docs/changelog/) records each change. A debug utility is available
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
