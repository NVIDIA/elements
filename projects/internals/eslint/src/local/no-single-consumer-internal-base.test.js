import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import noSingleConsumerInternalBase from './no-single-consumer-internal-base.js';

let tester;
let rootDir;

beforeEach(() => {
  rootDir = mkdtempSync(join(tmpdir(), 'no-single-consumer-internal-base-'));
  tester = new RuleTester({
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  });
});

afterEach(() => {
  rmSync(rootDir, { recursive: true, force: true });
});

test('defines rule metadata', () => {
  assert.equal(noSingleConsumerInternalBase.meta.type, 'problem');
  assert.equal(noSingleConsumerInternalBase.meta.name, 'no-single-consumer-internal-base');
  assert.ok(noSingleConsumerInternalBase.meta.messages['single-consumer']);
});

test('valid: internal abstract base with two implementation consumers', () => {
  const filename = createFile('src/internal/media-toggle-button.ts', 'export abstract class MediaToggleButton {}');
  createFile(
    'src/media-pause-button/media-pause-button.ts',
    "import { MediaToggleButton } from '../internal/media-toggle-button.js';\nexport class MediaPauseButton extends MediaToggleButton {}"
  );
  createFile(
    'src/media-mute-button/media-mute-button.ts',
    "import { MediaToggleButton } from '../internal/media-toggle-button.js';\nexport class MediaMuteButton extends MediaToggleButton {}"
  );

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [
      {
        filename,
        code: 'export abstract class MediaToggleButton {}',
        options: [{ rootDir }]
      }
    ],
    invalid: []
  });
});

test('valid: counts named alias and namespace import subclasses', () => {
  const filename = createFile('src/internal/media-button.ts', 'export abstract class MediaButton {}');
  createFile(
    'src/media-pause-button/media-pause-button.ts',
    "import { MediaButton as InternalMediaButton } from '../internal/media-button.js';\nexport class MediaPauseButton extends InternalMediaButton {}"
  );
  createFile(
    'src/media-mute-button/media-mute-button.ts',
    "import * as media from '../internal/media-button.js';\nexport class MediaMuteButton extends media.MediaButton {}"
  );

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [
      {
        filename,
        code: 'export abstract class MediaButton {}',
        options: [{ rootDir }]
      }
    ],
    invalid: []
  });
});

test('valid: counts default import subclasses for default-exported bases', () => {
  const filename = createFile('src/internal/media-button.ts', 'export default abstract class MediaButton {}');
  createFile(
    'src/media-pause-button/media-pause-button.ts',
    "import InternalMediaButton from '../internal/media-button.js';\nexport class MediaPauseButton extends InternalMediaButton {}"
  );
  createFile(
    'src/media-mute-button/media-mute-button.ts',
    "import MediaBase from '../internal/media-button.js';\nexport class MediaMuteButton extends MediaBase {}"
  );

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [
      {
        filename,
        code: 'export default abstract class MediaButton {}',
        options: [{ rootDir }]
      }
    ],
    invalid: []
  });
});

test('valid: internal base consumed through package internal barrel', () => {
  const filename = createFile('src/internal/base/widget.ts', 'export class WidgetBase {}');
  createFile('package.json', JSON.stringify({ name: '@nvidia-elements/core' }));
  createFile('src/internal/index.ts', "export * from './base/widget.js';");
  createFile(
    'src/button/button.ts',
    "import { WidgetBase } from '@nvidia-elements/core/internal';\nexport class Button extends WidgetBase {}"
  );
  createFile(
    'src/icon-button/icon-button.ts',
    "import { WidgetBase } from '@nvidia-elements/core/internal';\nexport class IconButton extends WidgetBase {}"
  );

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [
      {
        filename,
        code: 'export class WidgetBase {}',
        options: [{ rootDir }]
      }
    ],
    invalid: []
  });
});

