// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ESLint, type Linter } from 'eslint';
import { elementsHtmlConfig } from '../configs/html.js';

/** @private Internal APIs, not supported for external use */

export interface TemplateLintMessage {
  id: string;
  severity: 'warn' | 'error';
  message: string;
  suggestions: {
    desc: string;
    fix: {
      range: [number, number];
      text: string;
    };
    messageId?: string | undefined;
  }[];
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

export async function lintPlaygroundTemplate(code: string): Promise<TemplateLintMessage[]> {
  // extra restrictions/rules as agents rarely use these advanced APIs correctly for playground generation out of context of an established project
  // '@nvidia-elements/lint/no-unexpected-style-customization': ['error']
  const rules: Partial<Linter.RulesRecord> = {
    '@nvidia-elements/lint/no-unexpected-global-attribute-value': ['error', { 'nve-layout': ['@', '|', '&', 'xx'] }],
    '@nvidia-elements/lint/no-missing-slotted-elements': ['error', { 'nve-card': { required: ['nve-card-content'] } }],
    '@nvidia-elements/lint/no-missing-gap-space': ['error']
  };
  return lintString(code, rules);
}

export async function lintTemplate(code: string): Promise<TemplateLintMessage[]> {
  return lintString(code);
}

async function lintString(code: string, rules: Partial<Linter.RulesRecord> = {}): Promise<TemplateLintMessage[]> {
  if (!code?.trim()) {
    return [
      {
        id: 'empty-template',
        severity: 'warn',
        message: 'Template is empty. Add Elements components to validate.',
        suggestions: [],
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 1
      }
    ];
  }

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: elementsHtmlConfig.languageOptions,
      plugins: elementsHtmlConfig.plugins,
      rules: {
        ...elementsHtmlConfig.rules,
        ...rules
      }
    }
  });

  const results = await eslint.lintText(code);
  return results
    .flatMap(result => result.messages)
    .map(message => {
      return {
        id: message.messageId ?? '',
        severity: message.severity === 2 ? 'error' : 'warn',
        message: message.message,
        suggestions:
          message.suggestions?.map(suggestion => ({
            desc: suggestion.desc,
            fix: {
              range: suggestion.fix.range,
              text: suggestion.fix.text
            },
            messageId: suggestion.messageId
          })) ?? [],
        line: message.line,
        column: message.column,
        endLine: message.endLine ?? message.line,
        endColumn: message.endColumn ?? message.column
      };
    });
}
