---
{
  title: 'Eleventy',
  description: 'Use NVIDIA Elements in Eleventy with Vite-bundled component definitions and styles, template markup, and optional Lit server-side rendering.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'eleventy' %}

{% installation 'eleventy' %}

Elements are standard Web Components, so Eleventy can emit their tags from any template language. For most sites, render the element markup at build time and register the components in the browser. Use Lit server-side rendering (SSR) only when component shadow DOM must be present in the generated HTML.

## Client-Side Rendering

The [Eleventy starter]({{ELEMENTS_REPO_BASE_URL}}/tree/main/projects/starters/eleventy) uses [Eleventy Plugin Vite](https://github.com/11ty/eleventy-plugin-vite) to bundle Elements styles and component definitions. This approach supports tree-shaking and keeps the Eleventy build environment separate from browser component registration.

Install the Vite integration in an existing Eleventy project:

```shell
npm install --save-dev @11ty/eleventy-plugin-vite vite
```

### Configure Eleventy and Vite

Register the Vite plugin and copy the browser entry files into Eleventy's output for Vite to process:

```javascript
// eleventy.config.js
import EleventyPluginVite from '@11ty/eleventy-plugin-vite';

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/**/*.ts');
  eleventyConfig.addPassthroughCopy('src/**/*.css');

  eleventyConfig.addPlugin(EleventyPluginVite, {
    viteOptions: {
      build: {
        target: 'esnext'
      }
    }
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
      layouts: '_layouts'
    }
  };
}
```

If you deploy the site below the domain root, set the same base path in the Vite `base` option and the document's `<base>` element. Keeping those values aligned lets entry points and generated links resolve from the deployment path.

### Add Browser Entry Points

Create a TypeScript entry point for component registration. Import each `define.js` module that the site uses:

```typescript
// src/_layouts/elements.ts
import './elements.css';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
```

Create a CSS entry point for the global theme, font, and utility styles:

```css
/* src/_layouts/elements.css */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/view-transitions.css';
```

Load the entry points from the shared Eleventy layout:

{% raw %}

```html
<!doctype html>
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/_layouts/elements.css" />
    <script type="module" src="/_layouts/elements.ts"></script>
  </head>
  <body nve-text="body">
    {{ content | safe }}
  </body>
</html>
```

{% endraw %}

Keep `define.js` imports in the browser entry point. The Eleventy configuration runs in Node.js and should not register browser components unless you configure SSR.

### Use Elements in Templates

Write Elements markup in HTML, JavaScript, or Markdown templates:

```html
<div nve-layout="column gap:md">
  <nve-alert status="success" closable>Site generated successfully.</nve-alert>
  <nve-button interaction="emphasis">
    <a href="/docs/">View documentation</a>
  </nve-button>
</div>
```

When configuring a custom Markdown library, enable inline HTML so Markdown pages can emit `nve-*` tags. The starter also extends the Markdown renderer to add `nve-text` and `nve-layout` attributes to generated headings, paragraphs, links, and lists.

## Server-Side Rendering

The [`@lit-labs/eleventy-plugin-lit`](https://github.com/lit/lit/tree/main/packages/labs/eleventy-plugin-lit) plugin can render Lit components into declarative shadow DOM during the Eleventy build. Lit SSR and the Eleventy plugin are experimental, so verify component compatibility before using this path in production. The [Eleventy SSR starter]({{ELEMENTS_REPO_BASE_URL}}/tree/main/projects/starters/eleventy-ssr) provides a working testbed.

Install the SSR plugin and client hydration support:

```shell
npm install @lit-labs/eleventy-plugin-lit @lit-labs/ssr-client
```

Register every component that Eleventy must render. Load the server-compatible icon module before components that can render icons:

```javascript
// eleventy.config.js
import litPlugin from '@lit-labs/eleventy-plugin-lit';

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(litPlugin, {
    mode: 'worker',
    componentModules: [
      'node_modules/@nvidia-elements/core/dist/icon/server.js',
      'node_modules/@nvidia-elements/core/dist/alert/define.js'
    ]
  });
}
```

For interactive components, load Lit hydration support before the client-side component definitions:

```typescript
// src/_layouts/elements.ts
import '@lit-labs/ssr-client/lit-element-hydrate-support.js';
import '@nvidia-elements/core/alert/define.js';
```

The server `componentModules` list and the browser `define.js` imports must include the same interactive components. Components that do not load in the browser remain static after Eleventy renders them.