test('valid: infers package root from filename', () => {
  const filename = createFile('src/internal/base/widget.ts', 'export class WidgetBase {}');
  createFile('package.json', JSON.stringify({ name: '@nvidia-elements/core' }));
  createFile('src/internal/index.ts', "export * from './base/widget.js';");
  createFile(
    'src/button/button.ts',
    "import { WidgetBase } from '@nvidia-elements/core/internal';\nexport class Button extends WidgetBase {}"
  );
  createFile(
    'src/tag/tag.ts',
    "import { WidgetBase } from '@nvidia-elements/core/internal';\nexport class Tag extends WidgetBase {}"
  );

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [
      {
        filename,
        code: 'export class WidgetBase {}'
      }
    ],
    invalid: []
  });
});

test('valid: ignores non-internal and non-base internal classes', () => {
  const componentFilename = createFile('src/media-button/media-button.ts', 'export abstract class MediaButton {}');
  const helperFilename = createFile('src/internal/media-target-observer.ts', 'export class MediaTargetObserver {}');

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [
      {
        filename: componentFilename,
        code: 'export abstract class MediaButton {}',
        options: [{ rootDir }]
      },
      {
        filename: helperFilename,
        code: 'export class MediaTargetObserver {}',
        options: [{ rootDir }]
      }
    ],
    invalid: []
  });
});

test('invalid: internal abstract base with one importing consumer', () => {
  const filename = createFile('src/internal/media-button.ts', 'export abstract class MediaButton {}');
  createFile(
    'src/media-pause-button/media-pause-button.ts',
    "import { MediaButton } from '../internal/media-button.js';\nexport class MediaPauseButton extends MediaButton {}"
  );

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [],
    invalid: [
      {
        filename,
        code: 'export abstract class MediaButton {}',
        options: [{ rootDir }],
        errors: [
          {
            messageId: 'single-consumer',
            data: { name: 'MediaButton', count: '1', minimum: '2' }
          }
        ]
      }
    ]
  });
});

test('invalid: ignores imports that do not subclass the base', () => {
  const filename = createFile('src/internal/media-button.ts', 'export abstract class MediaButton {}');
  createFile(
    'src/internal/media-button.types.ts',
    "import type { MediaButton } from './media-button.js';\nexport type MediaButtonLike = MediaButton;"
  );
  createFile(
    'src/media-pause-button/media-pause-button.ts',
    "import { MediaButton } from '../internal/media-button.js';\nexport class MediaPauseButton extends MediaButton {}"
  );

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [],
    invalid: [
      {
        filename,
        code: 'export abstract class MediaButton {}',
        options: [{ rootDir }],
        errors: [
          {
            messageId: 'single-consumer',
            data: { name: 'MediaButton', count: '1', minimum: '2' }
          }
        ]
      }
    ]
  });
});

test('invalid: internal abstract base with only a same-file subclass', () => {
  const code = `
    export abstract class MediaButton {}
    export class MediaPauseButton extends MediaButton {}
  `;
  const filename = createFile('src/internal/media-button.ts', code);

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [],
    invalid: [
      {
        filename,
        code,
        options: [{ rootDir }],
        errors: [
          {
            messageId: 'single-consumer',
            data: { name: 'MediaButton', count: '1', minimum: '2' }
          }
        ]
      }
    ]
  });
});

test('invalid: internal base name with no consumers', () => {
  const filename = createFile('src/internal/base-overlay.ts', 'export class BaseOverlay {}');

  tester.run('no-single-consumer-internal-base', noSingleConsumerInternalBase, {
    valid: [],
    invalid: [
      {
        filename,
        code: 'export class BaseOverlay {}',
        options: [{ rootDir }],
        errors: [
          {
            messageId: 'single-consumer',
            data: { name: 'BaseOverlay', count: '0', minimum: '2' }
          }
        ]
      }
    ]
  });
});

function createFile(relativePath, content) {
  const filename = join(rootDir, relativePath);
  mkdirSync(filename.slice(0, filename.lastIndexOf('/')), { recursive: true });
  writeFileSync(filename, content);
  return filename;
}
