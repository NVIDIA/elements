import { renderBaseHead, renderDocsNav } from './common.js';
import { renderSvgLogos } from './svg-logos.js';
/**
 * Provides mirrored layout to mimic existing Storybook docs navigation.
 */
export function render(data) {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en" nve-theme="dark" nve-transition="auto">
      <head>
        ${renderBaseHead(data)}
        <style>
          nve-tree > nve-tree-node:not(:has(> a)) {
            --color: var(--nve-sys-text-muted-color);
            --font-size: 11px;
            font-weight: var(--nve-ref-font-weight-regular);
            margin-bottom: var(--nve-ref-space-sm);
            text-transform: uppercase;
            letter-spacing: 1.76px;
          }

          h2[nve-text='heading xl mkd'] {
            border-bottom: 1px solid var(--nve-ref-border-color);
          }

          [nve-text='heading xl mkd'],
          [nve-text='heading lg mkd'] {
            padding-top: var(--nve-ref-space-xl);
            padding-bottom: var(--nve-ref-space-xs);
          }
          
          [nve-text='link mkd']:visited {
            color: inherit !important;
          }

          [nve-text='list mkd'] [nve-text="body relaxed mkd"] {
            display: inline !important;
          }

          /* Temporary fix for code_inline tag renderer in paragraphs, applies nve-text="code" styles */
          p[nve-text] > code {
            background: var(--nve-sys-interaction-field-background) !important;
            border-radius: var(--nve-ref-border-radius-xs) !important;
            display: inline-block !important;
            font-family: monospace !important;
            padding: var(--nve-ref-size-50) var(--nve-ref-size-100)
          }

          pre:has(nve-codeblock),
          code:has(nve-codeblock) {
            display: contents;
          }

          nve-codeblock {
            width: 100%;
            min-height: fit-content;
          }

          nve-page-panel[slot='left'] {
            --background: var(--nve-sys-layer-shell-background);
            --width: 300px;

            nve-page-panel-content {
              --padding: var(--nve-ref-size-600) var(--nve-ref-size-400) var(--nve-ref-size-300) var(--nve-ref-size-400);
            }
          }

          main {
            padding: var(--nve-ref-space-xl) var(--nve-ref-space-md);
            padding-bottom: var(--nve-ref-space-xl);

            #doc-content {
              max-width: 1120px;
              width: 100%;
            }
          }

          @media (min-width: 1920px) {
            main {
              padding: calc(var(--nve-ref-space-xl) * 2) var(--nve-ref-space-xl);
            }
          }

          main:has([docs-full-width]) {
            padding: var(--nve-ref-space-lg) var(--nve-ref-space-md);

            #doc-content {
              max-width: 100%;
            }
          }

          main:has(#getting-started-img) {
            background-image: url(static/images/test-image-2.webp) !important;
            object-fit: fill !important;
            background-repeat: no-repeat !important;
            background-position: 0 15vh !important;
            box-shadow: inset 0 0 0 1000px rgb(11 12 15 / 88%) !important;
            filter: drop-shadow(0 50px 50px rgb(11 12 15 / 95%));
          }

          #doc-sidenav[nve-text='list mkd'] {
            padding: 0;
            height: fit-content;
            list-style: none !important;
            margin: 50px 0 0 0 !important;
            position: sticky !important;
            display: none;
            top: 50px;
            right: 50px;

            a[nve-text='link truncate'] {
              text-decoration: none !important;
              color: var(--nve-sys-text-muted-color) !important;
              text-wrap: nowrap !important;
              min-width: 150px;
              max-width: 150px;
              display: block;
            }

            li {
              padding-bottom: 14px;
            }
          }

          @media (min-width: 1600px) {
            #doc-sidenav[nve-text='list mkd'] {
              display: block;
            }
          }

          nve-api-summary {
            min-height: 65px;
          }
        </style>
        <script type="module">
          const systemOptionsPanel = document.querySelector('#system-options-panel');
          const systemOptionsPanelBtn = document.querySelector('#system-options-panel-btn');
          systemOptionsPanel.addEventListener('close', () => systemOptionsPanel.hidden = true);
          systemOptionsPanelBtn.addEventListener('click', () => systemOptionsPanel.hidden = !systemOptionsPanel.hidden);

          const handle = document.querySelector('nve-resize-handle[slot="left"]');
          const panel = document.querySelector('nve-page-panel[slot="left"]');
          handle.addEventListener('input', e => panel.style.width = e.target.value + 'px');
        </script>
        <script type="module">
          const headings = [
            ...Array.from(document.querySelectorAll('h2[nve-text*="mkd"], h3[nve-text*="mkd"], h4[nve-text*="mkd"]')),
            document.querySelector('nve-api-status') ? { textContent: 'Status', id: 'element-status'} : null,
            document.querySelector('nve-api-table') ? { textContent: 'API', id: 'element-api'} : null
          ].filter(i => !!i);

          if (headings.length > 2 && headings.length < 10) {
            const ul = document.createElement('ul');
            ul.id = 'doc-sidenav';
            ul.setAttribute('nve-text', 'list mkd');
            for (const heading of headings) {
              const li = document.createElement('li');
              const a = document.createElement('a');
              a.setAttribute('nve-text', 'link truncate');
              a.href = document.location.pathname + '#' + heading.id;
              a.textContent = heading.textContent;
              li.appendChild(a);
              ul.appendChild(li);
            }
            document.querySelector('#doc-content').insertAdjacentElement('afterend', ul);
          }
        </script>
        <script type="module">
        // Auto-scroll to deep-link headers
          const scrollToHeader = () => {
            const headerId = new URL(window.parent.location.href).hash.replace('#', '');
            
            document.getElementById(headerId)?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          };

          setTimeout(() => scrollToHeader(), 1500);
        </script>

        <script type="module">
          // Auto-scroll to highlighted nav item
          const scrollToNavItem = () => {
            const navPanel = document.querySelector('nve-page-panel-content');
            const highlightedNode = navPanel.querySelector('nve-tree-node[highlighted]');
            
            if (highlightedNode) {
              highlightedNode.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          };

          setTimeout(() => scrollToNavItem(), 500);
        </script>

        ${renderSvgLogos()}
      </head>
      <body nve-text="body trim:none">
        <nve-page>
          <nve-page-header slot="header">
            <nve-logo slot="prefix" size="sm"></nve-logo>
            <a slot="prefix" href=".">Elements</a>
            <nve-button container="flat"><a href="api/?path=/docs/about-installation--docs">Get Started</a></nve-button>
            <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>
            <nve-button container="flat"><a href="starters/">Starters</a></nve-button>
            <nve-button container="flat"><a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a></nve-button>
            <nve-button slot="suffix" id="system-options-panel-btn" container="flat" id="dropdown-btn">System Themes</nve-button>
          </nve-page-header>
          <nve-page-panel slot="left">
            <nve-page-panel-content>
              ${renderDocsNav(data)}
            </nve-page-panel-content>
          </nve-page-panel>
          <nve-resize-handle slot="left" min="3" max="300" value="300" step="20" orientation="vertical"></nve-resize-handle>
          <main nve-layout="column align:center">
            <div nve-layout="row align:horizontal-center full" style="gap: 5rem;">
              <div id="doc-content" nve-layout="column gap:lg align:horizontal-stretch pad-bottom:xl">
                ${
                  data.tag
                    ? `
                  <h1 nve-text="display emphasis mkd">${data.title}</h1>
                  <nve-api-summary tag="${data.tag}"></nve-api-summary>`
                    : ''
                }
                ${data.content}
                ${
                  data.tag
                    ? `
                  <nve-api-status tag="${data.tag}"></nve-api-status>
                  <nve-api-table tag="${data.tag}"></nve-api-table>`
                    : ''
                }
                ${
                  data.associatedElements?.length
                    ? data.associatedElements.map(tag => `<nve-api-table tag="${tag}"></nve-api-table>`).join('')
                    : ''
                }
              </div>
            </div>
          </main>
          <nve-page-panel closable hidden slot="right" size="sm" id="system-options-panel">
            <nve-page-panel-content>
              <nve-api-system-settings></nve-api-system-settings>
            </nve-page-panel-content>
          </nve-page-panel>
        </nve-page>
      </body>
    </html>
  `;
}
