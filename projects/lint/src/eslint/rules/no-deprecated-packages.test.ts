// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import json from '@eslint/json';
import type { JSRuleDefinition } from 'eslint';
import noDeprecatedPackages, { DEPRECATED_PACKAGES } from './no-deprecated-packages.js';

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
    expect(noDeprecatedPackages.meta.docs.url).toContain('/docs/lint/');
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

  it('should cover every package documented in the migration guide', () => {
    expect(DEPRECATED_PACKAGES['@nve/elements']).toBe('@nvidia-elements/core');
    expect(DEPRECATED_PACKAGES['@nve/styles']).toBe('@nvidia-elements/styles');
    expect(DEPRECATED_PACKAGES['@nve/themes']).toBe('@nvidia-elements/themes');
    expect(DEPRECATED_PACKAGES['@nve/monaco']).toBe('@nvidia-elements/monaco');
    expect(DEPRECATED_PACKAGES['@nve-labs/forms']).toBe('@nvidia-elements/forms');
    expect(DEPRECATED_PACKAGES['@nve-labs/cli']).toBe('@nvidia-elements/cli');
    expect(DEPRECATED_PACKAGES['@nve-labs/code']).toBe('@nvidia-elements/code');
    expect(DEPRECATED_PACKAGES['@nve-labs/create']).toBe('@nvidia-elements/create');
    expect(DEPRECATED_PACKAGES['@nve-labs/markdown']).toBe('@nvidia-elements/markdown');
    expect(DEPRECATED_PACKAGES['@nve-labs/media']).toBe('@nvidia-elements/media');
    expect(DEPRECATED_PACKAGES['@nve-labs/lint']).toBe('@nvidia-elements/lint');
    expect(DEPRECATED_PACKAGES['@maglev/elements']).toBe(
      '@nvidia-elements/core + @nvidia-elements/themes + @nvidia-elements/styles'
    );
    expect(DEPRECATED_PACKAGES['@nve/testing']).toBe('project-supported test utilities');
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

  it('should not allow deprecated packages from the migration guide', () => {
    tester.run('should not allow deprecated packages from the migration guide', rule, {
      valid: [],
      invalid: [
        {
          code: `{ "dependencies": { "@nve/elements": "1.0.0", "@nve-labs/forms": "1.0.0" } }`,
          filename: 'package.json',
          errors: [
            {
              messageId: 'unexpected-deprecated-package',
              data: { package: '@nve/elements', alternative: '@nvidia-elements/core' }
            },
            {
              messageId: 'unexpected-deprecated-package',
              data: { package: '@nve-labs/forms', alternative: '@nvidia-elements/forms' }
            }
          ]
        },
        {
          code: `{ "devDependencies": { "@nve/testing": "1.0.0" } }`,
          filename: 'package.json',
          errors: [
            {
              messageId: 'unexpected-deprecated-package',
              data: { package: '@nve/testing', alternative: 'project-supported test utilities' }
            }
          ]
        },
        {
          code: `{ "peerDependencies": { "@maglev/elements": "1.0.0" } }`,
          filename: 'package.json',
          errors: [
            {
              messageId: 'unexpected-deprecated-package',
              data: {
                package: '@maglev/elements',
                alternative: '@nvidia-elements/core + @nvidia-elements/themes + @nvidia-elements/styles'
              }
            }
          ]
        }
      ]
    });
  });
});
