// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

export interface HtmlNode {
  type: string;
  name: string;
  children?: HtmlNode[];
  value?: string;
}

/**
 * Check if a node contains templating syntax that might dynamically add elements
 */
export function hasTemplateSyntax(node: HtmlNode): boolean {
  const templatePatterns = [
    /\$\{[^}]*\}/, // ${} - JavaScript template literals, some frameworks
    /\{\{[^}]*\}\}/, // {{ }} - Handlebars, Vue, Angular, etc.
    /\{%[^%]*%\}/ // {% %} - Liquid, Jinja, etc.
  ];

  function checkNodeForTemplate(n: HtmlNode): boolean {
    // Check text content
    if (n.type === 'Text' && n.value) {
      const text = n.value;
      if (templatePatterns.some(pattern => pattern.test(text))) {
        return true;
      }
    }

    // Recursively check children
    if (n.children && Array.isArray(n.children)) {
      return n.children.some((child: HtmlNode) => checkNodeForTemplate(child));
    }

    return false;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.some((child: HtmlNode) => checkNodeForTemplate(child));
  }

  return false;
}

/**
 * Parse a selector like 'input[type="date"]' into tag and attributes
 */
export function parseSelector(selector: string): { tag: string; attrs?: Record<string, string> } {
  const match = selector.match(/^([a-z-]+)(?:\[([^\]]+)\])?$/i);
  if (!match) {
    return { tag: selector };
  }

  const tag = match[1]!;
  const attrString = match[2];

  if (!attrString) {
    return { tag };
  }

  // Parse attribute like 'type="date"'
  const attrMatch = attrString.match(/^([a-z-]+)="([^"]+)"$/i);
  if (!attrMatch) {
    return { tag };
  }

  return {
    tag,
    attrs: {
      [attrMatch[1]!]: attrMatch[2]!
    }
  };
}

/**
 * Check if a node has a child that matches the given selector
 */
export function hasMatchingChild(node: HtmlNode, selector: string): boolean {
  const { tag, attrs } = parseSelector(selector);

  function checkNode(n: HtmlNode): boolean {
    if (n.type === 'Tag' && n.name.toLowerCase() === tag.toLowerCase()) {
      if (attrs) {
        for (const [attrName, attrValue] of Object.entries(attrs)) {
          const attr = findAttr(n, attrName);
          if (!attr || attr.value?.value !== attrValue) {
            return false;
          }
        }
      }
      return true;
    }

    if (n.children && Array.isArray(n.children)) {
      return n.children.some((child: HtmlNode) => checkNode(child));
    }

    return false;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.some((child: HtmlNode) => checkNode(child));
  }

  return false;
}

export function isNVElement(tagName: string): boolean {
  return tagName?.startsWith('nve-');
}
