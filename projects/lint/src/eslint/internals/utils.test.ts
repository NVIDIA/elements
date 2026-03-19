// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { hasTemplateSyntax, parseSelector, hasMatchingChild, type HtmlNode, isNVElement } from './utils.js';

describe('hasTemplateSyntax', () => {
  it('should return false for node with no children', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div'
    };

    expect(hasTemplateSyntax(node)).toBe(false);
  });

  it('should return false for node with plain text children', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [{ type: 'Text', name: '', value: 'Plain text content' }]
    };

    expect(hasTemplateSyntax(node)).toBe(false);
  });

  it('should detect JavaScript template literals ${} syntax', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [{ type: 'Text', name: '', value: 'Hello ${name}' }]
    };

    expect(hasTemplateSyntax(node)).toBe(true);
  });

  it('should detect Handlebars/Vue/Angular {{ }} syntax', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [{ type: 'Text', name: '', value: 'Hello {{ name }}' }]
    };

    expect(hasTemplateSyntax(node)).toBe(true);
  });

  it('should detect Liquid/Jinja {% %} syntax', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [{ type: 'Text', name: '', value: '{% if condition %}content{% endif %}' }]
    };

    expect(hasTemplateSyntax(node)).toBe(true);
  });

  it('should detect template syntax in nested children', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [
        {
          type: 'Tag',
          name: 'span',
          children: [{ type: 'Text', name: '', value: 'Hello {{ world }}' }]
        }
      ]
    };

    expect(hasTemplateSyntax(node)).toBe(true);
  });

  it('should detect template syntax in deeply nested structures', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [
        {
          type: 'Tag',
          name: 'section',
          children: [
            {
              type: 'Tag',
              name: 'p',
              children: [{ type: 'Text', name: '', value: 'Value: ${value}' }]
            }
          ]
        }
      ]
    };

    expect(hasTemplateSyntax(node)).toBe(true);
  });

  it('should return false for node with empty children array', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: []
    };

    expect(hasTemplateSyntax(node)).toBe(false);
  });

  it('should handle mixed content with only plain text', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [
        { type: 'Text', name: '', value: 'Text 1' },
        { type: 'Tag', name: 'span', children: [{ type: 'Text', name: '', value: 'Text 2' }] },
        { type: 'Text', name: '', value: 'Text 3' }
      ]
    };

    expect(hasTemplateSyntax(node)).toBe(false);
  });

  it('should handle nodes without value property', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [{ type: 'Text', name: '' }]
    };

    expect(hasTemplateSyntax(node)).toBe(false);
  });
});

describe('parseSelector', () => {
  it('should parse simple tag selector', () => {
    const result = parseSelector('div');

    expect(result).toEqual({ tag: 'div' });
  });

  it('should parse tag with single attribute', () => {
    const result = parseSelector('input[type="text"]');

    expect(result).toEqual({
      tag: 'input',
      attrs: { type: 'text' }
    });
  });

  it('should parse tag with date attribute', () => {
    const result = parseSelector('input[type="date"]');

    expect(result).toEqual({
      tag: 'input',
      attrs: { type: 'date' }
    });
  });

  it('should parse tag with hyphenated names', () => {
    const result = parseSelector('my-element[data-attr="value"]');

    expect(result).toEqual({
      tag: 'my-element',
      attrs: { 'data-attr': 'value' }
    });
  });

  it('should handle uppercase tag names', () => {
    const result = parseSelector('DIV');

    expect(result).toEqual({ tag: 'DIV' });
  });

  it('should handle uppercase attribute names', () => {
    const result = parseSelector('INPUT[TYPE="text"]');

    expect(result).toEqual({
      tag: 'INPUT',
      attrs: { TYPE: 'text' }
    });
  });

  it('should return just tag for malformed attribute syntax', () => {
    const result = parseSelector('input[type=text]'); // missing quotes

    expect(result).toEqual({ tag: 'input' });
  });

  it('should return just tag for invalid selector format', () => {
    const result = parseSelector('div[attr1="val1"][attr2="val2"]'); // multiple attributes not supported

    expect(result).toEqual({ tag: 'div[attr1="val1"][attr2="val2"]' });
  });

  it('should not parse empty attribute values', () => {
    // The current regex requires at least one character in the attribute value
    const result = parseSelector('input[value=""]');

    expect(result).toEqual({ tag: 'input' });
  });

  it('should handle selector with no closing bracket', () => {
    const result = parseSelector('input[type="text"');

    expect(result).toEqual({ tag: 'input[type="text"' });
  });
});

