// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { Linter, type Rule, type SourceCode } from 'eslint';
import type { HtmlTagNode } from '../rule-types.js';

const scriptSources = new WeakMap<SourceCode, SourceCode | null>();
const LOOP_ATTRIBUTES = new Set(['v-for', '*ngfor', 'ngfor', '[ngforof]']);
// Independent conditions may render together; only alternative branches split scopes.
const BRANCH_ATTRIBUTES = new Set(['v-else', 'v-else-if']);
const CONDITIONAL_ATTRIBUTES = new Set(['v-if', '*ngif', '[ngif]']);
const LOOP_STATEMENTS = new Set([
  'ForStatement',
  'ForOfStatement',
  'ForInStatement',
  'WhileStatement',
  'DoWhileStatement'
]);
const JSX_SCOPES = new Set(['JSXElement', 'JSXFragment']);
const JSX_SCOPE_WRAPPERS = new Set(['JSXExpressionContainer', 'LogicalExpression']);
const HTML_DOCUMENTS = new Set(['Document']);

interface InstanceContext {
  scope: object | string | null;
  repeated: boolean;
  containingScope?: object | string | null;
  branches?: ReadonlyMap<HtmlTagNode, HtmlTagNode>;
}

function getScriptSource(context: Rule.RuleContext): SourceCode | null {
  const source = context.sourceCode;
  if (!source.ast.body.some(node => HTML_DOCUMENTS.has(node.type))) return source;
  if (scriptSources.has(source)) return scriptSources.get(source) ?? null;

  // Reuse ESLint's JavaScript parser when the HTML config receives raw script text.
  // Typed syntax requires the consumer's TypeScript parser; opaque code stays unchecked.
  const linter = new Linter();
  const messages = linter.verify(source.text, [
    {
      languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } }
    }
  ]);
  const parsed = messages.some(message => message.fatal) ? null : linter.getSourceCode();
  scriptSources.set(source, parsed);
  return parsed;
}

function isRepeatedScript(source: SourceCode, node: Parameters<SourceCode['getAncestors']>[0]): boolean {
  return [...source.getAncestors(node), node].some(ancestor => {
    if (LOOP_STATEMENTS.has(ancestor.type)) return true;
    if (ancestor.type !== 'CallExpression') return false;
    const callee = ancestor.callee;
    if (callee.type === 'Identifier') return callee.name === 'repeat';
    return (
      callee.type === 'MemberExpression' &&
      callee.property.type === 'Identifier' &&
      ['map', 'flatMap', 'forEach'].includes(callee.property.name)
    );
  });
}

function getJSXScope(source: SourceCode, node: Parameters<SourceCode['getAncestors']>[0]) {
  let scope = node;
  const ancestors = source.getAncestors(node).reverse();
  for (const ancestor of ancestors) {
    // Logical inclusions share their containing JSX scope; ternary branches stay separate.
    if (JSX_SCOPE_WRAPPERS.has(ancestor.type)) continue;
    if (!JSX_SCOPES.has(ancestor.type)) break;
    scope = ancestor;
  }
  return scope;
}

function getScriptContext(source: SourceCode, node: HtmlTagNode): InstanceContext {
  const original = source.getNodeByRangeIndex(node.openStart.range[0]);
  if (!original) return { scope: null, repeated: false };
  const ancestors = [...source.getAncestors(original), original];
  const closest = ancestors
    .reverse()
    .find(ancestor => ancestor.type === 'TemplateLiteral' || JSX_SCOPES.has(ancestor.type));
  if (!closest) return { scope: null, repeated: false };
  const scope = JSX_SCOPES.has(closest.type) ? getJSXScope(source, closest) : closest;
  return { scope, repeated: isRepeatedScript(source, scope) };
}

function isTemplateBoundary(node: HtmlTagNode): boolean {
  if (node.type !== 'Tag') return false;
  const attributes = (node.attributes ?? []).map(attribute => attribute.key?.value?.toLowerCase() ?? '');
  return (
    ['template', 'ng-template'].includes(node.name.toLowerCase()) &&
    !attributes.some(attribute => CONDITIONAL_ATTRIBUTES.has(attribute) || BRANCH_ATTRIBUTES.has(attribute))
  );
}

