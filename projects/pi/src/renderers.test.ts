// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { ToolDefinition } from '@earendil-works/pi-coding-agent';
import type { TSchema } from 'typebox';
import type { ElementsToolDetails } from './results.js';
import { renderProjectValidationResult, renderValidationResult } from './renderers.js';

type Renderer = NonNullable<ToolDefinition<TSchema, ElementsToolDetails>['renderResult']>;
type Theme = Parameters<Renderer>[2];
type Context = Parameters<Renderer>[3];

const theme = {
  fg: (_color: string, text: string) => text
} as Theme;
const context = {} as Context;

function render(component: ReturnType<Renderer>): string {
  return component.render(120).join('\n');
}

describe('Elements Pi renderers', () => {
  it('should render structured validation summaries', () => {
    const component = renderValidationResult(
      {
        content: [{ type: 'text', text: 'details' }],
        details: { toolName: 'elements_api_validate', result: { summary: { files: 2, errors: 1, warnings: 3 } } }
      },
      { expanded: false, isPartial: false },
      theme
    );
    expect(render(component)).toContain('1 error · 3 warnings · 2 files');
  });

  it('should render markdown validation summaries and expanded output', () => {
    const component = renderValidationResult(
      {
        content: [{ type: 'text', text: '2 files, 0 errors, 1 warnings\nwarning details' }],
        details: { toolName: 'elements_api_validate' }
      },
      { expanded: true, isPartial: false },
      theme
    );
    expect(render(component)).toContain('0 errors · 1 warning · 2 files');
    expect(render(component)).toContain('warning details');
  });

  it('should render successful validation summaries', () => {
    const component = renderValidationResult(
      {
        content: [{ type: 'text', text: '1 file, 0 errors, 0 warnings' }],
        details: { toolName: 'elements_api_validate', result: { summary: { files: 1, errors: 0, warnings: 0 } } }
      },
      { expanded: false, isPartial: false },
      theme
    );
    expect(render(component)).toContain('0 errors · 0 warnings · 1 file');
  });

  it('should render validation progress and raw fallback', () => {
    const partial = renderValidationResult(
      { content: [], details: { toolName: 'elements_api_validate' } },
      { expanded: false, isPartial: true },
      theme
    );
    const fallback = renderValidationResult(
      { content: [{ type: 'text', text: 'unknown' }], details: { toolName: 'elements_api_validate' } },
      { expanded: false, isPartial: false },
      theme
    );
    expect(render(partial)).toContain('Validating');
    expect(render(fallback)).toContain('unknown');
  });

  it('should render project health summaries', () => {
    const component = renderProjectValidationResult(
      {
        content: [{ type: 'text', text: 'report' }],
        details: {
          toolName: 'elements_project_validate',
          result: {
            dependencies: { status: 'success', message: 'Dependencies valid' },
            versions: { status: 'warning', message: 'Update available' },
            config: { status: 'danger', message: 'Config invalid' }
          }
        }
      },
      { expanded: true, isPartial: false },
      theme,
      context
    );
    expect(render(component)).toContain('1 passed · 1 warning · 1 failed');
    expect(render(component)).toContain('Config invalid');
  });

  it('should render project progress and raw fallback', () => {
    const partial = renderProjectValidationResult(
      { content: [], details: { toolName: 'elements_project_validate' } },
      { expanded: false, isPartial: true },
      theme,
      context
    );
    const fallback = renderProjectValidationResult(
      { content: [{ type: 'text', text: 'unknown' }], details: { toolName: 'elements_project_validate' } },
      { expanded: false, isPartial: false },
      theme,
      context
    );
    expect(render(partial)).toContain('Checking');
    expect(render(fallback)).toContain('unknown');
  });
});
