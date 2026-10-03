// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Control } from '@nvidia-elements/core/forms';
import { Textarea } from '@nvidia-elements/core/textarea';
import { appendRootNodeStyle, getPropertyChanges, useStyles } from '@nvidia-elements/core/internal';
import { getScanner } from '../internal/highlight/language-registry.mjs';
import { createDocument, editDocument } from './internal/incremental.mjs';
import type { ParsedDocument } from './internal/incremental.mjs';
import { supportsValueHighlights, ValueHighlights } from './internal/value-highlights.js';
import styles from './code-textarea.css?inline';
import palette from '../internal/highlight/highlights.css?inline';
import '../codeblock/languages/shell.js';

// Native textarea value text needs styles in its containing tree. A highlight
// pseudo-element cannot follow ::slotted(), unlike ordinary textarea styles.
const valuePalette = palette.replaceAll('code::highlight', 'nve-code-textarea textarea::highlight');

/**
 * @element nve-code-textarea
 * @description Enhances a native textarea with syntax highlighting while preserving native editing and form behavior.
 * @documentation https://nvidia.github.io/elements/docs/code/code-textarea/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/code/code-textarea
 * @slot - Native textarea, label, and control messages.
 * @slot prefix - Content before the textarea.
 * @slot suffix - Content after the textarea.
 * @cssprop --font-family
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --width
 * @cssprop --min-height
 * @cssprop --background
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --border
 * @cssprop --border-radius
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
 * @stable false
 */
export class CodeTextarea extends Control {
  static readonly metadata = { tag: 'nve-code-textarea', version: '0.0.0' };

  static styles = [...Textarea.styles, ...useStyles([styles])];

  /** Programming language of the native textarea's value. */
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

  #textarea?: HTMLTextAreaElement;
  #document?: ParsedDocument;
  #highlights?: ValueHighlights;
  #stopValueChanges?: () => void;
  #observer?: MutationObserver;
  #resetRoot?: Node;
  #rebuild = true;
  #composing = false;
  #pendingEdits = 0;

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, valuePalette);
    this.#resetRoot = this.getRootNode();
    this.#resetRoot.addEventListener('reset', this.#onFormReset, true);
    this.shadowRoot?.addEventListener('slotchange', this.#onSlotChange);
    this.#observer = new MutationObserver(this.#onMutation);
    this.#observer.observe(this, {
      childList: true,
      characterData: true,
      subtree: true
    });
    this.requestUpdate();
  }

  disconnectedCallback() {
    this.shadowRoot?.removeEventListener('slotchange', this.#onSlotChange);
    this.#resetRoot?.removeEventListener('reset', this.#onFormReset, true);
    this.#resetRoot = undefined;
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#detachTextarea();
    super.disconnectedCallback();
  }

  /** Refreshes highlighting after a programmatic edit such as setRangeText(). */
  refreshHighlighting(): void {
    this.#rebuild = true;
    this.requestUpdate();
  }

  updated(changes: PropertyValues<this>) {
    if (!this.isConnected) return;
    this.#attachTextarea();
    if (changes.has('language')) this.#rebuild = true;
    this.#highlightValue();
  }

  #highlightValue() {
    const textarea = this.#textarea;
    if (!textarea || !supportsValueHighlights(textarea) || this.#composing) return;

    const text = textarea.value;
    const previous = this.#document;
    if (!this.#rebuild && previous?.text === text) return;
    const scan = getScanner(this.language);
    this.#highlights ??= new ValueHighlights(textarea);

    this.#document = this.#parseValue(scan, text, previous);

    this.#highlights.update(this.#document.ranges);
    this.#rebuild = false;
    this.#pendingEdits = 0;
  }

  /** @private */
  protected get prefixContent() {
    return html`<slot name="prefix"></slot>`;
  }

  /** @private */
  protected get suffixContent() {
    return html`<slot name="suffix"></slot>`;
  }

  #parseValue(scan: ReturnType<typeof getScanner>, text: string, previous?: ParsedDocument) {
    if (this.#rebuild || !previous) {
      // Assigning .value resets native range endpoints even when the text
      // compares equal. Each setter invocation requires fresh ranges.
      this.#highlights?.clear();
      return createDocument(scan, text, 8);
    }
    const [start, oldEnd, newEnd] = this.#changedOffsets(previous.text, text);
    return editDocument(scan, previous, start, oldEnd, text.slice(start, newEnd));
  }

  #changedOffsets(previous: string, text: string) {
    let start = 0;
    while (start < previous.length && start < text.length && previous[start] === text[start]) start++;
    let oldEnd = previous.length;
    let newEnd = text.length;
    while (oldEnd > start && newEnd > start && previous[oldEnd - 1] === text[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }
    return [start, oldEnd, newEnd] as const;
  }

  #onSlotChange = () => this.requestUpdate();

  #onMutation = (records: MutationRecord[]) => {
    if (records.some(record => this.#textarea?.contains(record.target))) this.#rebuild = true;
    this.requestUpdate();
  };

  #onInput = () => {
    if (++this.#pendingEdits > 1) this.#rebuild = true;
    this.requestUpdate();
  };

  #onCompositionStart = () => {
    this.#composing = true;
  };

  #onCompositionEnd = () => {
    this.#composing = false;
    this.refreshHighlighting();
  };

  #onFormReset = (event: Event) => {
    // Capture reset in the current tree so native form reassociation needs no
    // separate observer. Lit reads the value after the reset completes.
    if (event.target === this.#textarea?.form) this.refreshHighlighting();
  };

  #attachTextarea() {
    const textarea = this.querySelector('textarea') ?? undefined;
    if (textarea !== this.#textarea) {
      this.#detachTextarea();
      this.#textarea = textarea;
      if (textarea) {
        textarea.addEventListener('input', this.#onInput);
        textarea.addEventListener('compositionstart', this.#onCompositionStart);
        textarea.addEventListener('compositionend', this.#onCompositionEnd);
        this.#stopValueChanges = getPropertyChanges(textarea, 'value', () => this.refreshHighlighting());
      }
    }
  }

  #detachTextarea() {
    this.#textarea?.removeEventListener('input', this.#onInput);
    this.#textarea?.removeEventListener('compositionstart', this.#onCompositionStart);
    this.#textarea?.removeEventListener('compositionend', this.#onCompositionEnd);
    this.#stopValueChanges?.();
    this.#stopValueChanges = undefined;
    this.#textarea = undefined;
    this.#clearHighlights();
  }

  #clearHighlights() {
    this.#highlights?.clear();
    this.#highlights = undefined;
    this.#document = undefined;
    this.#composing = false;
    this.#pendingEdits = 0;
    this.#rebuild = true;
  }
}