function getVueCondition(node: HtmlTagNode) {
  return node.attributes
    ?.map(attribute => attribute.key?.value?.toLowerCase() ?? '')
    .find(attribute => attribute === 'v-if' || BRANCH_ATTRIBUTES.has(attribute));
}

function getPreviousBranch(node: HtmlTagNode) {
  const siblings = node.parent?.children ?? [];
  return siblings
    .slice(0, Math.max(0, siblings.indexOf(node)))
    .reverse()
    .find(sibling => sibling.type !== 'Comment' && (sibling.type !== 'Text' || Boolean(sibling.value?.trim())));
}

function getBranchGroup(node: HtmlTagNode) {
  let branch = node;
  let condition = getVueCondition(branch);
  if (!condition) return;
  while (condition !== 'v-if') {
    const previous = getPreviousBranch(branch);
    if (!previous) return;
    condition = getVueCondition(previous);
    if (condition !== 'v-if' && condition !== 'v-else-if') return;
    branch = previous;
  }
  return branch;
}

function getBranchContext(node: HtmlTagNode) {
  const branches = new Map<HtmlTagNode, HtmlTagNode>();
  let containingScope = node;
  for (let ancestor: HtmlTagNode | undefined = node; ancestor; ancestor = ancestor.parent) {
    containingScope = ancestor;
    const group = getBranchGroup(ancestor);
    if (group) branches.set(group, ancestor);
    if (isTemplateBoundary(ancestor)) break;
  }
  return { containingScope, branches };
}

function getMarkupContext(node: HtmlTagNode): InstanceContext {
  let scope: object | string = node;
  let boundary: HtmlTagNode | undefined;
  let repeated = false;
  for (let ancestor: HtmlTagNode | undefined = node; ancestor; ancestor = ancestor.parent) {
    repeated ||=
      ancestor.attributes?.some(attribute => LOOP_ATTRIBUTES.has(attribute.key?.value?.toLowerCase() ?? '')) ?? false;
    if (!boundary && (isTemplateBoundary(ancestor) || BRANCH_ATTRIBUTES.has(getVueCondition(ancestor) ?? '')))
      boundary = ancestor;
    scope = ancestor;
  }
  return { scope: boundary ?? scope, repeated };
}

function getMarkdownScope(context: Rule.RuleContext, node: HtmlTagNode, scope: InstanceContext['scope']) {
  const position = node.openStart.range[0];
  if (context.sourceCode.text[position - 1] === '`') return null;
  if (scope && typeof scope === 'object' && 'type' in scope && scope.type === 'Tag') return scope;
  const fences = context.sourceCode.text.matchAll(/(?:^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1[ \t]*\r?(?=\n|$)/g);
  for (const fence of fences) {
    if (position >= fence.index && position < fence.index + fence[0].length) return `fence:${fence.index}`;
  }
  return scope;
}

export function getInstanceContext(context: Rule.RuleContext, node: HtmlTagNode): InstanceContext {
  const markup = getMarkupContext(node);
  if (
    /\.[cm]?[jt]sx?$/i.test(context.filename) ||
    !context.sourceCode.ast.body.some(entry => HTML_DOCUMENTS.has(entry.type))
  ) {
    const source = getScriptSource(context);
    const script = source ? getScriptContext(source, node) : { scope: null, repeated: false };
    return { scope: script.scope, repeated: markup.repeated || script.repeated };
  }
  const branches = getBranchContext(node);
  if (context.filename.endsWith('.md'))
    return {
      ...markup,
      ...branches,
      scope: getMarkdownScope(context, node, markup.scope),
      containingScope: getMarkdownScope(context, node, branches.containingScope)
    };
  return { ...markup, ...branches };
}

export function canRenderTogether(first: InstanceContext, second: InstanceContext): boolean {
  const scope = first.containingScope ?? first.scope;
  if (!scope || scope !== (second.containingScope ?? second.scope)) return false;
  for (const [group, branch] of first.branches ?? []) {
    const other = second.branches?.get(group);
    if (other && other !== branch) return false;
  }
  return true;
}
