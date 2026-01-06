/* eslint-env node */
/* global process */

import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { renderBaseHead, renderDocsNav, renderBasePageHeader } from './common.js';
import { elementSummary, elementStatus, elementDescription, elementSupportButtons } from '../templates/api.js';
import { exampleShortcode } from '../shortcodes/example.js';

// Define the available tabs for component documentation
const componentDocTabs = [
  {
    label: 'Overview',
    slug: '/'
  },
  {
    label: 'API',
    slug: '/api/'
  },
  {
    label: 'Examples',
    slug: '/examples/',
    hidden: false
  }
];

// Base URL for the documentation site
export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/');

// Load documentation-specific styles
const styles = readFileSync(new URL('./docs.css', import.meta.url), 'utf-8');

/**
 * Main documentation layout template.
 * Structure: left sidebar (nav), main content with optional subheader (tabs), right sidebar (settings).
 *
 * @param {Object} data - The page data object from 11ty
 * @returns {string} HTML string containing the rendered documentation page
 */
export async function render(data) {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en" nve-theme="dark" nve-transition="auto">
      <head>
        ${renderBaseHead(data)}
        <style>${process.env.ELEVENTY_RUN_MODE === 'build' ? styles : ''}</style>
        <script type="module">
          ${process.env.ELEVENTY_RUN_MODE !== 'build' ? `import '/_11ty/layouts/docs.css';` : ''}
          import '/_11ty/layouts/docs.ts';
        </script>
      </head>

      <body nve-text="body trim:none">
        <!-- nve-page component, anchors for internal navigation links -->
        <nve-page style="anchor-name: --page-anchor;">
          <!-- renders nve-page-header (logo, top nav buttons, system themes btn...) -->
          ${renderBasePageHeader(data)}

          <!-- Left (aside) sidebar, search functionality, and tree navigation -->
          <nve-page-panel slot="left-aside" id="sidenav-panel">
            <nve-page-panel-content>
              <nvd-search id="docs-search" base-url="${BASE_URL}"></nvd-search>
              ${renderDocsNav(data)}
            </nve-page-panel-content>
          </nve-page-panel>
          
          <nve-resize-handle slot="left-aside" min="3" max="300" value="300" step="20" orientation="vertical"></nve-resize-handle>

          <!-- Subheader: component title, summary, and tab navigation (Overview/API/Examples) -->
          ${
            data.tag
              ? `
            <section slot="subheader" nve-layout="column gap:md align:left pad-x:lg pad-top:lg">
              <h1 nve-text="display emphasis mkd" data-pagefind-meta="tag:${data.tag}">${data.title}</h1>
              
              ${elementSummary(data.tag)}

              ${
                !data.page.url.includes('/data-grid/') ||
                data.page.url.endsWith('/data-grid/') ||
                data.page.url.endsWith('/data-grid/api/') ||
                data.page.url.endsWith('/data-grid/examples/')
                  ? `
              <nve-tabs id="doc-tabs">
                ${componentDocTabs
                  .filter(tab => !tab.hidden)
                  .filter(tab => !(data.hideExamplesTab && tab.label === 'Examples'))
                  .map(tabItem => {
                    const filePath = data.page.url;
                    let dir = 'elements';
                    if (filePath.includes('/docs/code/')) dir = 'code';
                    else if (filePath.includes('/docs/monaco/')) dir = 'monaco';
                    else if (filePath.includes('/docs/labs/markdown/')) dir = 'labs';
                    const tabUrl = `docs/${dir}/${data.page.fileSlug}${tabItem.slug}`;
                    return `<nve-tabs-item ${`/${tabUrl}` === data.page.url ? 'selected' : ''}>
                        <a href="${tabUrl}">${tabItem.label}</a>
                      </nve-tabs-item>`;
                  })
                  .join('')}
              </nve-tabs>`
                  : ''
              }
            </section>
          `
              : ''
          }

          <!-- Main content area -->
          <main id="docs-main">
            <div id="doc-content" nve-layout="column gap:lg align:horizontal-stretch pad-bottom:xl" style="anchor-name: --doc-content-anchor;">
              <!-- Component description, default example, and support links (Overview tab only) -->
              ${
                data.tag && !(data.page.url.includes('api') || data.page.url.includes('examples'))
                  ? `
                ${elementDescription(data.tag)}

                ${
                  !(data.page.url.includes('/data-grid/') && !data.page.url.endsWith('/data-grid/'))
                    ? await exampleShortcode(data.tag, 'Default', {
                        summary: false,
                        inline: data.tag !== 'nve-page-loader'
                      })
                    : ''
                }

                ${elementSupportButtons(data.tag)}
              `
                  : ''
              }

              <!-- Markdown page content -->
              ${data.content}

              <!-- Component status (Overview tab only) -->
              ${data.tag && !data.hideStatus && !(data.page.url.includes('api') || data.page.url.includes('examples')) ? `${elementStatus(data.tag)}` : ''}
            </div>
            
            <!-- An 11ty transform that generates anchor links for the page content -->
            <!-- ANCHOR-GENERATOR -->
          </main>
          
          <!-- Right sidebar: system settings panel -->
          <nve-page-panel closable hidden slot="right-aside" size="sm" id="system-options-panel">
            <nve-page-panel-content>
              <nvd-system-settings></nvd-system-settings>
            </nve-page-panel-content>
          </nve-page-panel>
        </nve-page>
      </body>
    </html>
  `;
}
