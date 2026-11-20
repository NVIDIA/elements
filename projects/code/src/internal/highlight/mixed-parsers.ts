// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parseMixed, type Parser, type TreeCursor } from '@lezer/common';
import { parser as css } from '@lezer/css';
import { configureNesting, parser as htmlParser } from '@lezer/html';
import { parser as script } from '@lezer/javascript';

function getTemplateOverlay(template: { from: number; to: number; cursor(): TreeCursor }) {
  const overlay: { from: number; to: number }[] = [];
  let from = template.from + 1;
  const cursor = template.cursor();
  if (cursor.firstChild()) {
    do {
      if (cursor.from > from) overlay.push({ from, to: cursor.from });
      from = cursor.to;
    } while (cursor.nextSibling());
  }
  if (from < template.to - 1) overlay.push({ from, to: template.to - 1 });
  return overlay;
}

// Apply the HTML or CSS parser only to literal text so ${...} stays in the surrounding script parser.
const taggedTemplates = parseMixed((node, input) => {
  if (node.name !== 'TaggedTemplateExpression') return null;
  const tag = node.node.getChild('Expression');
  const template = tag?.nextSibling;
  if (tag?.name !== 'VariableName' || template?.name !== 'TemplateString') return null;

  const name = input.read(tag.from, tag.to);
  if (name !== 'html' && name !== 'css') return null;

  return { parser: name === 'html' ? html : css, overlay: getTemplateOverlay(template) };
});

export const javascript: Parser = script.configure({ wrap: taggedTemplates });
export const typescript: Parser = script.configure({ dialect: 'ts', wrap: taggedTemplates });
export const tsx: Parser = script.configure({ dialect: 'ts jsx', wrap: taggedTemplates });
export { css };

export const html: Parser = htmlParser.configure({
  wrap: configureNesting([
    { tag: 'script', parser: javascript },
    { tag: 'style', parser: css }
  ])
});
