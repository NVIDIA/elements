// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** HTML tag node from @html-eslint parser */
export interface HtmlTagNode {
  type: string;
  name: string;
  parent?: HtmlTagNode;
  children?: HtmlTagNode[];
  attributes?: HtmlAttribute[];
  value?: string;
  openStart: { range: [number, number] };
  openEnd?: { range: [number, number] };
  close?: { range: [number, number]; value: string } | null;
  selfClosing?: boolean;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
  range?: [number, number];
  [key: string]: unknown;
  key?: string;
  kind?: string;
  method?: string;
  shorthand?: boolean;
  computed?: boolean;
}

/** HTML attribute node from @html-eslint parser */
export interface HtmlAttribute {
  type: string;
  key?: { value: string };
  value?: { value: string };
  startWrapper?: { value: string };
  endWrapper?: { value: string };
  range?: [number, number];
  name?: string;
  [key: string]: unknown;
}

/** CSS declaration node from CSS parser */
export interface CssDeclarationNode {
  type: string;
  property: string;
  name?: string;
  prelude?: unknown;
  value: {
    value: string;
    children: CssValueChild[];
  };
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
  range?: [number, number];
  [key: string]: unknown;
}

/** CSS at-rule node from CSS parser */
export interface CssAtRuleNode {
  type: string;
  name: string;
  prelude?: unknown;
  loc?: { start: { line: number; column: number }; end: { line: number; column: number } };
  range?: [number, number];
  [key: string]: unknown;
}

/** CSS value child node */
export interface CssValueChild {
  type: string;
  name: string;
  value?: string;
  unit?: string;
  children?: CssValueChild[];
  [key: string]: unknown;
}
