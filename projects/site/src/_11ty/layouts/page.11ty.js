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
            <nve-button container="flat"><a href="docs/about/getting-started/">Catalog</a></nve-button>
            <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>
            <nve-button container="flat"><a href="starters/">Starters</a></nve-button>
            <nve-button container="flat"><a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a></nve-button>
            <nve-button slot="suffix" id="system-options-panel-btn" container="flat" id="dropdown-btn">System Themes</nve-button>
          </nve-page-header>
          ${data.content}
          <nve-page-panel closable hidden slot="right" size="sm" id="system-options-panel">
            <nve-page-panel-content>
              <nvd-system-settings></nvd-system-settings>
            </nve-page-panel-content>
          </nve-page-panel>
        </nve-page>
        <script type="module">
          import '/_internal/system-settings/system-settings.js';
          const systemOptionsPanel = globalThis.document.querySelector('#system-options-panel');
          const systemOptionsPanelBtn = globalThis.document.querySelector('#system-options-panel-btn');
          systemOptionsPanel.addEventListener('close', () => (systemOptionsPanel.hidden = true));
          systemOptionsPanelBtn.addEventListener('click', () => systemOptionsPanel.hidden = !systemOptionsPanel.hidden);
        </script>
      </body>
    </html>
  `;
}
