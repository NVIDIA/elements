// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Control } from '@nvidia-elements/core/forms';
import { appendRootNodeStyle, getPropertyChanges } from '@nvidia-elements/core/internal';
import { Textarea } from '@nvidia-elements/core/textarea';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import palette from '../internal/highlight/highlights.css?inline';
import {
  bracketRanges,
  getBracketPairColoring,
  parseCodeTree,
  syntaxRanges,
  type BracketPairColoring,
  type ParsedCodeTree,
  type SyntaxSpan
} from '../internal/highlight/syntax.js';
import styles from './code-textarea.css?inline';
import {
  getValueViewport,
  getWideLines,
  highlightRangeLimit,
  supportsValueHighlights,
  ValueHighlights
} from './value-highlights.js';

const valuePalette = palette.replaceAll('code::highlight', ':where(textarea)::highlight');

const textLengthThreshold = 32_768;

function appendVisibleRanges(output: SyntaxSpan[], source: SyntaxSpan[], [from, to]: readonly [number, number]) {
  for (const [start, end, category] of source) {
    if (end > from && start < to) output.push([Math.max(start, from), Math.min(end, to), category]);
  }
}

function getVisibleRanges(
  tree: NonNullable<ParsedCodeTree['tree']>,
  brackets: SyntaxSpan[],
  windows: ReadonlyArray<readonly [number, number]>
) {
  const ranges: SyntaxSpan[] = [];
  let bracketIndex = 0;
  for (const window of windows) {
    appendVisibleRanges(ranges, syntaxRanges(tree, ...window), window);
    const [from, to] = window;
    while (bracketIndex < brackets.length) {
      const bracket = brackets[bracketIndex]!;
      if (bracket[0] >= to) break;
      if (bracket[1] > from) ranges.push(bracket);
      bracketIndex++;
    }
  }
  return ranges;
}

/**
 * @element nve-code-textarea
 * @description Enhances a native textarea with syntax highlighting while preserving native editing and form behavior.
 * @documentation https://nvidia.github.io/elements/docs/code/code-textarea/
 * @since 2.4.0
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
 * @attribute {'' | 'shared' | 'independent'} bracket-pair-coloring - A bare attribute selects shared depth. Omitting the attribute turns coloring off.
 */
export class CodeTextarea extends Control {
  static readonly metadata = { tag: 'nve-code-textarea', version: '0.0.0' };

  static styles = [...Textarea.styles, ...useStyles([styles])];

  /** Programming language of the native textarea's value. */
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
    | 'yaml' = 'text';

  /** Colors bracket pairs by shared or per-type depth. Set to null to disable coloring. */
  @property({ attribute: 'bracket-pair-coloring', converter: getBracketPairColoring })
  bracketPairColoring: BracketPairColoring = null;

  #textarea?: HTMLTextAreaElement;
  #stopValueChanges?: () => void;
  #observer?: MutationObserver;
  #sizeObserver?: ResizeObserver;
  #resetRoot?: Node;

  #document?: ParsedCodeTree;
  #syntax: SyntaxSpan[] = [];
  #brackets: SyntaxSpan[] = [];
  #highlights?: ValueHighlights;
  #rebuild = true;
  #composing = false;
  #pendingEdits = 0;

  #windowed = false;
  #wideLines?: ReturnType<typeof getWideLines>;
  #windowingFailed = false;
  #windowScrollTop = 0;
  #windowHeight = 0;
  #horizontalWindow?: { left: number; width: number };
  #windowFrame = 0;

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot?.addEventListener('slotchange', this.#onSlotChange);
    this.#observer = new MutationObserver(this.#onMutation);
    this.#observeTextareaChanges();
    this.ownerDocument.fonts?.addEventListener('loadingdone', this.#onHighlightLayoutChange);
    this.requestUpdate();
  }

  #observeTextareaChanges() {
    const observer = this.#observer;
    if (!observer) return;

    observer.disconnect();
    const options: MutationObserverInit = {
      childList: true,
      characterData: true,
      attributeFilter: ['wrap', 'rows', 'cols', 'style', 'class', 'dir'],
      subtree: true
    };
    observer.observe(this, options);
    const textarea = this.#textarea;
    if (textarea && !this.contains(textarea)) {
      observer.observe(textarea, options);
      if (textarea.parentNode) observer.observe(textarea.parentNode, { childList: true });
    }
  }

