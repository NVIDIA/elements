/* eslint-env node */
/* global process */

import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { renderBaseHead, renderDocsNav } from './common.js';
import { elementSummary, elementStatus, elementTable } from '../templates/api.js';

export const BASE_URL = join('/', process.env.PAGES_BASE_URL ?? '', '/');

const styles = readFileSync(new URL('./docs.css', import.meta.url), 'utf-8');

/**
 * Provides mirrored layout to mimic existing Storybook docs navigation.
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
        <nve-page>
          <nve-page-header slot="header">
            <nve-logo slot="prefix" size="sm"></nve-logo>
            <a slot="prefix" href=".">Elements</a>
            <nve-button container="flat" ${data.page.url.includes('docs') ? 'selected' : ''}><a href="docs/about/getting-started/">Catalog</a></nve-button>
            <nve-button container="flat"><a href="https://elements-stage.nvidia.com/ui/elements-playground/browse.html" target="_blank">Playground</a></nve-button>
            <nve-button container="flat" ${data.page.url.includes('starters') ? 'selected' : ''}><a href="starters/">Starters</a></nve-button>
            <nve-button container="flat"><a href="https://github.com/NVIDIA/elements" target="_blank">Gitlab</a></nve-button>
            <nve-button slot="suffix" id="system-options-panel-btn" container="flat" id="dropdown-btn">System Themes</nve-button>
          </nve-page-header>
          <nve-page-panel slot="left" id="sidenav-panel">
            <nve-page-panel-content>
              <nvd-search id="docs-search" base-url="${BASE_URL}"></nvd-search>
              ${renderDocsNav(data)}
            </nve-page-panel-content>
          </nve-page-panel>
          <nve-resize-handle slot="left" min="3" max="300" value="300" step="20" orientation="vertical"></nve-resize-handle>
          <main nve-layout="column align:center">
            <div nve-layout="row align:horizontal-center full" style="gap: 5rem;">
              <div id="doc-content" nve-layout="column gap:lg align:horizontal-stretch pad-bottom:xl">
                ${data.tag ? `<h1 nve-text="display emphasis mkd" data-pagefind-meta="tag:${data.tag}">${data.title}</h1>${elementSummary(data.tag)}` : ''}
                ${data.content}
                ${data.tag ? `${elementStatus(data.tag)}${elementTable(data.tag)}` : ''}
                ${data.associatedElements?.length ? data.associatedElements.map(tag => elementTable(tag)).join('') : ''}
              </div>
              <!-- ANCHOR-GENERATOR -->
            </div>
          </main>
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
