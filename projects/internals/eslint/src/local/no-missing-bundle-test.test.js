import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import noMissingBundleTest from './no-missing-bundle-test.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  });
});

async function createBundleFixture(lighthouseComponents, lighthouseSource) {
  const directory = await mkdtemp(join(tmpdir(), 'nve-bundle-test-rule-'));
  const sourceDirectory = join(directory, 'src');
  await mkdir(sourceDirectory, { recursive: true });
  await writeFile(join(directory, 'package.json'), JSON.stringify({ name: '@nvidia-elements/core' }));

  if (lighthouseComponents !== undefined || lighthouseSource !== undefined) {
    let source = lighthouseSource;
    const imports = lighthouseComponents
      ?.map(component => `import '@nvidia-elements/core/${component}/define.js';`)
      .join('\n');
    source ??= `
        const report = lighthouseRunner.getReport('js-modules', /* html */\`
          <script type="module">
            ${imports}
          </script>
        \`);
      `;
    await writeFile(join(sourceDirectory, 'index.test.lighthouse.ts'), source);
  }

  return join(sourceDirectory, 'bundle.ts');
}

test('defines rule metadata', () => {
  assert.equal(noMissingBundleTest.meta.type, 'problem');
  assert.equal(noMissingBundleTest.meta.name, 'no-missing-bundle-test');
  assert.ok(noMissingBundleTest.meta.messages['missing-bundle-test']);
  assert.ok(noMissingBundleTest.meta.messages['missing-lighthouse-test']);
  assert.deepEqual(noMissingBundleTest.meta.schema[0].required, ['lighthouseTestFile']);
});

test('invalid: reports a missing configured Lighthouse test file', async () => {
  const filename = await createBundleFixture();

  tester.run('no-missing-bundle-test', noMissingBundleTest, {
    valid: [],
    invalid: [
      {
        filename,
        code: "import '@nvidia-elements/core/button/define.js';",
        options: [{ lighthouseTestFile: 'index.test.lighthouse.ts' }],
        errors: [
          {
            messageId: 'missing-lighthouse-test',
            data: { testFile: 'index.test.lighthouse.ts' }
          }
        ]
      }
    ]
  });
});

test('valid: allows bundle registrations measured by the aggregate Lighthouse test', async () => {
  const filename = await createBundleFixture(['button']);

  tester.run('no-missing-bundle-test', noMissingBundleTest, {
    valid: [
      {
        filename,
        code: "import '@nvidia-elements/core/button/define.js';",
        options: [{ lighthouseTestFile: 'index.test.lighthouse.ts' }]
      }
    ],
    invalid: []
  });
});

test('invalid: reports bundle registrations missing from the aggregate Lighthouse test', async () => {
  const filename = await createBundleFixture(['button']);

  tester.run('no-missing-bundle-test', noMissingBundleTest, {
    valid: [],
    invalid: [
      {
        filename,
        code: `
          import '@nvidia-elements/core/button/define.js';
          import '@nvidia-elements/core/card/define.js';
        `,
        options: [{ lighthouseTestFile: 'index.test.lighthouse.ts' }],
        errors: [
          {
            messageId: 'missing-bundle-test',
            data: {
              component: 'card',
              prefix: '@nvidia-elements/core',
              testFile: 'index.test.lighthouse.ts'
            }
          }
        ]
      }
    ]
  });
});

test('invalid: ignores matching lighthouse paths in module-script comments and string literals', async () => {
  const filename = await createBundleFixture(
    [],
    `
      const report = lighthouseRunner.getReport('js-modules', /* html */\`
        <script type="module">
          // import '@nvidia-elements/core/button/define.js';
          const importPath = '@nvidia-elements/core/card/define.js';
        </script>
      \`);
    `
  );

  tester.run('no-missing-bundle-test', noMissingBundleTest, {
    valid: [],
    invalid: [
      {
        filename,
        code: `
          import '@nvidia-elements/core/button/define.js';
          import '@nvidia-elements/core/card/define.js';
        `,
        options: [{ lighthouseTestFile: 'index.test.lighthouse.ts' }],
        errors: [
          {
            messageId: 'missing-bundle-test',
            data: {
              component: 'button',
              prefix: '@nvidia-elements/core',
              testFile: 'index.test.lighthouse.ts'
            }
          },
          {
            messageId: 'missing-bundle-test',
            data: {
              component: 'card',
              prefix: '@nvidia-elements/core',
              testFile: 'index.test.lighthouse.ts'
            }
          }
        ]
      }
    ]
  });
});
