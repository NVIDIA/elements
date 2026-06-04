// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MCP_UI_MIME_TYPE, uiResources } from './index.js';

const DIST_MCP_UI_DIR = resolve(import.meta.dirname, '../../../dist/mcp/ui');

describe('MCP UI resources', () => {
  it('should expose HTML app resources with stable metadata', () => {
    [
      {
        name: 'nve-mcp-examples-render',
        resourceUri: 'ui://elements/example-preview',
        title: 'Elements Example Preview',
        tool: 'examples_'
      },
      {
        name: 'nve-mcp-api-icons-list',
        resourceUri: 'ui://elements/icons-list',
        title: 'Elements Icons List',
        tool: 'api_icons_list'
      },
      {
        name: 'nve-mcp-api-tokens-list',
        resourceUri: 'ui://elements/tokens-list',
        title: 'Elements Token Explorer',
        tool: 'api_tokens_list'
      }
    ].forEach(({ name, resourceUri, title, tool }, index) => {
      const resource = uiResources[index];
      expect(resource).toMatchObject({ name, resourceUri, mimeType: MCP_UI_MIME_TYPE });
      expect(resource?.description).toContain('Use this MCP app');
      expect(resource?.description).toContain(tool);
      expect(resource?.getHtml()).toContain('<!doctype html>');
      expect(resource?.getHtml()).toContain(`<title>${title}</title>`);
    });
  });

  it('should use the official MCP app client module', () => {
    uiResources.forEach(resource => {
      const html = resource.getHtml();
      expect(html).toContain("import { App, applyDocumentTheme } from '@modelcontextprotocol/ext-apps';");
      expect(html).toContain('function applyHostContext(context)');
      expect(html).toContain('const app = new App(');
      expect(html).toContain("app.addEventListener('hostcontextchanged'");
      expect(html).toContain('await app.connect();');
      expect(html).toContain('applyHostContext(app.getHostContext());');
      expect(html).toContain("app.addEventListener('toolresult'");
      expect(html).not.toContain('./client.ts');
      expect(html).not.toContain('createApp(');
      expect(html).not.toContain('connectApp(');
      expect(html).not.toContain('new Client');
      expect(html).not.toContain("window.addEventListener('message'");
      expect(html).not.toContain('window.parent.postMessage');
    });
  });

  it('should build each app resource as single-file HTML', () => {
    const htmlFiles = readdirSync(DIST_MCP_UI_DIR).filter(fileName => fileName.endsWith('.html'));
    expect(htmlFiles).toHaveLength(3);

    htmlFiles.forEach(fileName => {
      const html = readFileSync(resolve(DIST_MCP_UI_DIR, fileName), 'utf-8');
      expect(html).not.toMatch(/<script[^>]+src=/);
      expect(html).not.toMatch(/<link[^>]+stylesheet/);
      expect(html).not.toContain('@nvidia-elements/themes/index.css');
      expect(html).not.toContain('./client.ts');
    });
  });
});
