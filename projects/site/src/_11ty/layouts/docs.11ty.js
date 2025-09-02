/* eslint-env node */
/* global process */

import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { renderBaseHead, renderDocsNav } from './common.js';
import { elementSummary, elementStatus, elementDescription } from '../templates/api.js';

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
 * Main documentation layout template that mimics Storybook docs navigation.
 * Provides a three-column layout with navigation, content, and anchor links.
 *
 * @param {Object} data - The page data object from 11ty
 * @returns {string} HTML string containing the rendered documentation page
 */
export function render(data) {
  return /* html */ `
    <!DOCTYPE html>
    <html lang="en" nve-theme="dark" nve-transition="auto">
      <head>
        ${renderBaseHead(data)}
        <style>${styles}</style>
        <script type="module">
          import '/_11ty/layouts/docs.ts';
        </script>
      </head>

      <body nve-text="body trim:none">
        <nve-page style="anchor-name: --page-anchor;">
          <!-- Main navigation header -->
          <nve-page-header slot="header">
            <nve-logo slot="prefix" size="sm"></nve-logo>
            <a slot="prefix" href=".">Elements</a>

            <nve-button container="flat" ${data.page.url.includes('docs') ? 'selected' : ''}><a href="docs/about/getting-started/">Catalog</a></nve-button>

            <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>

            <nve-button container="flat" ${data.page.url.includes('starters') ? 'selected' : ''}><a href="starters/">Starters</a></nve-button>

            <nve-button container="flat"><a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a></nve-button>

            <nve-button slot="suffix" id="system-options-panel-btn" container="flat">System Themes</nve-button>
          </nve-page-header>

          <!-- Left sidebar navigation -->
          <nve-page-panel slot="left" id="sidenav-panel">
            <nve-page-panel-content>
              <nvd-search id="docs-search" base-url="${BASE_URL}"></nvd-search>

              ${renderDocsNav(data)}
            </nve-page-panel-content>
          </nve-page-panel>

          <!-- Resizable handle for the left sidebar -->
          <nve-resize-handle slot="left" min="3" max="300" value="300" step="20" orientation="vertical"></nve-resize-handle>

          <!-- Main content area -->
          <main nve-layout="column align:center">
            <div nve-layout="row align:horizontal-center full">
              <div id="doc-content" nve-layout="column gap:lg align:horizontal-stretch pad-bottom:xl" style="anchor-name: --doc-content-anchor;">
                <!-- Component title and summary if this is a component page -->
                ${data.tag ? `<h1 nve-text="display emphasis mkd" data-pagefind-meta="tag:${data.tag}">${data.title}</h1>${elementSummary(data.tag)}` : ''}

                <!-- Component documentation tabs -->
                ${
                  data.tag &&
                  (!data.page.url.includes('/data-grid/') ||
                    data.page.url.endsWith('/data-grid/') ||
                    data.page.url.endsWith('/data-grid/api/'))
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

                <!-- Component description -->
                ${
                  data.tag && !(data.page.url.includes('api') || data.page.url.includes('examples'))
                    ? `
                <h2 nve-text="heading xl mkd">Overview</h2>
                  ${elementDescription(data.tag)}
                `
                    : ''
                }

                <!-- Page content -->
                ${data.content}

                <!-- Component status section if this is a component page -->
                ${data.tag && !data.hideStatus && !(data.page.url.includes('api') || data.page.url.includes('examples')) ? `${elementStatus(data.tag)}` : ''}
              </div>
              
              <!-- ANCHOR-GENERATOR -->
            </div>
          </main>

          <!-- System theme settings panel -->
          <nve-page-panel closable hidden slot="right" size="sm" id="system-options-panel">
            <nve-page-panel-content>
              <nvd-system-settings></nvd-system-settings>
            </nve-page-panel-content>
          </nve-page-panel>
        </nve-page>
      </body>
    </html>
  `;
}
