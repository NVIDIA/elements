import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import json from '@eslint/json';
import noUnpinnedDependencyRanges from './no-unpinned-dependency-ranges.js';

let tester;

beforeEach(() => {
  tester = new RuleTester({
    plugins: {
      json
    },
    language: 'json/json'
  });
});

test('defines rule metadata', () => {
  assert.equal(noUnpinnedDependencyRanges.meta.type, 'problem');
  assert.equal(noUnpinnedDependencyRanges.meta.name, 'no-unpinned-dependency-ranges');
  assert.ok(noUnpinnedDependencyRanges.meta.messages['unpinned-range']);
});

test('internal packages', () => {
  tester.run('allowed-protocols', noUnpinnedDependencyRanges, {
    valid: [
      // internal packages must have pinned versions for all dependencies
      {
        filename: 'package.json',
        code: '{ "private": true, "dependencies": { "foo": "1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "private": true, "devDependencies": { "foo": "1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "private": true, "peerDependencies": { "foo": "1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "private": true, "optionalDependencies": { "foo": "1.2.3" } }'
      },
      // internal packages must have pinned versions or can be a workspace links
      {
        filename: 'package.json',
        code: '{ "private": true, "devDependencies": { "foo": "workspace:*" } }'
      },
      {
        filename: 'package.json',
        code: '{ "private": true, "dependencies": { "foo": "catalog:" } }'
      }
    ],
    invalid: [
      // internal packages cannot have unpinned ranges
      {
        filename: 'package.json',
        code: '{ "private": true, "dependencies": { "foo": "^1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "private": true, "devDependencies": { "foo": "~1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "private": true, "peerDependencies": { "foo": "^1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "private": true, "optionalDependencies": { "foo": "~1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      }
    ]
  });
});

test('published packages', () => {
  tester.run('allowed-protocols', noUnpinnedDependencyRanges, {
    valid: [
      // published packages must have pinned versions for dev dependencies
      {
        filename: 'package.json',
        code: '{ "name": "@nvidia-elements/example", "devDependencies": { "foo": "1.2.3" } }'
      },
      // published packages with runtime dependencies must have a range specifier for downstream consumer deduplication
      {
        filename: 'package.json',
        code: '{ "dependencies": { "foo": "~1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "dependencies": { "foo": "^1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "peerDependencies": { "foo": "~1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "peerDependencies": { "foo": "^1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "optionalDependencies": { "foo": "~1.2.3" } }'
      },
      {
        filename: 'package.json',
        code: '{ "optionalDependencies": { "foo": "^1.2.3" } }'
      },
      // published packages must use "catalog:publish" for runtime dependencies
      {
        filename: 'package.json',
        code: '{ "dependencies": { "foo": "catalog:publish" } }'
      },
      {
        filename: 'package.json',
        code: '{ "peerDependencies": { "foo": "catalog:publish" } }'
      },
      {
        filename: 'package.json',
        code: '{ "optionalDependencies": { "foo": "catalog:publish" } }'
      },
      {
        filename: 'package.json',
        code: '{ "devDependencies": { "foo": "catalog:publish" } }'
      },
      // published packages with workspace references must have a range specifier for downstream consumer deduplication
      {
        filename: 'package.json',
        code: '{ "dependencies": { "foo": "workspace:^" } }'
      },
      {
        filename: 'package.json',
        code: '{ "peerDependencies": { "foo": "workspace:^" } }'
      },
      {
        filename: 'package.json',
        code: '{ "optionalDependencies": { "foo": "workspace:^" } }'
      }
    ],
    invalid: [
      // public packages cannot have pinned dependencies, this prevents consumers from deduplicating dependencies
      {
        filename: 'package.json',
        code: '{ "name": "@nvidia-elements/example", "dependencies": { "foo": "1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "name": "@nvidia-elements/example", "peerDependencies": { "foo": "1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      // public packages cannot have unpinned dev dependencies
      {
        filename: 'package.json',
        code: '{ "name": "@nvidia-elements/example", "devDependencies": { "foo": "^1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "name": "@nvidia-elements/example", "devDependencies": { "foo": "~1.2.3" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      // published packages cannot have undefined ranges for workspace dependencies
      {
        filename: 'package.json',
        code: '{ "dependencies": { "foo": "workspace:*" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "peerDependencies": { "foo": "workspace:*" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "optionalDependencies": { "foo": "workspace:*" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      // published packages cannot have use catalog references for dependencies and must use "catalog:publish"
      {
        filename: 'package.json',
        code: '{ "dependencies": { "foo": "catalog:" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "peerDependencies": { "foo": "catalog:" } }',
        errors: [{ messageId: 'unpinned-range' }]
      },
      {
        filename: 'package.json',
        code: '{ "optionalDependencies": { "foo": "catalog:" } }',
        errors: [{ messageId: 'unpinned-range' }]
      }
    ]
  });
});
