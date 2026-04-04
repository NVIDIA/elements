// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { type Schema } from './tools.js';

export const eslintSchema: Schema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    severity: { type: 'string' },
    message: { type: 'string' },
    line: { type: 'number' },
    column: { type: 'number' },
    endLine: { type: 'number' },
    endColumn: { type: 'number' },
    fix: { type: 'object' },
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          desc: { type: 'string' },
          fix: {
            type: 'object',
            properties: {
              range: { type: 'array', items: { type: 'number' } },
              text: { type: 'string' }
            }
          },
          messageId: { type: 'string' }
        }
      }
    }
  },
  required: ['id', 'severity', 'message', 'line', 'column', 'endLine', 'endColumn'],
  additionalProperties: false
};

export const jsonReportSchema: Schema = {
  type: 'object',
  patternProperties: {
    '.*': {
      type: 'object',
      properties: {
        message: { type: 'string' },
        status: { type: 'string', enum: ['success', 'danger', 'info', 'warning', 'log'] }
      },
      required: ['message', 'status']
    }
  }
};
