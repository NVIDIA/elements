import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { RuleTester, Linter } from 'eslint';
import parser from '@typescript-eslint/parser';
import requireUnitTest from './require-unit-test.js';
import { browserTypescriptConfig, nodeTypescriptConfig } from '../configs/typescript.js';

test('requires sibling unit tests for TypeScript implementations', t => {
  const directory = mkdtempSync(join(tmpdir(), 'nve-unit-test-rule-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const filename = name => join(directory, 'src', name);
  mkdirSync(filename('internal'), { recursive: true });
  writeFileSync(filename('covered.test.ts'), '');
  writeFileSync(filename('visual-only.test.visual.ts'), '');
  mkdirSync(filename('directory.test.ts'));

  const tester = new RuleTester({ languageOptions: { parser } });
  const code = 'export function run() { return 1; }';
  const invalid = (name, source = code) => ({
    filename: filename(name),
    code: source,
    errors: [
      {
        messageId: 'missing-unit-test',
        data: { sourceFile: name.split('/').at(-1), testFile: name.split('/').at(-1).replace(/\.ts$/, '.test.ts') }
      }
    ]
  });

  tester.run('require-unit-test', requireUnitTest, {
    valid: [
      { filename: filename('covered.ts'), code },
      ...[
        'run.test.ts',
        'run.test.axe.ts',
        'run.test.visual.ts',
        'run.test.ssr.ts',
        'run.test.lighthouse.ts',
        'run.test.bench.ts',
        'run.test.webgpu.ts',
        'run.test.render.ts',
        'run.examples.ts',
        'test/helper.ts',
        'tests/helper.ts',
        '__tests__/helper.ts',
        'scripts/run.ts',
        'scripts/nested/run.ts',
        'scripts\\nested\\run.ts',
        'define.ts',
        'bundle.ts',
        'run.js',
        'run.tsx'
      ].map(name => ({ filename: filename(name), code })),
      { filename: filename('types.d.ts'), code: 'declare const value: number;' },
      {
        filename: filename('types.ts'),
        code: 'export interface Value { name: string } export type Name = string;'
      },
      {
        filename: filename('default-interface.ts'),
        code: 'export default interface Value { name: string }'
      },
      {
        filename: filename('global-types.ts'),
        code: `
          import type { IconName } from './icons.js';
          export type Status = 'success' | 'danger';
          export interface Point { x: number; y: number }
          export const statusIcons: Record<string, IconName> = { success: 'checkmark-circle' } as const;
          declare global {
            interface HTMLElement { 'nve-text': string }
            var CustomElementRegistry: { new (): CustomElementRegistry; prototype: CustomElementRegistry };
          }
        `
      },
      {
        filename: filename('type-exports.ts'),
        code: `
          export type * from './types.js';
          export type { Value } from './value.js';
          export { type Point } from './point.js';
        `
      },
      {
        filename: filename('ambient.ts'),
        code: 'export declare const value: number; export declare function run(): void;'
      },
      {
        filename: filename('index.ts'),
        code: "import './define.js'; export * from './run.js'; export { run } from './run.js';"
      },
      { filename: filename('empty.ts'), code: '// No implementation' },
      ...[
        'export const BUTTON_TYPE_ELEMENTS = ["nve-button", "nve-icon-button"] as const;',
        'export const PARENT_ELEMENT_CONTRACTS: Readonly<Record<string, readonly string[]>> = { "nve-card-content": ["nve-card"] };',
        'export const config = { enabled: true, limit: -1, value: null, nested: [1, { label: "name" }] } satisfies Record<string, unknown>;',
        'const config = <const>{ enabled: true }; export { config };',
        'export const value = 1, name = "example";',
        'export default { enabled: true, values: [] };',
        'export const label = `example`;',
        'export const values = new Set([1, 2]);',
        'export const values = new Map([["name", "example"]]);',
        'export const values = new Set();',
        'export const values = new Map();',
        'import { BUTTON_TYPE_ELEMENTS } from "./button-elements.js"; export const INTERACTIVE_ELEMENTS: ReadonlySet<string> = new Set([...BUTTON_TYPE_ELEMENTS, "button"]);',
        'import values from "./values.js"; export const list = [...values, "extra"];',
        'export interface Value {} export const value = 1;'
      ].map(code => ({ filename: filename('data.ts'), code })),
      { filename: filename('types-only.ts'), code: "import type { Value } from './types.js'; export type { Value };" }
    ],
    invalid: [
      invalid('missing.ts'),
      invalid('internal/helper.ts'),
      invalid('internal/scripts/run.ts'),
      invalid('scripts-extra/run.ts'),
      invalid('scripts.ts'),
      invalid('index.ts'),
      invalid('visual-only.ts'),
      invalid('directory.ts'),
      invalid('class.ts', 'export class Example {}'),
      invalid('default-class.ts', 'export default class Example {}'),
      invalid('types-with-function.ts', 'export type Value = string; export function run() { return 1; }'),
      invalid('types-with-call.ts', 'export interface Value {} const value = calculate(); export type { value };'),
      invalid('computed.ts', 'export const value = calculate();'),
      invalid('default.ts', 'export default () => 1;'),
      invalid('enum.ts', 'export enum Value { First }'),
      invalid('mixed.ts', 'export const data = [1, 2]; export function run() { return data; }'),
      invalid('callback.ts', 'export const config = { run: () => 1 };'),
      invalid('method.ts', 'export const config = { run() { return 1; } };'),
      invalid('getter.ts', 'export const config = { get value() { return 1; } };'),
      invalid('computed-key.ts', 'export const config = { [key()]: 1 };'),
      invalid('nested-call.ts', 'export const config = { values: [getValue()] };'),
      invalid('spread.ts', 'export const config = { ...defaults };'),
      invalid('array-spread.ts', 'export const config = [...defaults];'),
      invalid('reference.ts', 'export const config = { value: externalValue };'),
      invalid('mutable.ts', 'export let value = 1;'),
      invalid('constructor.ts', 'export const value = new CustomConfig([1, 2]);'),
      invalid('set-call.ts', 'export const values = new Set(getValues());'),
      invalid('set-callback.ts', 'export const values = new Set([() => 1]);'),
      invalid('set-spread-call.ts', 'export const values = new Set([...getValues()]);'),
      invalid('map-call.ts', 'export const values = new Map([["name", getValue()]]);'),
      invalid('shadowed-set.ts', 'import { Set } from "./custom.js"; export const values = new Set([1]);'),
      invalid('shadowed-map.ts', 'const Map = factory; export const values = new Map([[1, 2]]);'),
      invalid('namespace-spread.ts', 'import * as values from "./values.js"; export const list = [...values];'),
      invalid('template.ts', 'export const label = `value: ${getValue()}`;'),
      invalid('default-config.ts', 'export default { run: () => 1 };'),
      invalid('side-effect.ts', 'console.log("ready");')
    ]
  });
});

test('directory exclusions are relative to the checkout rather than its ancestors', t => {
  const directory = mkdtempSync(join(tmpdir(), 'nve-unit-test-checkout-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const code = 'export function run() { return 1; }';

  for (const ancestor of ['test', 'tests', '__tests__', 'src/scripts']) {
    const cwd = join(directory, ancestor, 'checkout');
    mkdirSync(join(cwd, 'src'), { recursive: true });
    const linter = new Linter({ cwd });
    const config = [
      {
        files: ['**/*.ts'],
        languageOptions: { parser },
        plugins: { local: { rules: { 'require-unit-test': requireUnitTest } } },
        rules: { 'local/require-unit-test': 'error' }
      }
    ];
    for (const filename of [
      'src/scripts/run.ts',
      'src/scripts/nested/run.ts',
      'src/test/helper.ts',
      'src/tests/helper.ts',
      'src/__tests__/helper.ts'
    ]) {
      assert.deepEqual(linter.verify(code, config, { filename: join(cwd, filename) }), [], `${ancestor}: ${filename}`);
    }
    for (const filename of ['src/run.ts', 'src/internal/scripts/run.ts']) {
      const messages = linter.verify(code, config, { filename: join(cwd, filename) });
      assert.equal(messages.length, 1, `${ancestor}: ${filename}`);
      assert.equal(messages[0].messageId, 'missing-unit-test');
    }
  }
});

test('both TypeScript configs register the rule and enable errors', () => {
  for (const configs of [browserTypescriptConfig, nodeTypescriptConfig]) {
    const config = configs.find(entry => entry.plugins?.['local-typescript']);
    assert.equal(config.plugins['local-typescript'].rules['require-unit-test'], requireUnitTest);
    assert.equal(config.rules['local-typescript/require-unit-test'], 'error');
  }
});

test('ESLint overrides can promote missing unit tests to errors', t => {
  const directory = mkdtempSync(join(tmpdir(), 'nve-unit-test-config-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const filename = join(directory, 'missing.ts');
  const linter = new Linter({ cwd: directory });
  const messages = linter.verify(
    'export function run() { return 1; }',
    [
      {
        files: ['**/*.ts'],
        languageOptions: { parser },
        plugins: { 'local-typescript': { rules: { 'require-unit-test': requireUnitTest } } },
        rules: { 'local-typescript/require-unit-test': 'error' }
      }
    ],
    { filename }
  );
  assert.equal(messages.length, 1);
  assert.equal(messages[0].ruleId, 'local-typescript/require-unit-test');
  assert.equal(messages[0].severity, 2);
});
