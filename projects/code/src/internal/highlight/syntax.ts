// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { NodeProp, TreeFragment, type Parser, type SyntaxNodeRef, type Tree } from '@lezer/common';
import { highlightTree, tagHighlighter, tags } from '@lezer/highlight';
import { getParser } from './language-registry.js';

export type SyntaxSpan = [start: number, end: number, category: string];
export type BracketPairColoring = 'shared' | 'independent' | null;

export interface ParsedCodeTree {
  text: string;
  parser?: Parser;
  tree?: Tree;
  fragments?: readonly TreeFragment[];
}

export interface ParsedCode extends ParsedCodeTree {
  ranges: SyntaxSpan[];
}

const highlighter = tagHighlighter([
  { tag: tags.invalid, class: 'invalid' },
  { tag: tags.comment, class: 'comment' },
  { tag: tags.escape, class: 'escape' },
  { tag: tags.regexp, class: 'regex' },
  { tag: tags.string, class: 'string' },
  { tag: tags.number, class: 'number' },
  { tag: [tags.bool, tags.null, tags.atom], class: 'literal' },
  { tag: tags.keyword, class: 'keyword' },
  { tag: tags.standard(tags.variableName), class: 'builtin' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], class: 'function' },
  { tag: tags.className, class: 'class' },
  { tag: tags.tagName, class: 'tag' },
  { tag: tags.attributeName, class: 'attribute' },
  { tag: tags.typeName, class: 'type' },
  { tag: tags.propertyName, class: 'property' },
  { tag: tags.variableName, class: 'variable' },
  { tag: [tags.url, tags.link], class: 'link' },
  { tag: [tags.meta, tags.heading], class: 'meta' },
  { tag: tags.punctuation, class: 'punctuation' }
]);

export function syntaxRanges(tree: Tree, from = 0, to = tree.length): SyntaxSpan[] {
  const ranges: SyntaxSpan[] = [];
  highlightTree(
    tree,
    highlighter,
    (start, end, category) => {
      if (start < end) ranges.push([start, end, category.split(' ')[0]!]);
    },
    from,
    to
  );
  return ranges;
}

function changedRange(before: string, after: string) {
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let oldEnd = before.length;
  let newEnd = after.length;
  while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  return { fromA: start, toA: oldEnd, fromB: start, toB: newEnd };
}

export function parseCodeTree(language: string, text: string, previous?: ParsedCodeTree): ParsedCodeTree {
  const parser = getParser(language);
  if (!parser) return { text };
  const fragments =
    previous?.tree && previous.parser === parser && previous.text !== text
      ? TreeFragment.applyChanges(previous.fragments ?? TreeFragment.addTree(previous.tree), [
          changedRange(previous.text, text)
        ])
      : [];
  const tree = parser.parse(text, fragments);
  return { text, parser, tree, fragments: TreeFragment.addTree(tree, fragments) };
}

export function parseCode(language: string, text: string, previous?: ParsedCodeTree): ParsedCode {
  const document = parseCodeTree(language, text, previous);
  return { ...document, ranges: document.tree ? syntaxRanges(document.tree) : [] };
}

const pairEnd: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
type OpenBracket = { name: string; from: number; level: number };
type BracketContext = { ranges: SyntaxSpan[]; independent: boolean };
type BracketState = BracketContext & {
  offset: number;
  stack: OpenBracket[];
  depths: Record<string, number>;
};

function openBracket(node: SyntaxNodeRef, state: BracketState) {
  const name = node.name;
  const level = state.independent ? (state.depths[name] ?? 0) % 3 : state.stack.length % 3;
  state.stack.push({ name, from: state.offset + node.from, level });
  if (state.independent) state.depths[name] = (state.depths[name] ?? 0) + 1;
}

function closeBracket(node: SyntaxNodeRef, state: BracketState) {
  const open = state.stack.at(-1);
  if (!open || pairEnd[open.name] !== node.name) return;
  state.stack.pop();
  if (state.independent) state.depths[open.name] = (state.depths[open.name] ?? 1) - 1;
  const category = `bracket-${open.level + 1}`;
  state.ranges.push([open.from, open.from + 1, category], [state.offset + node.from, state.offset + node.to, category]);
}

function addBracket(node: SyntaxNodeRef, state: BracketState) {
  const name = node.name;
  if (node.to !== node.from + 1) return;
  if (pairEnd[name] && node.type.prop(NodeProp.closedBy)?.includes(pairEnd[name])) {
    openBracket(node, state);
  } else if (node.type.prop(NodeProp.openedBy)) {
    closeBracket(node, state);
  }
}

function collectBrackets(tree: Tree, offset: number, context: BracketContext) {
  const state: BracketState = { ...context, offset, stack: [], depths: {} };
  tree.iterate({
    enter(node) {
      // Lezer stores mounted parsers on Tree nodes. Reading node.tree directly
      // avoids creating SyntaxNode wrappers for buffered nodes.
      const mounted = node.tree?.prop(NodeProp.mounted);
      if (mounted?.overlay?.length) {
        collectBrackets(mounted.tree, offset + node.from + mounted.overlay[0]!.from, context);
      }
      addBracket(node, state);
    }
  });
}

export function getBracketPairColoring(value: string | null): BracketPairColoring {
  if (value === '') return 'shared';
  const mode = value?.toLowerCase();
  return mode === 'shared' || mode === 'independent' ? mode : null;
}

export function bracketRanges(tree: Tree, mode: BracketPairColoring): SyntaxSpan[] {
  if (mode !== 'shared' && mode !== 'independent') return [];
  const ranges: SyntaxSpan[] = [];
  collectBrackets(tree, 0, { ranges, independent: mode === 'independent' });
  return ranges.sort((left, right) => left[0] - right[0]);
}
