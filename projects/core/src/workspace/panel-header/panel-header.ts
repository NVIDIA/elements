// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';

import { attachInternals, hostAttr, useStyles } from '@nvidia-elements/core/internal';

import { sameHeaderConfiguration } from '../utils/presentation/header-configuration.utils.js';

import type { WorkspaceHeaderConfiguration } from '../utils/presentation/header-configuration.utils.js';

import styles from './panel-header.css?inline';

/**
 * @element nve-workspace-panel-header
 * @description Supplies a workspace panel title, decoration, and application controls.
 * @documentation https://nvidia.github.io/elements/docs/elements/workspace/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/workspace
 * @slot - Noninteractive panel title.
 * @slot prefix - Noninteractive title decoration.
 * @slot suffix - Application controls for the selected panel.
 * @cssprop --min-height
 * @cssprop --padding - Padding around the title.
 * @cssprop --prefix-padding - Padding around title decoration.
 * @cssprop --prefix-border - Border after title decoration.
 * @cssprop --suffix-padding - Override the shared inset around header controls.
 * @cssprop --suffix-border - Border before header controls.
 * @cssprop --gap
 * @cssprop --border-bottom
 */
export class WorkspacePanelHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-workspace-panel-header', version: '0.0.0', parents: ['nve-workspace-panel'] };

  /** @private */
  @hostAttr() slot = 'header';

  /** @private */
  declare _internals: ElementInternals;

  @state() private configuration: WorkspaceHeaderConfiguration = {
    selected: false,
    offset: 0,
    animate: false,
    tabWidth: 0,
    headerHeight: 0,
    suffixEnd: 0,
    clipLeft: 0,
    clipWidth: 0
  };

  #scrollSource?: HTMLElement;
  #scrollExtent = 0;
  #scrollAnimation?: Animation;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._bindScroll(undefined, 0);
  }

  protected updated() {
    this.#bindScrollAnimation();
  }

  render() {
    const { selected, offset, animate, tabWidth, headerHeight, suffixEnd, clipLeft, clipWidth } = this.configuration;
    return html`
      <div internal-host>
        <div
          class="label-viewport"
          aria-hidden="true"
          style=${`left:${clipLeft}px;width:${clipWidth}px;height:${headerHeight}px`}>
          <div class="label-track">
            <div
              class="label"
              ?data-animate=${animate}
              style=${`left:${offset - clipLeft}px;width:${tabWidth}px;height:${headerHeight}px`}>
              <span class="label-content">
                <slot
                  name="prefix"
                  ?data-empty=${!isServer && !this.querySelector(':scope > [slot="prefix"]')}
                  @slotchange=${() => this.requestUpdate()}></slot>
                <span class="title-content"><slot @slotchange=${() => this.requestUpdate()}></slot>${this.#hasTitle() ? null : this.parentElement?.id}</span>
              </span>
            </div>
          </div>
        </div>
        ${
          selected
            ? html`
              <div class="separator" style=${`top:${headerHeight}px`} aria-hidden="true"></div>
            `
            : null
        }
        <div
          class="suffix"
          ?data-group-actions=${suffixEnd > 0}
          style=${`height:${headerHeight}px;right:${suffixEnd}px`}
          aria-hidden=${!selected}
          ?inert=${!selected}
          ?data-inactive=${!selected}
          ?data-empty=${!isServer && !this.querySelector(':scope > [slot="suffix"]')}>
          <div class="suffix-content"><slot name="suffix" @slotchange=${() => this.requestUpdate()}></slot></div>
        </div>
      </div>
    `;
  }

  /** @internal */
  _getMeasurementTargets() {
    return {
      label: this.shadowRoot?.querySelector<HTMLElement>('.label-content') ?? null,
      suffix: this.shadowRoot?.querySelector<HTMLElement>('.suffix-content') ?? null
    };
  }

  /** @internal */
  _getTransitionTargets() {
    return {
      labelViewport: this.shadowRoot?.querySelector<HTMLElement>('.label-viewport') ?? null,
      labelTrack: this.shadowRoot?.querySelector<HTMLElement>('.label-track') ?? null,
      label: this.shadowRoot?.querySelector<HTMLElement>('.label') ?? null,
      suffix: this.shadowRoot?.querySelector<HTMLElement>('.suffix') ?? null
    };
  }

  /** @internal */
  _hover(hovered: boolean) {
    if (hovered) this._internals.states.add('tab-hover');
    else this._internals.states.delete('tab-hover');
  }

  /** @internal */
  _configure({ scrollLeft, ...configuration }: WorkspaceHeaderConfiguration & { scrollLeft: number }) {
    this._scroll(scrollLeft);
    if (sameHeaderConfiguration(this.configuration, configuration)) return;
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

function scrollKeyframes(extent: number) {
  return [{ transform: 'translateX(0px)' }, { transform: `translateX(${-extent}px)` }];
}
