---
{
  title: 'Bundles',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'bundles' %}

{% installation 'bundles' %}

Bundles are ideal **only** for the following specific use cases:

- Simple HTML prototypes
- Non-JS build pipelines (Python, SSR)
- CMS systems
- Static Site Generators (see `typescript` demo folder as an alternative)

Only use this approach if the application development environment does not support a Web-based build system such as Rollup, Vite, ESBuild or Webpack.

Using the single bundle approach can make simple HTML prototypes easy but prevent performance optimizations such as tree-shaking. Lack of these optimizations means your users incur a performance penalty loading all components regardless if the UI uses them.

```html
<!doctype html>
<html lang="en" nve-theme="dark" nve-transition="auto">
  <head>
    <title>Elements + Static Bundles</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import './node_modules/@nvidia-elements/styles/dist/bundles/index.css';
      @import './node_modules/@nvidia-elements/themes/dist/bundles/index.css';
      @import './node_modules/@nvidia-elements/themes/dist/fonts/inter.css';
    </style>
    <script type="module">
      import './node_modules/@nvidia-elements/core/dist/bundles/index.js';
    </script>
  </head>
  <body nve-text="body">
    <nve-alert>hello there</nve-alert>
  </body>
</html>
```

## Registry Usage Guidelines

{% artifactory-usage %}
