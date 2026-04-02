/* eslint-env node */
/* global process */

import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { renderBaseHead, renderDocsNav, renderBasePageHeader } from './common.js';
import { elementSummary, elementStatus, elementDescription, elementSupportButtons } from '../templates/api.js';
import { exampleShortcode } from '../shortcodes/example.js';

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
/**
 * Derives the section name from the page URL for search filtering.
 * @param {string} url - The page URL
 * @returns {string} The section name
 */
function getSection(url) {
  const match = url.match(/\/docs\/([^/]+)\//);
  if (match) {
    const section = match[1];
    // Map section paths to display-friendly names
    if (section === 'elements') return 'elements';
    if (section === 'about') return 'about';
    if (section === 'integrations') return 'integrations';
    if (section === 'foundations') return 'foundations';
    if (section === 'patterns') return 'patterns';
    if (section === 'code' || section === 'monaco' || section === 'markdown') return 'code';
    if (section === 'labs') return 'labs';
    if (section === 'internal' || section === 'api-design') return 'internal';
    if (section === 'cli' || section === 'mcp' || section === 'lint' || section === 'testing') return 'tools';
    return section;
  }
  return 'docs';
}

export async function render(data) {
  const baseTabUrl = `${data.page.url
    .replace('/', '')
    .replace('/api/', '/')
    .replace('/examples/', '/')
    .replace(/(.*\/data-grid\/).+/, '$1')}`;
  const section = getSection(data.page.url);

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

      <body nve-text="body trim:none" data-pagefind-meta="section:${section}">
        <!-- nve-page component, anchors for internal navigation links -->
        <nve-page style="anchor-name: --page-anchor;">
          <!-- renders nve-page-header (logo, top nav buttons, system themes btn...) -->
          ${renderBasePageHeader(data)}

          <!-- Left (aside) sidebar, search functionality, and tree navigation -->
          <nve-page-panel slot="left-aside" id="sidenav-panel" style="width: 250px;">
            <nve-page-panel-content>
              <nvd-search id="docs-search" base-url="${BASE_URL}"></nvd-search>
              ${renderDocsNav(data)}
            </nve-page-panel-content>
          </nve-page-panel>
          
          <nve-resize-handle slot="left-aside" min="5" max="460" value="250" step="5" orientation="vertical"></nve-resize-handle>

          <!-- Subheader: component title, summary, and tab navigation (Overview/API/Examples) -->
          ${
            data.tag
              ? `
            <section slot="subheader" nve-layout="column gap:xl align:left pad-x:xxl pad-top:xxl">
              <div nve-layout="column &lg|row align:space-between gap:lg grow">
                <h1 nve-text="display emphasis semibold mkd" data-pagefind-meta="tag:${data.tag}">${data.title}</h1>
                
                ${elementSummary(data.tag)}
              </div>

              <nve-tabs id="doc-tabs">
                <nve-tabs-item ${'/' + baseTabUrl === data.page.url ? 'selected' : ''}>
                  <a href="${baseTabUrl}">Overview</a>
                </nve-tabs-item>
                <nve-tabs-item ${'/' + baseTabUrl + 'api/' === data.page.url ? 'selected' : ''}>
                  <a href="${baseTabUrl + 'api/'}">API</a>
                </nve-tabs-item>${
                  data.hideExamplesTab
                    ? ''
                    : `<nve-tabs-item ${'/' + baseTabUrl + 'examples/' === data.page.url ? 'selected' : ''}>
                  <a href="${baseTabUrl + 'examples/'}">Examples</a>
                </nve-tabs-item>`
                }
              </nve-tabs>
            </section>
          `
              : ''
          }

          <!-- Main content area -->
          <main id="docs-main">
            <div id="doc-content" nve-layout="column gap:xl align:horizontal-stretch pad-bottom:xl" style="anchor-name: --doc-content-anchor;">
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
              `
                  : ''
              }

              <!-- Markdown page content -->
              ${data.content}

              <!-- Component status (Overview tab only) -->
              ${data.tag && !data.hideStatus && !(data.page.url.includes('api') || data.page.url.includes('examples')) ? `${elementStatus(data.tag)}` : ''}
            </div>
          </main>
            
          <!-- An 11ty transform that generates anchor links for the page content -->
          <!-- ANCHOR-GENERATOR -->
          
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
