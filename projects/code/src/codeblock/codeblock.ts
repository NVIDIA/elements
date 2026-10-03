// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';

import type { ContainerElement } from '@nvidia-elements/core/internal';
import { useStyles, shiftLeft } from '@nvidia-elements/core/internal';
import styles from './codeblock.css?inline';
import palette from '../internal/highlight/highlights.css?inline';
import lines from './internal/line-decorations.css?inline';
import { registerHighlights } from './internal/highlights.mjs';
import { decorateLines } from './internal/line-decorations.mjs';
import { getScanner } from '../internal/highlight/language-registry.mjs';
import './languages/shell.js';

const canHighlight = () => typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';

/**
 * @element nve-codeblock
 * @description A container for content representing programming languages.
 * @documentation https://nvidia.github.io/elements/docs/code/codeblock/
 * @since 0.1.0
 * @entrypoint \@nvidia-elements/code/codeblock
 * @slot - source code as text, a `<template>`, or a `<pre><code>` block
 * @slot actions - slot for action bar
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --border
 * @cssprop --font-family
 * @cssprop --white-space
 * @aria https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/
 * @beta
 */
export class CodeBlock extends LitElement implements ContainerElement {
  static readonly metadata = {
    tag: 'nve-codeblock',
    version: '0.0.0'
  };

  /**
   * Determines the container styles of component. Flat enables nesting within other containers.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  /**
   * Programming language that processes the codeblock.
   */
  @property({ type: String }) language:
    | 'bash'
    | 'css'
    | 'go'
    | 'html'
    | 'javascript'
    | 'json'
    | 'markdown'
    | 'python'
    | 'shell'
    | 'toml'
    | 'tsx'
    | 'typescript'
    | 'xml'
    | 'yaml' = 'shell';

  /**
   * Text code to be process into a codeblock.
   */
  @property({ type: String }) code?: string;

  /**
   * Adds styling to show the line numbers of the codeblock.
   */
  @property({ attribute: 'line-numbers', type: Boolean }) lineNumbers?: boolean;

  /**
   * Adds styling to highlight the provided code lines.
   * For many lines: use Comma seperated values, ex: (1,5,7).
   * For range of lines, use hyphen seperated values, ex: (1-5).
   * You can combine both such as: ex: (1,5,10-15,20).
   */
  @property({ type: String }) highlight?: string;

  static styles = useStyles([styles, palette, lines]);

  #text = '';
  #slottedText = '';
  #language?: CodeBlock['language'];
  #cleanup?: () => void;
  #register = true;
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
    this.#register = true;
    this.requestUpdate();
  }

  disconnectedCallback() {
    this.#cleanup?.();
    this.#cleanup = undefined;
    this.#stopLines();
    super.disconnectedCallback();
  }

  #readSlot = () => {
    if (!this.hasUpdated) return;
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
    const text = shiftLeft(source).trim();
    if (text === this.#slottedText) return;
    this.#slottedText = text;
    this.requestUpdate();
  };

  firstUpdated() {
    // Hydrate the server's empty slotted-source part before updating its text.
    this.#readSlot();
  }

  willUpdate() {
    const text = this.code !== undefined ? shiftLeft(this.code).trim() : this.#slottedText;
    if (text === this.#text && this.language === this.#language) return;
    // Dispose ranges before Lit changes their text node.
    this.#cleanup?.();
    this.#cleanup = undefined;
    this.#text = text;
    this.#lineCount = text ? 1 : 0;
    for (let offset = text.indexOf('\n'); offset !== -1; offset = text.indexOf('\n', offset + 1)) {
      this.#lineCount++;
    }
    this.#language = this.language;
    this.#register = true;
  }

  updated() {
    if (!this.isConnected) return;
    const code = this.shadowRoot?.querySelector('code');
    this.#updateLines(code);
    if (this.#register) {
      this.#register = false;
      if (code && canHighlight()) {
        // Offsets are transient; the native highlights own the rendered ranges.
        this.#cleanup = registerHighlights(code, this.#text ? getScanner(this.language)(this.#text) : []);
      }
    }
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
    if (pre) decorateLines(pre, this.#text, this.lineNumbers, this.highlight);
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
    return html`<div internal-host role="none">
      <slot hidden @slotchange=${this.#readSlot}></slot>
      <pre class=${`hljs${decorated ? ' decorated' : ''}${this.lineNumbers ? ' numbered' : ''}`} style=${`--_gutter-width:${Math.max(3, String(this.#lineCount).length)}ch`} role="none"><code class=${this.language}>${this.#text || nothing}</code>${decorated ? html`<span data-lines aria-hidden="true" inert></span>` : nothing}</pre>
      <slot name="actions"></slot>
    </div>`;
  }
}
