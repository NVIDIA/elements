import assert from 'node:assert/strict';
import { test } from 'node:test';
import { performanceConfig } from './performance.js';

test('enables performance rules for production TypeScript', () => {
  assert.equal(performanceConfig.length, 2);
  const [pluginConfig, ruleConfig] = performanceConfig;
  assert.deepEqual(ruleConfig.files, ['src/**/*.ts', 'src/**/*.tsx']);
  assert.equal(ruleConfig.ignores.includes('**/*.test*.ts'), true);
  assert.deepEqual(Object.keys(pluginConfig.plugins['local-performance'].rules).sort(), [
    'no-gpu-upload-in-loop',
    'no-hot-path-buffer-allocation',
    'no-hot-path-collection-allocation',
    'no-inline-gpu-upload-allocation',
    'prefer-direct-typed-array-iteration',
    'require-animation-frame-cleanup',
    'require-gpu-resource-cleanup',
    'require-observer-disconnect'
  ]);
  assert.equal(
    Object.values(ruleConfig.rules).every(severity => severity === 'error'),
    true
  );
});
