import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { RuleTester } from 'eslint';
import tseslint from 'typescript-eslint';
import noInlineGpuUploadAllocation from './no-inline-gpu-upload-allocation.js';

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
  assert.equal(noInlineGpuUploadAllocation.meta.type, 'suggestion');
  assert.equal(noInlineGpuUploadAllocation.meta.name, 'no-inline-gpu-upload-allocation');
  assert.ok(noInlineGpuUploadAllocation.meta.messages['inline-upload-allocation']);
});

test('valid: accepts reusable upload sources and unrelated constructors', () => {
  tester.run('no-inline-gpu-upload-allocation', noInlineGpuUploadAllocation, {
    valid: [
      {
        filename: 'performance-rule.ts',
        code: `declare const queue: GPUQueue; queue.writeBuffer(buffer, 0, scratch);`
      },
      {
        filename: 'performance-rule.ts',
        code: `declare const queue: GPUQueue; queue.writeTexture(destination, pixels, layout, size);`
      },
      { filename: 'performance-rule.ts', code: `consume(new Uint32Array([1]));` },
      {
        filename: 'performance-rule.ts',
        code: `
          class Writer {
            writeBuffer(buffer: unknown, offset: number, source: Uint32Array) {
              consume(buffer, offset, source);
            }
            upload() {
              this.writeBuffer(buffer, 0, new Uint32Array([1]));
            }
          }
        `
      }
    ],
    invalid: []
  });
});

test('invalid: reports inline BufferSource allocations in GPU uploads', () => {
  tester.run('no-inline-gpu-upload-allocation', noInlineGpuUploadAllocation, {
    valid: [],
    invalid: [
      {
        filename: 'performance-rule.ts',
        code: `declare const queue: GPUQueue; queue.writeBuffer(buffer, 0, new Uint32Array([pickId]));`,
        errors: [
          {
            messageId: 'inline-upload-allocation',
            data: { kind: 'Uint32Array', method: 'writeBuffer' }
          }
        ]
      },
      {
        filename: 'performance-rule.ts',
        code: `declare const queue: GPUQueue; queue.writeTexture(destination, new Uint8Array([255]), layout, size);`,
        errors: [
          {
            messageId: 'inline-upload-allocation',
            data: { kind: 'Uint8Array', method: 'writeTexture' }
          }
        ]
      }
    ]
  });
});
