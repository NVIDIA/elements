---
{
  title: 'Import Maps',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

{% integration 'importmaps' %}

{% installation 'importmaps' %}

Using [Import Maps](https://web.dev/import-maps-in-all-modern-browsers/) you can use elements without build tooling such as Vite or Rollup for easy in browser **prototyping**.

```html
<!DOCTYPE html>
<html lang="en" nve-theme="dark">
  <head>
    <title>Import Map Starter + @nvidia-elements/core</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="importmap">
      {
        "imports": {
          "lit": "/node_modules/lit/index.js",
          "lit/": "/node_modules/lit/",
          "lit-html": "/node_modules/lit-html/lit-html.js",
          "lit-html/": "/node_modules/lit-html/",
          "lit-element/lit-element.js": "/node_modules/lit-element/lit-element.js",
          "lit-element/": "/node_modules/lit-element/",
          "@lit/reactive-element": "/node_modules/@lit/reactive-element/reactive-element.js",
          "@lit/reactive-element/": "/node_modules/@lit/reactive-element/",
          "@nvidia-elements/core": "/node_modules/@nvidia-elements/core/dist/index.js",
          "@nvidia-elements/core/": "/node_modules/@nvidia-elements/core/dist/"
        }
      }
    </script>
    <link rel="stylesheet" type="text/css" href="node_modules/@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" type="text/css" href="node_modules/@nvidia-elements/themes/dist/index.css" />
    <link rel="stylesheet" type="text/css" href="node_modules/@nvidia-elements/themes/dist/dark.css" />
    <link rel="stylesheet" type="text/css" href="node_modules/@nvidia-elements/styles/dist/typography.css" />
    <link rel="stylesheet" type="text/css" href="node_modules/@nvidia-elements/styles/dist/layout.css" />
    <link rel="stylesheet" type="text/css" href="node_modules/@nvidia-elements/styles/dist/view-transitions.css" />
    <script type="module">
      import '@nvidia-elements/core/alert/define.js';
    </script>
  </head>
  <body nve-text="body" nve-layout="column gap:md pad:lg">
    <nve-alert status="success">hello world</nve-alert>
  </body>
</html>
```

## Registry Usage Guidelines

{% artifactory-usage %}
