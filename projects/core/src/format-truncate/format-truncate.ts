// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TemplateResult } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, useStyles, typeSSR } from '@nvidia-elements/core/internal';
import { normalizeTruncateString, normalizeTruncateText, truncateText } from './utils.js';
import styles from './format-truncate.css?inline';

/**
 * @element nve-format-truncate
 * @description Truncates text at its start, center, or end while preserving the full text for assistive technology.
 * @documentation https://nvidia.github.io/elements/docs/elements/format-truncate/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/format-truncate
 * @slot - Text to truncate. The component flattens, trims, and normalizes mixed text and element nodes.
 * @beta
 */
@typeSSR()
export class FormatTruncate extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-format-truncate',
    version: '0.0.0'
  };

  /**
   * Location of the ellipsis. Use start or end to preserve one edge, or center to preserve both edges.
   */
  @property({ type: String, reflect: true }) position: 'start' | 'center' | 'end' = 'start';

  /**
   * Text unit used for center truncation. Character preserves graphemes, word preserves words, and path preserves path segments.
   */
  @property({ type: String, reflect: true }) strategy: 'character' | 'word' | 'path' = 'character';

  /**
   * Edge favored by center truncation. The favored edge keeps at least the configured number of units.
   */
  @property({ type: String, reflect: true }) bias: 'start' | 'end' = 'end';

  /**
   * Number of strategy units retained at the biased edge during center truncation.
   */
  @property({ type: Number, reflect: true }) preserve = 6;

  /** @private */
  declare _internals: ElementInternals;

  #measurementContext?: CanvasRenderingContext2D | null;
  #resizeObserver?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    this.#observeAvailableWidth();
    this.requestUpdate();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
  }

  connectedMoveCallback(): void {
    this.#observeAvailableWidth();
    this.requestUpdate();
  }

  override render(): TemplateResult {
    const text = this.#slottedText;
    const truncatedText = this.#renderText(text);

    if (truncatedText !== text) this.title = text;
    else this.removeAttribute('title');

    return html`<span internal-host aria-hidden="true">${truncatedText}</span><slot @slotchange=${this.#onSlotChange}></slot>`;
  }

  get #slottedText(): string {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
    if (slot) return normalizeTruncateText(slot.assignedNodes({ flatten: true }));

    const nodes = Array.from(this.childNodes ?? []).filter(isDefaultSlotNode);
    return nodes.length ? normalizeTruncateText(nodes) : normalizeTruncateString(this.textContent ?? '');
  }

  #renderText(text: string): string {
    const measureText = this.#createTextMeasurer();

    return truncateText(text, {
      position: this.position,
      strategy: this.strategy,
      bias: this.bias,
      preserve: this.preserve,
      availableWidth: this.#availableWidth,
      measureText
    });
  }

  get #availableWidth(): number {
    const view = this.ownerDocument?.defaultView;
    if (!view) return Number.POSITIVE_INFINITY;

    for (let container = getComposedParent(this); container; container = getComposedParent(container)) {
      const containerWidth = getContentWidth(container, view);
      if (containerWidth > 0) return containerWidth;
    }

    return Number.POSITIVE_INFINITY;
  }

  #createTextMeasurer(): (text: string) => number {
    const view = this.ownerDocument?.defaultView;
    const context = this.#textMeasurementContext;
    if (!view || !context) return () => 0;

    const computedStyles = view.getComputedStyle(this);
    context.font = computedStyles.font;

    const letterSpacing = cssPixelValue(computedStyles.letterSpacing);
    const wordSpacing = cssPixelValue(computedStyles.wordSpacing);
    const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

    return text => this.#measureText(text, { context, letterSpacing, wordSpacing, graphemeSegmenter });
  }

  #measureText(
    text: string,
    {
      context,
      letterSpacing,
      wordSpacing,
      graphemeSegmenter
    }: {
      context: CanvasRenderingContext2D;
      letterSpacing: number;
      wordSpacing: number;
      graphemeSegmenter: Intl.Segmenter;
    }
  ): number {
    const graphemeSegments = graphemeSegmenter.segment(text);
    const whitespaceCount = Array.from(text.matchAll(/\s/gu)).length;

    return (
      context.measureText(text).width +
      Math.max(0, Array.from(graphemeSegments).length - 1) * letterSpacing +
      whitespaceCount * wordSpacing
    );
  }

  get #textMeasurementContext(): CanvasRenderingContext2D | null {
    if (this.#measurementContext === undefined) {
      this.#measurementContext = this.ownerDocument?.createElement('canvas').getContext('2d') ?? null;
    }

    return this.#measurementContext;
  }

  #observeAvailableWidth(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.#resizeObserver ??= new ResizeObserver(() => {
      if (this.isConnected) this.requestUpdate();
    });
    this.#resizeObserver.disconnect();
    this.#resizeObserver.observe(this);

    for (let container = getComposedParent(this); container; container = getComposedParent(container)) {
      this.#resizeObserver.observe(container);
      if (container.clientWidth > 0) break;
    }
  }

  #onSlotChange = (): void => {
    this.requestUpdate();
  };
}

function getContentWidth(element: HTMLElement, view: Window): number {
  const computedStyles = view.getComputedStyle(element);
  return Math.max(
    0,
    element.clientWidth -
      cssPixelValue(computedStyles.paddingInlineStart) -
      cssPixelValue(computedStyles.paddingInlineEnd)
  );
}

function getComposedParent(element: HTMLElement): HTMLElement | null {
  if (element.parentElement) return element.parentElement;

  const root = element.getRootNode();
  return root instanceof ShadowRoot && root.host instanceof HTMLElement ? root.host : null;
}

function cssPixelValue(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isDefaultSlotNode(node: Node): boolean {
  return !isElementNode(node) || !node.getAttribute('slot');
}

function isElementNode(node: Node): node is Element {
  return node.nodeType === 1;
}
