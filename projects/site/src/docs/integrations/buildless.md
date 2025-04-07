---
{
  title: 'Buildless Integration',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

<div nve-layout="row gap:xs">
  <nve-button>
    <a href="https://NVIDIA.github.io/elements/starters/buildless/" target="_blank"><svg width="18" height="18"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#javascript-svg"></use></svg> Demo</a>
  </nve-button>

  <nve-button>
    <nve-icon name="download" size="sm"></nve-icon>
    <a href="https://NVIDIA.github.io/elements/starters/download/buildless.zip" target="_blank">Download</a>
  </nve-button>
  
  <nve-button>
    <nve-icon name="code"></nve-icon>
    <a href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/buildless" target="_blank">Source</a>
  </nve-button>
</div>

Using [Import Maps](https://web.dev/import-maps-in-all-modern-browsers/) it is possible to
use elements without build tooling such as Vite or Rollup for easy in browser **prototyping**.

```html
<!DOCTYPE html>
<html lang="en" nve-theme="dark">
  <head>
    <title>Import Map Starter + @nvidia-elements/core</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" type="text/css" href="https://https://esm.sh/@nvidia-elements/core@latest/dist/index.css" />
    <script type="importmap">
      {
        "imports": {
          "@nvidia-elements/core": "https://https://esm.sh/@nvidia-elements/core@latest",
          "@nvidia-elements/core/": "https://https://esm.sh/@nvidia-elements/core@latest/"
        }
      }
    </script>
  </head>
  <body nve-text="body" nve-layout="column gap:md pad:lg">
    <nve-alert status="success">hello world</nve-alert>

    <script type="module">
      import '@nvidia-elements/core/alert/define.js';
    </script>
  </body>
</html>
```

## Create Lit Components

Using import maps more complex UI components can be created without build tooling.

<nve-button>
    <a href="https://elements-stage.nvidia.com/ui/elements-playground/91017958-e474-4f1a-9d9c-107d0ad7db8b" target="_blank">Playground</a>
</nve-button>

```html
<!DOCTYPE html>
<html nve-theme="dark">
  <head>
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/fonts/inter.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/index.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/dark.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/layout.css" />
    <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/typography.css" />
  </head>
  <body nve-text="body" nve-layout="column gap:md pad:lg">
    <app-status-label status="success"></app-status-label>

    <script type="module">
      import { html, LitElement } from 'lit';
      import typography from '@nvidia-elements/styles/dist/typography.css' with { type: 'css' };
      import layout from '@nvidia-elements/styles/dist/layout.css' with { type: 'css' };
      import '@nvidia-elements/core/badge/define.js';

      class AppStatusLabel extends LitElement {
        static styles = [typography, layout];

        static properties = {
          status: { type: String },
        };

        render() {
          return html`
            <div nve-layout="row gap:sm align:center">
              <p nve-text="label">status:</p>
              <nve-badge .status=${this.status}>${this.status}</nve-badge>
            </div>
          `;
        }
      }

      customElements.define('app-status-label', AppStatusLabel);
    </script>
  </body>
</html>
```
