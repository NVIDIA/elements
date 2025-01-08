export function render(data) {
  return /* html */ `
    <!DOCTYPE html>
      <html lang="en" nve-theme="dark" nve-transition="auto">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Eleventy Starter</title>
          <link rel="stylesheet" type="text/css" href="/_layouts/index.css" />
          <link rel="stylesheet" type="text/css" href="./index.css" />
        </head>
        <body>
          <nve-page>
            <nve-page-header slot="header">
              <nve-logo slot="prefix" size="sm"></nve-logo>
              <a slot="prefix" href="/elements/">Elements</a>
              <nve-button container="flat"><a href="/elements/api/?path=/docs/about-installation--docs">Get Started</a></nve-button>
              <nve-button container="flat"
              ><a href="https://elements-stage.nvidia.com/ui/elements-playground" target="_blank">Playground</a></nve-button
              >
              <nve-button selected container="flat"><a href="/elements/starters/buildless/">Starters</a></nve-button>
              <nve-button container="flat"
                ><a href="https://github.com/NVIDIA/elements/" target="_blank">Gitlab</a></nve-button
              >
            </nve-page-header>
            <nve-page-panel slot="left" size="sm">
              <nve-page-panel-header>
                <div nve-layout="row gap:xs align:vertical-center">Starters</div>
              </nve-page-panel-header>
              <nve-page-panel-content>
                <nve-menu>
                  <nve-menu-item>
                    <a href="/elements/starters/buildless/">
                      <img src="/assets/javascript.svg" width="18px" height="18px" alt="javascript logo" />
                      Buildless
                    </a>
                  </nve-menu-item>
                  <nve-menu-item>
                    <a href="/elements/starters/typescript/">
                      <img src="/assets/typescript.svg" width="18px" height="18px" alt="typescript logo" />
                      TypeScript
                    </a>
                  </nve-menu-item>
                  <nve-menu-item current="page">
                    <a href="/elements/starters/eleventy/">
                      <img src="/assets/eleventy.svg" width="18px" height="18px" alt="eleventy logo" />
                      Eleventy
                    </a>
                  </nve-menu-item>
                  <nve-menu-item>
                    <a href="/elements/starters/angular/">
                      <img src="/assets/angular.svg" width="18px" height="18px" alt="angular logo" />
                      Angular
                    </a>
                  </nve-menu-item>
                  <nve-menu-item>
                    <a href="/elements/starters/vue/">
                      <img src="/assets/vue.svg" width="18px" height="18px" alt="vue logo" />
                      Vue
                    </a>
                  </nve-menu-item>
                  <nve-menu-item>
                    <a href="/elements/starters/react/">
                      <img src="/assets/react.svg" width="18px" height="18px" alt="react logo" />
                      React
                    </a>
                  </nve-menu-item>
                  <nve-menu-item>
                    <a href="/elements/starters/solidjs/">
                      <img src="/assets/solidjs.svg" width="18px" height="18px" alt="solidjs logo" />
                      SolidJS
                    </a>
                  </nve-menu-item>
                  <nve-menu-item>
                    <nve-icon name="template"></nve-icon>
                    <a href="/elements/starters/mpa/">MPA</a>
                  </nve-menu-item>
                </nve-menu>
              </nve-page-panel-content>
            </nve-page-panel>
            <main nve-layout="column gap:lg">
              <nve-breadcrumb>
                <nve-button><a href="/elements/starters/buildless/">Elements</a></nve-button>
                <nve-button><a href="/elements/starters/buildless/" target="_self">Starters</a></nve-button>
                ${
                  data.title === 'Eleventy + Elements'
                    ? /* html */ `<span>Eleventy</span>`
                    : /* html */ `
                  <nve-button><a href="/elements/starters/eleventy/" target="_self">Eleventy</a></nve-button>
                  <span>${data.title}</span>
                `
                }
              </nve-breadcrumb>
              ${data.content}
            </main>
          </nve-page>
          <script type="module" src="/_layouts/index.ts"></script>
          <script type="module" src="./index.ts"></script>
        </body>
      </html>
  `;
}
