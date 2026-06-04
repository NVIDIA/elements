// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import examplesRenderHtml from './examples-render.html?raw';
import iconsListHtml from './api-icons-list.html?raw';
import tokensListHtml from './api-tokens-list.html?raw';

export interface UIResource {
  name: string;
  mimeType: string;
  resourceUri: string;
  description: string;
  getHtml: () => string;
}

export const MCP_UI_MIME_TYPE = 'text/html;profile=mcp-app';

export const examplesRenderResource: UIResource = {
  name: 'nve-mcp-examples-render',
  mimeType: MCP_UI_MIME_TYPE,
  resourceUri: 'ui://elements/example-preview',
  description:
    'Use this MCP app when an Elements example or template should be shown to the user. It renders validated nve-* HTML from examples_get or examples_render so users can inspect component layout, theme, and validation messages visually instead of reading markup only.',
  getHtml: () => examplesRenderHtml
};

export const iconsListResource: UIResource = {
  name: 'nve-mcp-api-icons-list',
  mimeType: MCP_UI_MIME_TYPE,
  resourceUri: 'ui://elements/icons-list',
  description:
    'Use this MCP app with api_icons_list results when the user is choosing an icon for nve-icon or nve-icon-button. It provides searchable icon names, visual previews, and copyable <nve-icon name="..."></nve-icon> markup.',
  getHtml: () => iconsListHtml
};

export const tokensListResource: UIResource = {
  name: 'nve-mcp-api-tokens-list',
  mimeType: MCP_UI_MIME_TYPE,
  resourceUri: 'ui://elements/tokens-list',
  description:
    'Use this MCP app with api_tokens_list results when the user is selecting design tokens or CSS custom properties. It groups tokens by purpose, previews color, spacing, typography, radius, and shadow values, and provides copyable var(--nve-*) references.',
  getHtml: () => tokensListHtml
};

export const uiResources: UIResource[] = [examplesRenderResource, iconsListResource, tokensListResource];
