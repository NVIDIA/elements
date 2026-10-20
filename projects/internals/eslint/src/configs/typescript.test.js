import assert from 'node:assert/strict';
import { test } from 'node:test';
import { browserTypescriptConfig, nodeTypescriptConfig } from './typescript.js';
import maxJsdocLength from '../local/max-jsdoc-length.js';

test('registers and enables the member JSDoc limit in shared TypeScript configs', () => {
  for (const configs of [browserTypescriptConfig, nodeTypescriptConfig]) {
    const config = configs.find(item => item.plugins?.['local-typescript']);
    assert.equal(config.plugins['local-typescript'].rules['max-jsdoc-length'], maxJsdocLength);
    assert.deepEqual(config.rules['local-typescript/max-jsdoc-length'], ['warn', { maxLength: 400 }]);
    assert.equal(config.plugins['local-typescript'].rules['max-property-jsdoc-length'], undefined);
    assert.equal(config.rules['local-typescript/max-property-jsdoc-length'], undefined);
  }
});
