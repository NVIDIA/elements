// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import json from '@eslint/json';
import type { JSRuleDefinition } from 'eslint';
import noDeprecatedPackages from './no-deprecated-packages.js';

const rule = noDeprecatedPackages as unknown as JSRuleDefinition;

describe('noUnexpectedLibraryDependencies', () => {
  let tester: RuleTester;

  beforeEach(() => {
    tester = new RuleTester({
      plugins: {
        json
      },
      language: 'json/json'
    });
  });

  it('should define rule metadata', () => {
    expect(noDeprecatedPackages.meta).toBeDefined();
    expect(noDeprecatedPackages.meta.type).toBe('problem');
    expect(noDeprecatedPackages.meta.docs).toBeDefined();
    expect(noDeprecatedPackages.meta.docs.description).toBe('Disallow usage of deprecated packages.');
    expect(noDeprecatedPackages.meta.docs.recommended).toBe(true);
    expect(noDeprecatedPackages.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noDeprecatedPackages.meta.schema).toBeDefined();
    expect(noDeprecatedPackages.meta.messages).toBeDefined();
    expect(noDeprecatedPackages.meta.messages['unexpected-deprecated-package']).toBe(
      'Use of deprecated package {{package}}, upgrade to {{alternative}} instead.'
    );
  });

  it('should allow current dependencies', () => {
    tester.run('should allow current dependencies', rule, {
      valid: [
        `{ "dependencies": { "@nvidia-elements/core": "0.0.0" } }`,
        `{ "devDependencies": { "@nvidia-elements/core": "0.0.0" } }`,
        `{ "peerDependencies": { "@nvidia-elements/core": "0.0.0" } }`
      ],
      invalid: []
    });
  });

  it('should not allow deprecated dependencies', () => {
    tester.run('should not allow deprecated dependencies', rule, {
      valid: [],
      invalid: [
        {
          code: `{ "dependencies": { "@mlv/elements": "0.0.0" } }`,
          filename: 'package.json',
          errors: [
            {
              messageId: 'unexpected-deprecated-package',
              data: { package: '@mlv/elements', alternative: '@nvidia-elements/core' }
            }
          ]
        },
        {
          code: `{ "devDependencies": { "@mlv/elements": "0.0.0" } }`,
          filename: 'package.json',
          errors: [
            {
              messageId: 'unexpected-deprecated-package',
              data: { package: '@mlv/elements', alternative: '@nvidia-elements/core' }
            }
          ]
        },
        {
          code: `{ "peerDependencies": { "@mlv/elements": "0.0.0" } }`,
          filename: 'package.json',
          errors: [
            {
              messageId: 'unexpected-deprecated-package',
              data: { package: '@mlv/elements', alternative: '@nvidia-elements/core' }
            }
          ]
        }
      ]
    });
  });
});
