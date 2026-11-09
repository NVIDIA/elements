// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';

import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import type { WorkspaceHeaderConfiguration } from '../utils/presentation/header-configuration.utils.js';

import type { WorkspacePanelHeader } from '../panel-header/panel-header.js';

import styles from './panel.css?inline';

/**
 * @element nve-workspace-panel
 * @description Stable application content and its workspace chrome.
 * @documentation https://nvidia.github.io/elements/docs/elements/workspace/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/workspace
 * @command --enter-fullscreen - Present this panel's group in native fullscreen.
 * @command --exit-fullscreen - Exit native fullscreen.
 * @command --toggle-fullscreen - Toggle native fullscreen for this panel's group.
 * @command --open - Open and activate the targeted supplied panel. Repeated activation is silent.
 * @command --close - Close the targeted panel when its workspace is closable.
 * @command --select - Activate an open supplied panel without reopening a closed panel.
 * @command --place - Apply the invoker's typed placement request when rearrangeable; membership changes also require groupable.
 * @slot - Application content.
 * @slot header - Title and controls.
 * @slot footer - Status and actions.
 * @cssprop --background
 * @cssprop --border
 * @cssprop --box-shadow
 */
export class WorkspacePanel extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-workspace-panel',
    version: '0.0.0',
    parents: ['nve-workspace'],
    children: ['nve-workspace-panel-header', 'nve-workspace-panel-content', 'nve-workspace-panel-footer']
  };

  /** Application minimum total panel width in pixels. */
  @property({ type: Number, attribute: 'min-width', reflect: true }) minWidth = 0;

  /** Application minimum total panel height in pixels. */
  @property({ type: Number, attribute: 'min-height', reflect: true }) minHeight = 0;

  @state() private selected = false;

  @state() private headerHeight = 0;

  /** @internal */
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }

  render() {
    const { selected, headerHeight } = this;
    return html`
      <div internal-host>
        <div class="surface">
          <slot name="header"></slot>
          <div class="content" style=${`top:${headerHeight}px`} ?hidden=${!selected}>
            <div class="body" tabindex="0"><slot></slot></div>
            <slot name="footer"></slot>
          </div>
        </div>
        <div class="frame" ?hidden=${!selected}></div>
      </div>
    `;
  }

  /** @internal */
  _present(presented: boolean) {
    if (this._internals.states.has('workspace-presented') === presented) {
      return;
    }

    if (presented) this._internals.states.add('workspace-presented');
    else this._internals.states.delete('workspace-presented');
  }

  /** @internal */
  _configure(configuration: WorkspaceHeaderConfiguration & { scrollLeft: number }) {
    this.selected = configuration.selected;
    this.headerHeight = configuration.headerHeight;
    this.querySelector<WorkspacePanelHeader>(':scope > nve-workspace-panel-header')?._configure(configuration);
  }
}
