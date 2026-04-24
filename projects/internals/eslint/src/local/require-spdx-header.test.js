import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import css from '@eslint/css';
import requireSpdxHeader from './require-spdx-header.js';

const CURRENT_YEAR = new Date().getFullYear();

const VALID_TS =
  '// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
  '// SPDX-License-Identifier: Apache-2.0\n\n' +
  'export const a = 1;\n';

const VALID_CSS =
  '/* SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. */\n' +
  '/* SPDX-License-Identifier: Apache-2.0 */\n\n' +
  ':host { color: red; }\n';

let tsTester;
let cssTester;

beforeEach(() => {
  tsTester = new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    }
  });
  cssTester = new RuleTester({
    plugins: { css },
    language: 'css/css'
  });
});

test('defines rule metadata', () => {
  assert.equal(requireSpdxHeader.meta.type, 'problem');
  assert.equal(requireSpdxHeader.meta.name, 'require-spdx-header');
  assert.equal(requireSpdxHeader.meta.fixable, 'code');
  for (const id of [
    'missing-header',
    'missing-copyright',
    'missing-identifier',
    'invalid-copyright',
    'invalid-identifier',
    'wrong-comment-style'
  ]) {
    assert.ok(requireSpdxHeader.meta.messages[id], `missing messageId: ${id}`);
  }
});

test('ts: valid headers', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [
      { filename: 'src/badge/badge.ts', code: VALID_TS },
      {
        filename: 'src/badge/badge.ts',
        code:
          '// SPDX-FileCopyrightText: Copyright (c) 2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ],
    invalid: []
  });
});

test('ts: missing-header', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.ts',
        code: 'export const a = 1;\n',
        errors: [{ messageId: 'missing-header' }],
        output:
          `// SPDX-FileCopyrightText: Copyright (c) ${CURRENT_YEAR} NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n` +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ]
  });
});

test('ts: missing-identifier, preserves existing year', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.ts',
        code:
          '// SPDX-FileCopyrightText: Copyright (c) 2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          'export const a = 1;\n',
        errors: [{ messageId: 'missing-identifier' }],
        output:
          '// SPDX-FileCopyrightText: Copyright (c) 2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ]
  });
});

test('ts: missing-copyright', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.ts',
        code: '// SPDX-License-Identifier: Apache-2.0\nexport const a = 1;\n',
        errors: [{ messageId: 'missing-copyright' }],
        output:
          `// SPDX-FileCopyrightText: Copyright (c) ${CURRENT_YEAR} NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n` +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ]
  });
});

test('ts: invalid-identifier rewrites to Apache-2.0', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.ts',
        code:
          '// SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          '// SPDX-License-Identifier: MIT\n\n' +
          'export const a = 1;\n',
        errors: [{ messageId: 'invalid-identifier' }],
        output:
          '// SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ]
  });
});

test('ts: invalid-copyright rewrites holder but preserves existing year', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.ts',
        code:
          '// SPDX-FileCopyrightText: Copyright (c) 2023 Some Other Entity. All rights reserved.\n' +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n',
        errors: [{ messageId: 'invalid-copyright' }],
        output:
          '// SPDX-FileCopyrightText: Copyright (c) 2023 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ]
  });
});

test('ts: shebang line is allowed before the SPDX header', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [
      {
        filename: 'src/cli.ts',
        code:
          '#!/usr/bin/env node\n\n' +
          '// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ],
    invalid: [
      {
        filename: 'src/cli.ts',
        code: '#!/usr/bin/env node\n\nexport const a = 1;\n',
        errors: [{ messageId: 'missing-header' }],
        output:
          '#!/usr/bin/env node\n\n' +
          `// SPDX-FileCopyrightText: Copyright (c) ${CURRENT_YEAR} NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n` +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ]
  });
});

test('ts: wrong-comment-style rewrites block to line comments', () => {
  tsTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.ts',
        code:
          '/* SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. */\n' +
          '/* SPDX-License-Identifier: Apache-2.0 */\n\n' +
          'export const a = 1;\n',
        errors: [{ messageId: 'wrong-comment-style' }],
        output:
          '// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.\n' +
          '// SPDX-License-Identifier: Apache-2.0\n\n' +
          'export const a = 1;\n'
      }
    ]
  });
});

test('css: valid header', () => {
  cssTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [{ filename: 'src/badge/badge.css', code: VALID_CSS }],
    invalid: []
  });
});

test('css: missing-header', () => {
  cssTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.css',
        code: ':host { color: red; }\n',
        errors: [{ messageId: 'missing-header' }],
        output:
          `/* SPDX-FileCopyrightText: Copyright (c) ${CURRENT_YEAR} NVIDIA CORPORATION & AFFILIATES. All rights reserved. */\n` +
          '/* SPDX-License-Identifier: Apache-2.0 */\n\n' +
          ':host { color: red; }\n'
      }
    ]
  });
});

test('css: invalid-identifier rewrites to Apache-2.0', () => {
  cssTester.run('require-spdx-header', requireSpdxHeader, {
    valid: [],
    invalid: [
      {
        filename: 'src/badge/badge.css',
        code:
          '/* SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. */\n' +
          '/* SPDX-License-Identifier: MIT */\n\n' +
          ':host { color: red; }\n',
        errors: [{ messageId: 'invalid-identifier' }],
        output:
          '/* SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. */\n' +
          '/* SPDX-License-Identifier: Apache-2.0 */\n\n' +
          ':host { color: red; }\n'
      }
    ]
  });
});