  disconnectedCallback() {
    this.shadowRoot?.removeEventListener('slotchange', this.#onSlotChange);
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.ownerDocument.fonts?.removeEventListener('loadingdone', this.#onHighlightLayoutChange);
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

    if (changes.has('language') || changes.has('bracketPairColoring')) this.#rebuild = true;
    this.#highlightValue();
  }

  #highlightValue() {
    const textarea = this.#textarea;
    if (!textarea || !supportsValueHighlights(textarea) || this.#composing) return;

    const text = textarea.value;
    const previous = this.#rebuild ? undefined : this.#document;
    this.#pendingEdits = 0;
    if (previous?.text === text) return;

    this.#highlights ??= new ValueHighlights(textarea);
    if (this.#rebuild) this.#highlights.clear();
    this.#parseHighlights(text, previous);
    this.#paintHighlights();
    this.#rebuild = false;
  }

  #parseHighlights(text: string, previous?: ParsedCodeTree) {
    const parsed = parseCodeTree(this.language, text, previous);
    const tree = parsed.tree;
    const brackets = tree ? bracketRanges(tree, this.bracketPairColoring) : [];
    const longValue = text.length > textLengthThreshold;
    const syntax = tree && !longValue ? syntaxRanges(tree) : [];

    this.#document = parsed;
    this.#brackets = brackets;
    this.#windowed = !!tree && (longValue || syntax.length + brackets.length > highlightRangeLimit);
    this.#syntax = this.#windowed ? [] : syntax;
    this.#wideLines = undefined;
    this.#windowingFailed = false;
    this.#horizontalWindow = undefined;
  }

  #paintHighlights() {
    const textarea = this.#textarea;
    const document = this.#document;
    if (!textarea || !supportsValueHighlights(textarea) || !document || !this.#highlights) return;
    if (this.#windowed && document.tree) {
      const viewport = getValueViewport(
        textarea,
        document.text.length,
        () => (this.#wideLines ??= getWideLines(document.text))
      );
      this.#horizontalWindow = viewport?.horizontal;
      this.#windowScrollTop = textarea.scrollTop;
      this.#windowHeight = textarea.clientHeight;
      if (!viewport) {
        this.#windowingFailed = viewport === null;
        this.#highlights.clear();
        return;
      }
      this.#applyHighlights(getVisibleRanges(document.tree, this.#brackets, viewport.windows));
      return;
    }
    this.#applyHighlights(this.#syntax.concat(this.#brackets));
  }

  #applyHighlights(ranges: SyntaxSpan[]) {
    if (ranges.length > highlightRangeLimit) {
      this.#windowingFailed = true;
      this.#highlights?.clear();
      return;
    }
    ranges.sort((left, right) => left[0] - right[0] || left[1] - right[1]);
    this.#highlights?.update(ranges);
  }

  #canUpdateViewport() {
    return (
      this.isConnected &&
      this.#windowed &&
      !this.#pendingEdits &&
      !this.#rebuild &&
      !this.#composing &&
      !this.#windowingFailed
    );
  }

  #onHighlightLayoutChange = () => {
    this.#windowingFailed = false;
    this.#scheduleWindow();
  };

