import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import noGpuUploadInLoop from './no-gpu-upload-in-loop.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } }
  });
});

test('defines rule metadata', () => {
  assert.equal(noGpuUploadInLoop.meta.type, 'suggestion');
  assert.equal(noGpuUploadInLoop.meta.name, 'no-gpu-upload-in-loop');
  assert.ok(noGpuUploadInLoop.meta.messages['repeated-upload']);
});

test('valid: accepts single uploads and separately declared callbacks', () => {
  tester.run('no-gpu-upload-in-loop', noGpuUploadInLoop, {
    valid: [
      { code: `queue.writeBuffer(buffer, 0, bytes);` },
      { code: `for (const value of values) writer.writeBuffer(value);` },
      {
        code: `
          const upload = bytes => queue.writeBuffer(buffer, 0, bytes);
          for (const bytes of batches) schedule(upload, bytes);
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports queue uploads in loops and collection callbacks', () => {
  tester.run('no-gpu-upload-in-loop', noGpuUploadInLoop, {
    valid: [],
    invalid: [
      {
        code: `for (const range of ranges) queue.writeBuffer(buffer, range.offset, range.bytes);`,
        errors: [{ messageId: 'repeated-upload', data: { method: 'writeBuffer' } }]
      },
      {
        code: `images.forEach(image => queue.writeTexture(destination, image, layout, size));`,
        errors: [{ messageId: 'repeated-upload', data: { method: 'writeTexture' } }]
      },
      {
        code: `while (pending()) queue['writeBuffer'](buffer, 0, next());`,
        errors: [{ messageId: 'repeated-upload', data: { method: 'writeBuffer' } }]
      }
    ]
  });
});