describe('hasMatchingChild', () => {
  it('should return false for node with no children', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div'
    };

    expect(hasMatchingChild(node, 'span')).toBe(false);
  });

  it('should return false for empty children array', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: []
    };

    expect(hasMatchingChild(node, 'span')).toBe(false);
  });

  it('should find direct child matching tag', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [{ type: 'Tag', name: 'span' }]
    };

    expect(hasMatchingChild(node, 'span')).toBe(true);
  });

  it('should find nested child matching tag', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [
        {
          type: 'Tag',
          name: 'section',
          children: [{ type: 'Tag', name: 'input' }]
        }
      ]
    };

    expect(hasMatchingChild(node, 'input')).toBe(true);
  });

  it('should match tag case-insensitively', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [{ type: 'Tag', name: 'INPUT' }]
    };

    expect(hasMatchingChild(node, 'input')).toBe(true);
  });

  it('should find child matching tag and attribute', () => {
    interface HtmlNodeWithAttrs extends HtmlNode {
      attributes?: Array<{ key: { value: string }; value: { value: string } }>;
    }

    const inputNode: HtmlNodeWithAttrs = {
      type: 'Tag',
      name: 'input',
      children: [],
      attributes: [{ key: { value: 'type' }, value: { value: 'date' } }]
    };

    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [inputNode]
    };

    expect(hasMatchingChild(node, 'input[type="date"]')).toBe(true);
  });

  it('should not match child with different attribute value', () => {
    interface HtmlNodeWithAttrs extends HtmlNode {
      attributes?: Array<{ key: { value: string }; value: { value: string } }>;
    }

    const inputNode: HtmlNodeWithAttrs = {
      type: 'Tag',
      name: 'input',
      children: [],
      attributes: [{ key: { value: 'type' }, value: { value: 'text' } }]
    };

    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [inputNode]
    };

    expect(hasMatchingChild(node, 'input[type="date"]')).toBe(false);
  });

  it('should not match child missing required attribute', () => {
    interface HtmlNodeWithAttrs extends HtmlNode {
      attributes?: Array<{ key: { value: string }; value: { value: string } }>;
    }

    const inputNode: HtmlNodeWithAttrs = {
      type: 'Tag',
      name: 'input',
      children: [],
      attributes: []
    };

    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [inputNode]
    };

    expect(hasMatchingChild(node, 'input[type="date"]')).toBe(false);
  });

  it('should not match wrong tag even with correct attributes', () => {
    interface HtmlNodeWithAttrs extends HtmlNode {
      attributes?: Array<{ key: { value: string }; value: { value: string } }>;
    }

    const buttonNode: HtmlNodeWithAttrs = {
      type: 'Tag',
      name: 'button',
      children: [],
      attributes: [{ key: { value: 'type' }, value: { value: 'date' } }]
    };

    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [buttonNode]
    };

    expect(hasMatchingChild(node, 'input[type="date"]')).toBe(false);
  });

  it('should skip non-Tag type children', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [
        { type: 'Text', name: '', value: 'text content' },
        { type: 'Comment', name: '', value: 'comment' }
      ]
    };

    expect(hasMatchingChild(node, 'span')).toBe(false);
  });

  it('should find child in deeply nested structure', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [
        {
          type: 'Tag',
          name: 'section',
          children: [
            {
              type: 'Tag',
              name: 'article',
              children: [{ type: 'Tag', name: 'span' }]
            }
          ]
        }
      ]
    };

    expect(hasMatchingChild(node, 'span')).toBe(true);
  });

  it('should handle multiple children and find the matching one', () => {
    const node: HtmlNode = {
      type: 'Tag',
      name: 'div',
      children: [
        { type: 'Tag', name: 'button' },
        { type: 'Tag', name: 'input' },
        { type: 'Tag', name: 'span' }
      ]
    };

    expect(hasMatchingChild(node, 'input')).toBe(true);
  });
});

describe('isNVElement', () => {
  it('should determine if a tag is an NVElement', () => {
    expect(isNVElement('div')).toEqual(false);
    expect(isNVElement('nve-button')).toEqual(true);
  });
});
