/**
 * Provides basic page layout that aligns with Storybook and Starters page header.
 * Additional layout variations can be added to _layouts/
 */
export function render(data) {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en" nve-theme="dark" nve-transition="auto">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="/assets/favicon.svg"> 
        <title>Elements</title>
        <style>
          @import '@nvidia-elements/themes/fonts/inter.css';
          @import '@nvidia-elements/themes/index.css';
          @import '@nvidia-elements/themes/dark.css';
          @import '@nvidia-elements/styles/layout.css';
          @import '@nvidia-elements/styles/typography.css';
          @import '@nvidia-elements/styles/view-transitions.css';
        </style>
      </head>
      <body>
        <nve-page>
          <nve-page-header slot="header">
            <nve-logo slot="prefix" size="sm"></nve-logo>
            <a slot="prefix" href="/elements/">Elements</a>
            <nve-button container="flat"><a href="/elements/api/?path=/docs/about-installation--docs">Get Started</a></nve-button>
            <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>
            <nve-button container="flat"><a href="/elements/starters/buildless/">Starters</a></nve-button>
            <nve-button container="flat"><a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a></nve-button>
          </nve-page-header>
          ${data.content}
        </nve-page>
        <script type="module">
          import '@nvidia-elements/core/page-header/define.js';
          import '@nvidia-elements/core/page/define.js';
          import '@nvidia-elements/core/button/define.js';
          import '@nvidia-elements/core/logo/define.js';
        </script>
      </body>
    </html>
  `;
}
