// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { build as viteBuild } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const MCP_UI_SOURCE_DIR = resolve(import.meta.dirname, '../src/mcp/ui');
const MCP_UI_OUTPUT_DIR = resolve(import.meta.dirname, '../dist/mcp/ui');
const MCP_UI_ENTRYPOINTS = ['api-icons-list.html', 'api-tokens-list.html', 'examples-render.html'];
const MCP_UI_INLINE_MODULE_ID = 'virtual:mcp-ui-inline';

// Knip and other tools load vite.config.ts to discover inputs. Keep this build
// in an explicit script so loading that config does not rewrite dist outputs.

async function buildMcpUiResources() {
  for (const entrypoint of MCP_UI_ENTRYPOINTS) {
    await viteBuild({
      root: MCP_UI_SOURCE_DIR,
      base: './',
      configFile: false,
      publicDir: false,
      plugins: [bundleInlineHtmlModulesPlugin(), viteSingleFile()],
      build: {
        outDir: MCP_UI_OUTPUT_DIR,
        emptyOutDir: false,
        rollupOptions: {
          input: resolve(MCP_UI_SOURCE_DIR, entrypoint)
        }
      }
    });
  }
}

function bundleInlineHtmlModulesPlugin() {
  let moduleCode = '';
  return {
    name: 'bundle-inline-html-modules',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const match = html.match(/<script type="module">\s*([\s\S]*?)<\/script>/);
        if (!match) return html;
        moduleCode = match[1] ?? '';
        return html.replace(match[0], `<script type="module" src="${MCP_UI_INLINE_MODULE_ID}"></script>`);
      }
    },
    resolveId(id) {
      if (id === MCP_UI_INLINE_MODULE_ID) return id;
      return null;
    },
    load(id) {
      return id === MCP_UI_INLINE_MODULE_ID ? moduleCode : null;
    }
  };
}

await buildMcpUiResources();
