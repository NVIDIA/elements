// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';

import type { ContainerElement } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import palette from '../internal/highlight/highlights.css?inline';
import {
  bracketRanges,
  getBracketPairColoring,
  parseCode,
  type BracketPairColoring
} from '../internal/highlight/syntax.js';
import styles from './code-block.css?inline';
import lines from './line-decorations.css?inline';
import { decorateLines } from './line-decorations.js';
import { registerHighlights } from './source-highlights.js';

const supportsHighlights = () => typeof CSS !== 'undefined' && !!CSS.highlights && typeof Highlight !== 'undefined';
const textChunkLength = 4_096;

function getSourceText(source: string) {
  const text = source.replace(/^(?:[ \t]*\r?\n)+/, '');
  const indent = text.match(/^[ \t]+/)?.[0].length ?? 0;
  return (indent ? text.replace(/^[ \t]+/gm, spaces => spaces.slice(indent)) : text).trim();
}

function getSourceChunks(text: string): string | string[] {
  if (text.length <= textChunkLength) return text;
  // Split large source at newline boundaries to reduce Chromium's highlight processing cost.
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const newline = text.indexOf('\n', start + textChunkLength);
    const end = newline < 0 ? text.length : newline + 1;
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks.length > 1 ? chunks : text;
}

/**
 * @element nve-code-block
 * @description A container for source code with optional header and footer companions that remain visible while code scrolls.
 * @documentation https://nvidia.github.io/elements/docs/code/code-block/
 * @since 0.1.0
 * @entrypoint \@nvidia-elements/code/code-block
 * @slot - source code as text, a `<template>`, or a `<pre><code>` block
 * @slot header - Optional `nve-code-block-header` above the source scroller.
 * @slot footer - Optional `nve-code-block-footer` below the source scroller.
 * @slot actions - Action controls overlaid at the start of the code area.
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --font-family
 * @cssprop --white-space
 * @aria https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/
 * @beta
 * @attribute {'' | 'shared' | 'independent'} bracket-pair-coloring - A bare attribute selects shared depth. Omitting the attribute turns coloring off.
 */
export class CodeBlock extends LitElement implements ContainerElement {
  static readonly metadata = {
    tag: 'nve-code-block',
    version: '0.0.0'
  };

  /**
   * Determines the container styles of component. Flat enables nesting within other containers.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  /**
   * Programming language for syntax highlighting.
   * The deprecated values `bash`, `shell`, and `toml` render as plain text. Use `text` instead.
   */
  @property({ type: String }) language:
    | 'css'
    | 'go'
    | 'html'
    | 'javascript'
    | 'json'
    | 'markdown'
    | 'python'
    | 'text'
    | 'tsx'
    | 'typescript'
    | 'xml'
    | 'yaml'
    | 'bash'
    | 'shell'
    | 'toml' = 'text';

  /**
   * Text code to be process into a codeblock.
   */
  @property({ type: String }) code?: string;

  /**
   * Adds styling to show the line numbers of the codeblock.
   */
  @property({ attribute: 'line-numbers', type: Boolean }) lineNumbers?: boolean;

  /** Colors bracket pairs by shared or per-type depth. Set to null to disable coloring. */
  @property({ attribute: 'bracket-pair-coloring', converter: getBracketPairColoring })
  bracketPairColoring: BracketPairColoring = null;

  /**
   * Adds styling to highlight the provided code lines.
   * Use comma-separated line numbers such as `1,5,7`.
   * For range of lines, use hyphen seperated values, ex: (1-5).
   * You can combine both such as: ex: (1,5,10-15,20).
   */
  @property({ type: String }) highlight?: string;

  static styles = useStyles([styles, palette, lines]);

