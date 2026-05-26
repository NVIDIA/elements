import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import noDeepClassInheritance from './no-deep-class-inheritance.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: { allowDefaultProject: ['*.ts'] },
        tsconfigRootDir: import.meta.dirname
      }
    }
  });
});

test('defines rule metadata', () => {
  assert.equal(noDeepClassInheritance.meta.type, 'problem');
  assert.equal(noDeepClassInheritance.meta.name, 'no-deep-class-inheritance');
  assert.ok(noDeepClassInheritance.meta.messages['too-deep']);
});

test('valid: allows direct and depth-2 class inheritance', () => {
  tester.run('no-deep-class-inheritance', noDeepClassInheritance, {
    valid: [
      {
        filename: 'direct-lit.ts',
        code: `
          declare class LitElement {}

          class Badge extends LitElement {}
        `
      },
      {
        filename: 'depth-two.ts',
        code: `
          declare class LitElement {}

          class ButtonBase extends LitElement {}
          class SortButton extends ButtonBase {}
        `
      },
      {
        filename: 'event-target-root.ts',
        code: `
          class VideoGroup extends EventTarget {}
          class ManagedVideoGroup extends VideoGroup {}
        `
      }
    ],
    invalid: []
  });
});

test('valid: supports custom maxDepth and allowedRoots options', () => {
  tester.run('no-deep-class-inheritance', noDeepClassInheritance, {
    valid: [
      {
        filename: 'custom-max-depth.ts',
        options: [{ maxDepth: 3 }],
        code: `
          declare class LitElement {}

          class ButtonBase extends LitElement {}
          class SortButton extends ButtonBase {}
          class ToolbarSortButton extends SortButton {}
        `
      },
      {
        filename: 'custom-root.ts',
        options: [{ allowedRoots: ['BaseElement'] }],
        code: `
          class BaseElement {}
          class Control extends BaseElement {}
          class Color extends Control {}
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports classes deeper than maxDepth', () => {
  tester.run('no-deep-class-inheritance', noDeepClassInheritance, {
    valid: [],
    invalid: [
      {
        filename: 'too-deep.ts',
        code: `
          declare class LitElement {}

          class ButtonBase extends LitElement {}
          class SortButton extends ButtonBase {}
          class ToolbarSortButton extends SortButton {}
        `,
        errors: [
          {
            messageId: 'too-deep',
            data: {
              className: 'ToolbarSortButton',
              depth: '3',
              maxDepth: '2',
              chain: 'ToolbarSortButton -> SortButton -> ButtonBase -> LitElement'
            }
          }
        ]
      },
      {
        filename: 'custom-max-depth-invalid.ts',
        options: [{ maxDepth: 1, allowedRoots: ['BaseElement'] }],
        code: `
          class BaseElement {}

          class Control extends BaseElement {}
          class Radio extends Control {}
        `,
        errors: [
          {
            messageId: 'too-deep',
            data: {
              className: 'Radio',
              depth: '2',
              maxDepth: '1',
              chain: 'Radio -> Control -> BaseElement'
            }
          }
        ]
      }
    ]
  });
});