  #scheduleWindow = () => {
    if (this.#windowFrame || !this.#canUpdateViewport()) return;
    this.#windowFrame = requestAnimationFrame(() => {
      this.#windowFrame = 0;
      if (this.#canUpdateViewport()) this.#paintHighlights();
    });
  };

  #onScroll = () => {
    const textarea = this.#textarea;
    if (!textarea || !this.#canUpdateViewport()) return;
    const horizontal = this.#horizontalWindow;
    if (
      textarea.clientHeight === this.#windowHeight &&
      Math.abs(textarea.scrollTop - this.#windowScrollTop) < textarea.clientHeight &&
      (!horizontal ||
        (textarea.clientWidth === horizontal.width &&
          Math.abs(textarea.scrollLeft - horizontal.left) < horizontal.width / 2))
    )
      return;
    this.#scheduleWindow();
  };

  /** @private */
  protected get prefixContent() {
    return html`<slot name="prefix"></slot>`;
  }

  /** @private */
  protected get suffixContent() {
    return html`<slot name="suffix"></slot>`;
  }

  #onSlotChange = () => this.requestUpdate();

  #onMutation = (records: MutationRecord[]) => {
    const textarea = this.#textarea;
    const content = records.some(record => record.type !== 'attributes');
    if (content) {
      const invalidatesRanges =
        textarea &&
        records.some(record => {
          if (record.type === 'attributes') return false;
          if (textarea.contains(record.target)) return true;

          // Removing the textarea invalidates its OpaqueRanges, so reinserting the same node requires new ranges.
          for (const node of record.removedNodes) {
            if (node.contains(textarea)) return true;
          }
          return false;
        });
      if (invalidatesRanges) {
        this.#rebuild = true;
      }
      this.requestUpdate();
    }
    if (
      records.some(record => record.type === 'attributes' && (record.target === textarea || record.target === this))
    ) {
      this.#onHighlightLayoutChange();
    }
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
    const textarea = this.#textarea;
    if (!textarea || event.target !== textarea.form) return;

    // Microtasks queued by a reset listener can run before the browser restores form values.
    setTimeout(() => {
      if (this.#textarea === textarea) this.refreshHighlighting();
    });
  };

  #attachTextarea() {
    const input = this.input;
    const textarea = input instanceof HTMLTextAreaElement ? input : undefined;
    if (textarea === this.#textarea && textarea?.getRootNode() === this.#resetRoot) return;

    this.#detachTextarea();
    this.#textarea = textarea;
    this.#observeTextareaChanges();
    if (!textarea) return;

    this.#bindTextareaRoot(textarea);
    textarea.addEventListener('input', this.#onInput);
    textarea.addEventListener('compositionstart', this.#onCompositionStart);
    textarea.addEventListener('compositionend', this.#onCompositionEnd);
    textarea.addEventListener('scroll', this.#onScroll, { passive: true });

    this.#sizeObserver = new ResizeObserver(this.#onHighlightLayoutChange);
    this.#sizeObserver.observe(textarea);
    // Assigning textarea.value invalidates existing opaque ranges, even if you assign the same string.
    this.#stopValueChanges = getPropertyChanges(textarea, 'value', () => this.refreshHighlighting());
  }

  #bindTextareaRoot(textarea: HTMLTextAreaElement) {
    // A forwarded field can live in a different tree from the control.
    appendRootNodeStyle(textarea, valuePalette);
    this.#resetRoot = textarea.getRootNode();
    this.#resetRoot.addEventListener('reset', this.#onFormReset, true);
  }

  #detachTextarea() {
    this.#resetRoot?.removeEventListener('reset', this.#onFormReset, true);
    this.#resetRoot = undefined;
    this.#textarea?.removeEventListener('input', this.#onInput);
    this.#textarea?.removeEventListener('compositionstart', this.#onCompositionStart);
    this.#textarea?.removeEventListener('compositionend', this.#onCompositionEnd);
    this.#textarea?.removeEventListener('scroll', this.#onScroll);
    this.#sizeObserver?.disconnect();
    this.#sizeObserver = undefined;
    if (this.#windowFrame) cancelAnimationFrame(this.#windowFrame);
    this.#windowFrame = 0;
    this.#stopValueChanges?.();
    this.#stopValueChanges = undefined;
    this.#textarea = undefined;
    this.#clearHighlights();
  }

  #clearHighlights() {
    this.#highlights?.clear();
    this.#highlights = undefined;
    this.#document = undefined;
    this.#syntax = [];
    this.#brackets = [];
    this.#composing = false;
    this.#pendingEdits = 0;
    this.#rebuild = true;
    this.#windowed = false;
    this.#wideLines = undefined;
    this.#windowingFailed = false;
    this.#horizontalWindow = undefined;
  }
}