  #text = '';
  #slottedText = '';
  #language?: CodeBlock['language'];
  #removeHighlights?: () => void;
  #lineCount = 0;
  #observer?: ResizeObserver;
  #lineFrame = 0;
  #refreshLines = () => {
    if (!this.isConnected || this.#lineFrame) return;
    this.#lineFrame = requestAnimationFrame(() => {
      this.#lineFrame = 0;
      if (this.isConnected) this.#decorate();
    });
  };

  connectedCallback() {
    super.connectedCallback();
    this.requestUpdate();
  }

  disconnectedCallback() {
    this.#removeHighlights?.();
    this.#removeHighlights = undefined;
    this.#stopLines();
    super.disconnectedCallback();
  }

  #getSlottedText() {
    const source =
      this.shadowRoot
        ?.querySelector<HTMLSlotElement>('slot:not([name])')
        ?.assignedNodes()
        .map(node => {
          if (node instanceof HTMLTemplateElement) return node.content.textContent ?? '';
          if (node instanceof HTMLPreElement) return node.querySelector('code')?.textContent ?? node.innerHTML;
          if (node instanceof HTMLElement) return node.innerHTML;
          return node.textContent ?? '';
        })
        .join('') ?? '';
    return getSourceText(source);
  }

  #readSlot = () => {
    if (!this.hasUpdated) return;
    const text = this.#getSlottedText();
    if (text === this.#slottedText) return;
    this.#slottedText = text;
    this.requestUpdate();
  };

  firstUpdated() {
    // Read the initial slot assignment here because the slot handler skips reads before Lit's first update.
    this.#readSlot();
  }

  #getFallbackText(changes: PropertyValues<this>) {
    if (this.hasUpdated && changes.has('code')) {
      this.#slottedText = this.#getSlottedText();
    }
    return this.#slottedText;
  }

  willUpdate(changes: PropertyValues<this>) {
    const text = getSourceText(this.code ?? this.#getFallbackText(changes));
    if (text === this.#text && this.language === this.#language && !changes.has('bracketPairColoring')) return;
    this.#removeHighlights?.();
    this.#removeHighlights = undefined;
    this.#text = text;
    this.#lineCount = text ? 1 : 0;
    for (let offset = text.indexOf('\n'); offset !== -1; offset = text.indexOf('\n', offset + 1)) {
      this.#lineCount++;
    }
    this.#language = this.language;
  }

  updated() {
    if (!this.isConnected) return;
    const code = this.shadowRoot?.querySelector('code');
    this.#updateLines(code);
    if (!code || !this.#text || this.#removeHighlights) return;

    if (!supportsHighlights()) return;

    const { tree, ranges } = parseCode(this.language, this.#text);
    const brackets = tree ? bracketRanges(tree, this.bracketPairColoring) : [];
    this.#removeHighlights = registerHighlights(code, ranges.concat(brackets));
  }

  #updateLines(code?: HTMLElement | null) {
    if (code && (this.lineNumbers || this.highlight)) {
      if (!this.#observer) {
        this.#observer = new ResizeObserver(this.#refreshLines);
        this.#observer.observe(code);
        this.ownerDocument.fonts.addEventListener('loadingdone', this.#refreshLines);
      }
      this.#decorate();
    } else {
      this.#stopLines();
    }
  }

  #decorate() {
    const pre = this.shadowRoot?.querySelector('pre');
    if (pre) decorateLines(pre, this.#text, { numbers: this.lineNumbers, selection: this.highlight });
  }

  #stopLines() {
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.ownerDocument.fonts?.removeEventListener('loadingdone', this.#refreshLines);
    if (this.#lineFrame) cancelAnimationFrame(this.#lineFrame);
    this.#lineFrame = 0;
  }

  render() {
    const decorated = this.lineNumbers || this.highlight;
    const classes = `code${decorated ? ' decorated' : ''}${this.lineNumbers ? ' numbered' : ''}`;
    const gutterWidth = Math.max(3, String(this.#lineCount).length);
    const source = this.#text ? getSourceChunks(this.#text) : nothing;

    return html`<div internal-host role="none">
      <slot name="header"></slot>
      <div class="body">
        <div class="source">
          <slot hidden @slotchange=${this.#readSlot}></slot>
          <pre class=${classes} style=${`--_gutter-width:${gutterWidth}ch`} role="none"><code class=${this.language}>${source}</code>${decorated ? html`<span data-lines aria-hidden="true" inert></span>` : nothing}</pre>
        </div>
        <slot name="actions"></slot>
      </div>
      <slot name="footer"></slot>
    </div>`;
  }
}

/**
 * @element nve-codeblock
 * @description The former `nve-codeblock` tag is a compatibility alias, with the same source, header, footer, and actions APIs.
 * @documentation https://nvidia.github.io/elements/docs/code/code-block/
 * @since 0.1.0
 * @entrypoint \@nvidia-elements/code/code-block
 * @deprecated Use `nve-code-block` instead.
 */
export class CodeBlockAlias extends CodeBlock {
  static readonly metadata = { tag: 'nve-codeblock', version: '0.0.0' };
}
