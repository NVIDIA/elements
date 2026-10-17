// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import { attachInternals, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import styles from './panel-header.css?inline';
import tabPresentation from '../../tabs/tabs-item.presentation.css?inline';

/**
 * @element nve-workspace-panel-header
 * @description Supplies a workspace view title, decoration, and application controls.
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/workspace
 * @slot - Noninteractive panel title.
 * @slot prefix - Noninteractive title decoration.
 * @slot suffix - Application controls for the selected view.
 * @cssprop --min-height
 * @cssprop --padding - Padding around the title.
 * @cssprop --prefix-padding - Padding around title decoration.
 * @cssprop --prefix-border - Border after title decoration.
 * @cssprop --suffix-padding - Padding around header controls.
 * @cssprop --suffix-border - Border before header controls.
 * @cssprop --gap
 * @cssprop --border-bottom
 */
export class WorkspacePanelHeader extends LitElement {
  static styles = useStyles([tabPresentation, styles]);

  static readonly metadata = { tag: 'nve-workspace-panel-header', version: '0.0.0', parents: ['nve-workspace-panel'] };

  /** @private */
  @hostAttr() slot = 'header';

  /** @private */
  declare _internals: ElementInternals;

  @state() private configuration = {
    selected: false,
    offset: 0,
    animate: false,
    tabWidth: 0,
    headerHeight: 0,
    clipLeft: 0,
    clipWidth: 0
  };

  #scrollSource?: HTMLElement;
  #scrollExtent = 0;
  #scrollAnimation?: Animation;

  disconnectedCallback() {
    super.disconnectedCallback();
    this._bindScroll(undefined, 0);
  }

  protected updated() {
    this.#bindScrollAnimation();
  }

  render() {
    const { selected, offset, animate, tabWidth, headerHeight, clipLeft, clipWidth } = this.configuration;
    return html`<div internal-host>
      <div class="label-viewport" aria-hidden="true" style=${`left:${clipLeft}px;width:${clipWidth}px;height:${headerHeight}px`}>
        <div class="label-track">
          <div class="label" ?data-animate=${animate} style=${`left:${offset - clipLeft}px;width:${tabWidth}px;height:${headerHeight}px`}>
            <span class="label-content"><slot name="prefix" ?data-empty=${!isServer && !this.querySelector(':scope > [slot="prefix"]')} @slotchange=${() => this.requestUpdate()}></slot><span class="title-content"><slot @slotchange=${() => this.requestUpdate()}></slot>${this.#hasTitle() ? null : this.parentElement?.id}</span></span>
          </div>
        </div>
      </div>
      ${selected ? html`<div class="separator" style=${`top:${headerHeight}px`} aria-hidden="true"></div>` : null}
      <div class="suffix" style=${`height:${headerHeight}px`} aria-hidden=${!selected} ?inert=${!selected} ?data-inactive=${!selected} ?data-empty=${!isServer && !this.querySelector(':scope > [slot="suffix"]')}><div class="suffix-content"><slot name="suffix" @slotchange=${() => this.requestUpdate()}></slot></div></div>
    </div>`;
  }

  /** @internal */
  _hover(hovered: boolean) {
    attachInternals(this);
    if (hovered) this._internals.states.add('tab-hover');
    else this._internals.states.delete('tab-hover');
  }

  /** @internal Workspace owns allocated chrome; supplied nodes keep their parents. */
  _configure({ scrollLeft, ...configuration }: typeof this.configuration & { scrollLeft: number }) {
    this._scroll(scrollLeft);
    if (sameConfiguration(this.configuration, configuration)) return;
    attachInternals(this);
    if (configuration.selected) this._internals.states.add('selected');
    else this._internals.states.delete('selected');
    this.configuration = configuration;
  }

  /** @internal */
  _scroll(scrollLeft: number) {
    // ScrollTimeline fallback; remove after wider adoption of Firefox 159.
    if (!this.#scrollAnimation) this.style.setProperty('--_workspace-tab-scroll', `${-scrollLeft}px`);
  }

  /** @internal */
  _bindScroll(source: HTMLElement | undefined, extent: number) {
    if (source === this.#scrollSource && extent === this.#scrollExtent) return;
    if (this.#updateScrollExtent(source, extent)) return;
    this.#scrollAnimation?.cancel();
    this.#scrollAnimation = undefined;
    this.#scrollSource = source;
    this.#scrollExtent = extent;
    this.#bindScrollAnimation();
    if (!this.#scrollAnimation) this._scroll(source?.scrollLeft ?? 0);
  }

  #updateScrollExtent(source: HTMLElement | undefined, extent: number) {
    if (source !== this.#scrollSource || extent <= 0) return false;
    const effect = this.#scrollAnimation?.effect;
    if (!(effect instanceof KeyframeEffect)) return false;
    this.#scrollExtent = extent;
    effect.setKeyframes(scrollKeyframes(extent));
    return true;
  }

  #bindScrollAnimation() {
    if (
      this.#scrollAnimation ||
      !this.#scrollSource ||
      this.#scrollExtent <= 0 ||
      typeof ScrollTimeline === 'undefined'
    )
      return;
    const track = this.shadowRoot?.querySelector<HTMLElement>('.label-track');
    if (!track) return;
    this.#scrollAnimation = track.animate(scrollKeyframes(this.#scrollExtent), {
      timeline: new ScrollTimeline({ source: this.#scrollSource, axis: 'x' }),
      fill: 'both',
      easing: 'linear'
    });
  }

  #hasTitle() {
    if (isServer) return true;
    return [...this.childNodes].some(
      node => (!(node instanceof Element) || !node.hasAttribute('slot')) && !!node.textContent?.trim()
    );
  }
}

function sameConfiguration(
  current: Omit<Parameters<WorkspacePanelHeader['_configure']>[0], 'scrollLeft'>,
  next: Omit<Parameters<WorkspacePanelHeader['_configure']>[0], 'scrollLeft'>
) {
  return (
    current.selected === next.selected &&
    current.offset === next.offset &&
    current.animate === next.animate &&
    current.tabWidth === next.tabWidth &&
    current.headerHeight === next.headerHeight &&
    current.clipLeft === next.clipLeft &&
    current.clipWidth === next.clipWidth
  );
}

function scrollKeyframes(extent: number) {
  return [{ transform: 'translateX(0px)' }, { transform: `translateX(${-extent}px)` }];
}
