import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import rule from './no-internal-external-imports.js';
import { browserTypescriptConfig, nodeTypescriptConfig } from '../configs/typescript.js';

const root = mkdtempSync(join(tmpdir(), 'internal-imports-'));
mkdirSync(join(root, 'src/internal/utils'), { recursive: true });
writeFileSync(join(root, 'package.json'), JSON.stringify({ name: '@nvidia-elements/widget' }));
after(() => rmSync(root, { recursive: true, force: true }));

const filename = join(root, 'src/internal/utils/helper.ts');
const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

test('keeps internal implementation independent of public package code', () => {
  const validImports = [
    './other.js',
    '../other.js',
    '../../internal/other.js',
    './styles.css?inline',
    '@nvidia-elements/widget/internal',
    '@nvidia-elements/widget/internal/utils/other.js',
    '@nvidia-elements/core/internal',
    '@nvidia-elements/forms/mixins',
    'lit',
    'node:path'
  ];
  const invalidImports = [
    '../../button/button.js',
    '../../index.js',
    '../../internal-other/helper.js',
    '../../button/styles.css?inline',
    '@nvidia-elements/widget',
    '@nvidia-elements/widget/button',
    '@nvidia-elements/widget/internal-other',
    '@nvidia-elements/widget/internal/../button',
    join(root, 'src/button/button.js')
  ];
  const importForms = [
    source => `import { Button } from '${source}';`,
    source => `import type { Button } from '${source}';`,
    source => `import '${source}';`,
    source => `export { Button } from '${source}';`,
    source => `export type { Button } from '${source}';`,
    source => `export * from '${source}';`,
    source => `export * as buttons from '${source}';`,
    source => `const buttons = import('${source}');`,
    source => `const buttons = import(\`${source}\`);`,
    source => `type Button = import('${source}').Button;`,
    source => `import buttons = require('${source}');`,
    source => `const buttons = require('${source}');`
  ];

  tester.run('no-internal-external-imports', rule, {
    valid: [
      ...validImports.flatMap(source => importForms.map(form => ({ filename, code: form(source) }))),
      { filename, code: 'const buttons = import(moduleName);' },
      { filename, code: 'const buttons = import(`../../${component}/index.js`);' },
      { filename, code: 'export const value = 1;' },
      { filename: join(root, 'src/button/button.ts'), code: "import '../index.js';" },
      { filename: join(root, 'src/internal/helper.test.ts'), code: "import '../button/button.js';" },
      { filename: join(root, 'src/internal/helper.test.visual.ts'), code: "import '../button/button.js';" },
      { filename: join(root, 'src/internal/helper.examples.ts'), code: "import '../button/button.js';" },
      { filename: join(root, 'src/internals/helper.ts'), code: "import './other.js';" },
      { filename: String.raw`C:\workspace\widget\src\internal\utils\helper.ts`, code: "import './other.js';" }
    ],
    invalid: [
      {
        filename: String.raw`C:\workspace\widget\src\internal\utils\helper.ts`,
        code: "import '../../button/button.js';",
        errors: [{ messageId: 'outside-internal' }]
      },
      ...invalidImports.flatMap(source =>
        importForms.map(form => ({
          filename,
          code: form(source),
          errors: [{ messageId: 'outside-internal', data: { source } }]
        }))
      ),
      {
        filename: join(root, 'src/internals/helper.ts'),
        code: "import '../button/button.js';",
        errors: [{ messageId: 'outside-internal' }]
      },
      {
        filename: join(root, 'src/internal/helper.d.ts'),
        code: "export type { Button } from '../button/button.js';",
        errors: [{ messageId: 'outside-internal' }]
      }
    ]
  });
});

test('enables the rule by default in browser and node TypeScript configs', () => {
  for (const configs of [browserTypescriptConfig, nodeTypescriptConfig]) {
    const config = configs.find(config => config.plugins?.['local-typescript']);
    assert.equal(config.plugins['local-typescript'].rules['no-internal-external-imports'], rule);
    assert.equal(config.rules['local-typescript/no-internal-external-imports'], 'error');
  }
});
