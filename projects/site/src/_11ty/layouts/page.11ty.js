import { renderBaseHead } from './common.js';

/**
 * Provides basic page layout that aligns with Storybook and Starters page header.
 */
export function render(data) {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en" nve-theme="dark" nve-transition="auto">
      <head>
        ${renderBaseHead(data)}
      </head>
      <body>
        <nve-page>
          <nve-page-header slot="header">
            <nve-logo slot="prefix" size="sm"></nve-logo>
            <a slot="prefix" href=".">Elements</a>
            <nve-button container="flat"><a href="docs/about/getting-started/">Get Started</a></nve-button>
            <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>
            <nve-button container="flat"><a href="starters/">Starters</a></nve-button>
            <nve-button container="flat"><a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a></nve-button>
          </nve-page-header>
          ${data.content}
        </nve-page>
      </body>
    </html>
  `;
}
