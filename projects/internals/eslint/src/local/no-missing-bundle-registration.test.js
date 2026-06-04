import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import noMissingBundleRegistration from './no-missing-bundle-registration.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  });
});

async function createBundleFixture(components) {
  const directory = await mkdtemp(join(tmpdir(), 'nve-bundle-rule-'));
  const sourceDirectory = join(directory, 'src');
  await mkdir(sourceDirectory, { recursive: true });

  await Promise.all(
    components.map(async component => {
      const componentDirectory = join(sourceDirectory, component);
      await mkdir(componentDirectory);
      await writeFile(join(componentDirectory, 'define.ts'), '');
    })
  );

  return join(sourceDirectory, 'bundle.ts');
}

test('defines rule metadata', () => {
  assert.equal(noMissingBundleRegistration.meta.type, 'problem');
  assert.equal(noMissingBundleRegistration.meta.name, 'no-missing-bundle-registration');
  assert.ok(noMissingBundleRegistration.meta.messages['missing-bundle-registration']);
  assert.ok(noMissingBundleRegistration.meta.messages['missing-bundle-export']);
});

test('valid: allows registered components with matching bundle exports', async () => {
  const filename = await createBundleFixture(['button']);

  tester.run('no-missing-bundle-registration', noMissingBundleRegistration, {
    valid: [
      {
        filename,
        code: `
          import '@nvidia-elements/core/button/define.js';
          export * from '@nvidia-elements/core/button';
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports registered components without matching bundle exports', async () => {
  const filename = await createBundleFixture(['button']);

  tester.run('no-missing-bundle-registration', noMissingBundleRegistration, {
    valid: [],
    invalid: [
      {
        filename,
        code: "import '@nvidia-elements/core/button/define.js';",
        errors: [
          {
            messageId: 'missing-bundle-export',
            data: {
              component: 'button',
              prefix: '@nvidia-elements/core'
            }
          }
        ]
      }
    ]
  });
});
