const BASE_URL = `${process.env.PAGES_BASE_URL}starters/eleventy/`;

export function render(data) {
  return /* html */ `
    <!DOCTYPE html>
      <html lang="en" nve-theme="dark" nve-transition="auto">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <base href="${BASE_URL}" />
          <title>Eleventy Starter</title>
          <link rel="stylesheet" href="/_layouts/index.css" />
          <script type="module" src="/_layouts/index.ts"></script>
        </head>
        <body>
          <nve-page>
            <nve-page-header slot="header">
              <nve-logo slot="prefix" size="sm"></nve-logo>
              <a slot="prefix" href="https://NVIDIA.github.io/elements/">Elements</a>
              <nve-button container="flat"><a href="https://NVIDIA.github.io/elements/docs/integrations/angular/" target="_blank">Catalog</a></nve-button>
              <nve-button container="flat"><a href="https://NVIDIA.github.io/elements/starters/">Starters</a></nve-button>
              <nve-button container="flat"><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></nve-button>
            </nve-page-header>
            <nve-page-panel slot="left" size="sm">
              <nve-page-panel-content>
                <nve-menu>
                  <nve-menu-item><a target="_blank" href="https://NVIDIA.github.io/elements/docs/integrations/eleventy/">Documentation</a></nve-menu-item>
                  <nve-menu-item><a target="_blank" href="https://github.com/NVIDIA/elements/-/tree/main/projects/starters/eleventy">Source</a></nve-menu-item>
                  <nve-menu-item><a download href="https://NVIDIA.github.io/elements/starters/download/eleventy.zip">Download</a></nve-menu-item>
                </nve-menu>
              </nve-page-panel-content>
            </nve-page-panel>
            <main nve-layout="column gap:lg pad:lg">
              <div nve-layout="row gap:sm align:vertical-center">
                <img src="https://NVIDIA.github.io/elements/static/images/integrations/javascript.svg" width="36px" height="36px" alt="javascript logo">
                <h1 nve-text="heading xl">Eleventy</h1>
              </div>
              ${data.content}
            </main>
          </nve-page>
        </body>
      </html>
  `;
}
