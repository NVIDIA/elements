// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import styles from './workspace-panel.css?inline';

/**
 * @element nve-workspace-panel
 * @description Stable application content and its workspace label.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/workspace
 * @command --open - Open and activate the targeted supplied panel. Repeated activation is silent.
 * @command --close - Close the targeted panel when its workspace is closable.
 * @command --select - Activate an open supplied panel without reopening a closed panel.
 * @command --arrange - Open arrangement actions for the targeted panel when rearrangeable.
 * @command --arrange-pane - Open arrangement actions for its whole tabbed pane when rearrangeable.
 * @command --place - Apply the invoker's typed placement request when rearrangeable.
 * @slot - Panel content.
 * @slot label - Composable noninteractive panel label.
 * @cssprop --background
 * @cssprop --border
 */
export class WorkspacePanel extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-workspace-panel', version: '0.0.0', parents: ['nve-workspace'] };

  /** Application minimum total panel width in pixels. */
  @property({ type: Number, attribute: 'min-width', reflect: true }) minWidth = 0;

  /** Application minimum total panel height in pixels. */
  @property({ type: Number, attribute: 'min-height', reflect: true }) minHeight = 0;

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

  /** @internal */
  declare _internals: ElementInternals;

  render() {
    const { selected, offset, scrollLeft, animate, tabWidth, headerHeight, clipLeft, clipWidth } = this.configuration;
    return html`
      <div internal-host>
        <div
          class="label-viewport"
          aria-hidden="true"
          style=${`left:${clipLeft}px;width:${clipWidth}px;height:${headerHeight}px`}>
          <div class="label-track" style=${`transform:translateX(${-scrollLeft}px)`}>
            <div class="label" ?data-animate=${animate} style=${`left:${offset - clipLeft}px;width:${tabWidth}px`}>
              <span class="label-content"><slot name="label">${this.id}</slot></span>
            </div>
          </div>
        </div>
        <div class="content" style=${`top:${headerHeight}px`} tabindex="0" ?hidden=${!selected}><slot></slot></div>
      </div>
    `;
  }

  /** @internal Updates derived workspace presentation without changing native visibility attributes. */
  _present(presented: boolean) {
    attachInternals(this);
    if (presented) this._internals.states.add('workspace-presented');
    else this._internals.states.delete('workspace-presented');
  }

  /** @internal Configures presentation without relocating supplied nodes. */
  _configure(configuration: typeof this.configuration) {
    this.configuration = configuration;
  }
}
