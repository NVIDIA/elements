// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import { attachInternals, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import styles from './workspace-panel-header.css?inline';
import tabPresentation from '../tabs/tabs-item.presentation.css?inline';

/**
 * @element nve-workspace-panel-header
 * @description Supplies a workspace view title, decoration, and application controls.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/workspace
 * @slot - Noninteractive tab title.
 * @slot prefix - Noninteractive title decoration.
 * @slot suffix - Application controls for the selected view.
 * @cssprop --min-height
 * @cssprop --padding - Padding around the title.
 * @cssprop --prefix-padding - Padding around title decoration.
 * @cssprop --suffix-padding - Padding around header controls.
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
    scrollLeft: 0,
    animate: false,
    tabWidth: 0,
    headerHeight: 0,
    clipLeft: 0,
    clipWidth: 0
  };

  render() {
    const { selected, offset, scrollLeft, animate, tabWidth, headerHeight, clipLeft, clipWidth } = this.configuration;
    return html`<div internal-host>
      <div class="label-viewport" aria-hidden="true" style=${`left:${clipLeft}px;width:${clipWidth}px;height:${headerHeight}px`}>
        <div class="label-track" style=${`transform:translateX(${-scrollLeft}px)`}>
          <div class="label" ?data-animate=${animate} style=${`left:${offset - clipLeft}px;width:${tabWidth}px;height:${headerHeight}px`}>
            <span class="label-content"><slot name="prefix" ?data-empty=${!isServer && !this.querySelector(':scope > [slot="prefix"]')} @slotchange=${() => this.requestUpdate()}></slot><slot @slotchange=${() => this.requestUpdate()}></slot>${this.#hasTitle() ? null : this.parentElement?.id}</span>
          </div>
        </div>
      </div>
      ${selected ? html`<div class="separator" style=${`top:${headerHeight}px`} aria-hidden="true"></div>` : null}
      <div class="suffix" style=${`height:${headerHeight}px`} aria-hidden=${!selected} ?inert=${!selected} ?data-inactive=${!selected}><div class="suffix-content" ?data-empty=${!isServer && !this.querySelector(':scope > [slot="suffix"]')}><slot name="suffix" @slotchange=${() => this.requestUpdate()}></slot></div></div>
    </div>`;
  }

  /** @internal */
  _hover(hovered: boolean) {
    attachInternals(this);
    if (hovered) this._internals.states.add('tab-hover');
    else this._internals.states.delete('tab-hover');
  }

  /** @internal Workspace owns allocated chrome; supplied nodes keep their parents. */
  _configure(configuration: typeof this.configuration) {
    if (sameConfiguration(this.configuration, configuration)) return;
    attachInternals(this);
    if (configuration.selected) this._internals.states.add('selected');
    else this._internals.states.delete('selected');
    this.configuration = configuration;
  }

  #hasTitle() {
    if (isServer) return true;
    return [...this.childNodes].some(
      node => (!(node instanceof Element) || !node.hasAttribute('slot')) && !!node.textContent?.trim()
    );
  }
}

function sameConfiguration(
  current: Parameters<WorkspacePanelHeader['_configure']>[0],
  next: Parameters<WorkspacePanelHeader['_configure']>[0]
) {
  return (
    current.selected === next.selected &&
    current.offset === next.offset &&
    current.scrollLeft === next.scrollLeft &&
    current.animate === next.animate &&
    current.tabWidth === next.tabWidth &&
    current.headerHeight === next.headerHeight &&
    current.clipLeft === next.clipLeft &&
    current.clipWidth === next.clipWidth
  );
}
