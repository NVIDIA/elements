import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { RuleTester } from 'eslint';
import json from '@eslint/json';
import requireHtmlCustomDataContract from './require-html-custom-data-contract.js';

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
  assert.equal(requireHtmlCustomDataContract.meta.type, 'problem');
  assert.equal(requireHtmlCustomDataContract.meta.name, 'require-html-custom-data-contract');
  assert.ok(requireHtmlCustomDataContract.meta.messages['missing-export']);
});

test('requires HTML Custom Data contributions to be exported', () => {
  tester.run('require-html-custom-data-contract', requireHtmlCustomDataContract, {
    valid: [
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": ["./dist/editor/custom-data.json"] } },
          "exports": { "./editor-data.json": "./dist/editor/custom-data.json" }
        }`
      },
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": ["./dist/editor/custom-data.json"] } },
          "exports": { "./editor-data.json": ["./dist/editor/custom-data.json"] }
        }`
      },
      {
        filename: 'package.json',
        code: '{ "name": "@nvidia-elements/example" }'
      },
      {
        filename: 'package.json',
        code: `{
          "name": "@internals/example",
          "contributes": { "html": { "customData": ["./dist/editor/custom-data.json"] } }
        }`
      }
    ],
    invalid: [
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": ["./dist/data.html.json"] } }
        }`,
        errors: [{ messageId: 'missing-export' }]
      },
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": [] } }
        }`,
        errors: [{ messageId: 'invalid-contribution' }]
      },
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": ["./dist/data.html.json", 1] } }
        }`,
        errors: [{ messageId: 'invalid-contribution' }]
      },
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": ["../dist/data.html.json"] } }
        }`,
        errors: [{ messageId: 'invalid-contribution' }]
      },
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": ["/package/dist/data.html.json"] } }
        }`,
        errors: [{ messageId: 'invalid-contribution' }]
      },
      {
        filename: 'package.json',
        code: `{
          "name": "@nvidia-elements/example",
          "contributes": { "html": { "customData": ["./dist/editor/custom-data.json"] } },
          "exports": { "./editor-data.json": "./dist/other-data.json" }
        }`,
        errors: [{ messageId: 'missing-export' }]
      }
    ]
  });
});
