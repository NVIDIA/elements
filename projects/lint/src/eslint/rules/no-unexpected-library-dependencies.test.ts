// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { RuleTester } from 'eslint';
import json from '@eslint/json';
import type { JSRuleDefinition } from 'eslint';
import noUnexpectedLibraryDependencies from './no-unexpected-library-dependencies.js';

const rule = noUnexpectedLibraryDependencies as unknown as JSRuleDefinition;

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
    expect(noUnexpectedLibraryDependencies.meta).toBeDefined();
    expect(noUnexpectedLibraryDependencies.meta.type).toBe('problem');
    expect(noUnexpectedLibraryDependencies.meta.docs).toBeDefined();
    expect(noUnexpectedLibraryDependencies.meta.docs.description).toBe(
      'Disallow incorrect dependency usage of @nvidia-elements packages in consuming libraries.'
    );
    expect(noUnexpectedLibraryDependencies.meta.docs.recommended).toBe(true);
    expect(noUnexpectedLibraryDependencies.meta.docs.url).toBe(
      'https://NVIDIA.github.io/elements/docs/lint/'
    );
    expect(noUnexpectedLibraryDependencies.meta.schema).toBeDefined();
    expect(noUnexpectedLibraryDependencies.meta.messages).toBeDefined();
  });

  it('should allow owned dependencies', () => {
    tester.run('should allow owned dependencies', rule, {
      valid: [`{ "name": "@nvidia-elements/core" }`, `{ "name": "@nvidia-elements/lint" }`],
      invalid: []
    });
  });

  it('should allow application dependencies', () => {
    tester.run('should allow application dependencies', rule, {
      valid: [
        `{ "dependencies": { "@nvidia-elements/core": "0.0.0" } }`,
        `{ "name": "my-app", "dependencies": { "@nvidia-elements/core": "0.0.0" } }`,
        `{ "name": "my-app", "dependencies": { "@nvidia-elements/core": "workspace:*" } }`,
        `{ "name": "my-app", "dependencies": { "@nvidia-elements/core": "catalog:" } }`
      ],
      invalid: []
    });
  });

  it('should allow library peer dependencies', () => {
    tester.run('should allow library peer dependencies', rule, {
      valid: [
        `{ "name": "my-library", "exports": ["./index.js"], "peerDependencies": { "@nvidia-elements/core": "^0.0.0" } }`,
        `{ "name": "my-library", "exports": ["./index.js"], "peerDependencies": { "@nvidia-elements/core": "workspace:*" } }`,
        `{ "name": "my-library", "exports": ["./index.js"], "peerDependencies": { "@nvidia-elements/core": "catalog:" } }`
      ],
      invalid: []
    });
  });

  it('should report unexpected dependency type', () => {
    tester.run('should report unexpected dependency type', rule, {
      valid: [],
      invalid: [
        {
          filename: 'package.json',
          code: `{ "exports": ["./index.js"], "dependencies": { "@nvidia-elements/core": "^0.0.0" } }`,
          errors: [{ messageId: 'unexpected-dependency-type' }]
        },
        {
          filename: 'package.json',
          code: `{ "exports": ["./index.js"], "dependencies": { }, "peerDependencies": { }, "devDependencies": { "@nvidia-elements/core": "0.0.0" } }`,
          errors: [{ messageId: 'unexpected-dependency-type' }]
        }
      ]
    });
  });

  it('should report unexpected dependency missing', () => {
    tester.run('should report unexpected dependency missing', rule, {
      valid: [],
      invalid: [
        {
          filename: 'package.json',
          code: `{ "exports": ["./index.js"], "dependencies": { }, "peerDependencies": { }, "devDependencies": { } }`,
          errors: [{ messageId: 'unexpected-dependency-missing' }]
        }
      ]
    });
  });

  it('should report unexpected dependency pinned', () => {
    tester.run('should report unexpected dependency pinned', rule, {
      valid: [],
      invalid: [
        {
          filename: 'package.json',
          code: `{ "exports": ["./index.js"], "peerDependencies": { "@nvidia-elements/core": "0.0.0" } }`,
          errors: [{ messageId: 'unexpected-dependency-pinned' }]
        }
      ]
    });
  });
});
