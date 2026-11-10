// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';

import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';
import { scopedRegistry } from '@nvidia-elements/foundations/internal/decorators';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';

import { DragHandle } from '@nvidia-elements/core/drag-handle';
import { IconButton } from '@nvidia-elements/core/icon-button';

import type { DashboardSpanConstraints } from '../dashboard.types.js';

import styles from './panel.css?inline';

interface DashboardPanelPresentation {
  readonly placed: boolean;
  readonly movable: boolean;
  readonly resizable: boolean;
  readonly mode?: 'move' | 'resize';
  readonly carried?: boolean;
  readonly lifted?: boolean;
  readonly fullscreen?: 'selected' | 'excluded';
  readonly fullscreenControl?: 'enter' | 'exit' | 'unavailable';
  readonly labels: Readonly<Record<string, string>>;
}

/**
 * @element nve-dashboard-panel
 * @description A stable application surface identified by a durable panel ID.
 * @documentation https://nvidia.github.io/elements/docs/elements/dashboard/
 * @since 0.0.0
 * @stable false
 * @entrypoint \@nvidia-elements/core/dashboard
 * @command --enter-fullscreen - Present this panel in native fullscreen.
 * @command --exit-fullscreen - Exit native fullscreen.
 * @command --toggle-fullscreen - Toggle native fullscreen for this panel.
 * @command --place - Apply the invoking control's integer grid placement without pointer target snapping. Anchored span changes require resizing; other position changes require movement.
 * @command --move-left - Move left through the same contact-aware movement step as a movement-handle arrow key. The containing dashboard applies its capabilities and layout policy.
 * @command --move-right - Move right through the same contact-aware movement step as a movement-handle arrow key. The containing dashboard applies its capabilities and layout policy.
 * @command --move-up - Move up through the same contact-aware movement step as a movement-handle arrow key. The containing dashboard applies its capabilities and layout policy.
 * @command --move-down - Move down through the same contact-aware movement step as a movement-handle arrow key. The containing dashboard applies its capabilities and layout policy.
 * @command --move-to-start - Place at the growth-axis start, using available space before making room. Keep the bounded-axis coordinate unless placement supplies another. Uses the same operation as Home on the movement grip.
 * @command --increase-width - Increase width by one cell, subject to panel constraints and the containing dashboard capabilities.
 * @command --decrease-width - Decrease width by one cell, subject to panel constraints and the containing dashboard capabilities.
 * @command --increase-height - Increase height by one cell, subject to panel constraints and the containing dashboard capabilities.
 * @command --decrease-height - Decrease height by one cell, subject to panel constraints and the containing dashboard capabilities.
 * @slot - Application content in the scrolling body. Content, data, and native hidden state remain application owned.
 * @slot header - Required panel header with a title and optional application controls.
 * @slot footer - Optional status and actions outside the body.
 * @cssprop --background
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --control-width - Width shared by the move and resize controls. Defaults to 36px.
 * @cssprop --control-height - Height shared by the move and resize controls. Defaults to 48px.
 * @cssprop --resize-target-size - Extra pointer resize reach on each side of the panel edge. Defaults to 3px; outward reach stops halfway across the cell gap. Configure on the panel. Inward reach covers application content at the edge, including on hybrid touch devices.
 * @cssprop --box-shadow
 * @csspart drag-handle - Movement control.
 * @csspart resize-button - Resize control.
 * @csspart fullscreen-button - Panel fullscreen control.
 */
@scopedRegistry()
export class DashboardPanel extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = {
    tag: 'nve-dashboard-panel',
    version: '0.0.0',
    parents: ['nve-dashboard'],
    children: ['nve-dashboard-panel-header', 'nve-dashboard-panel-content', 'nve-dashboard-panel-footer']
  };
  static elementDefinitions = { [DragHandle.metadata.tag]: DragHandle, [IconButton.metadata.tag]: IconButton };

  /** Smallest width in columns. */
  @property({ type: Number, attribute: 'min-column-span', reflect: true }) minColumnSpan = 1;

  /** Smallest height in rows. */
  @property({ type: Number, attribute: 'min-row-span', reflect: true }) minRowSpan = 1;

  /** Largest width in columns. */
  @property({ type: Number, attribute: 'max-column-span', reflect: true }) maxColumnSpan = 1_000_000;

  /** Largest height in rows. */
  @property({ type: Number, attribute: 'max-row-span', reflect: true }) maxRowSpan = 1_000_000;

  /** Disables direct movement. Collision displacement remains available. */
  @property({ type: Boolean, attribute: 'move-disabled', reflect: true }) moveDisabled = false;

  /** Disables direct resizing. */
  @property({ type: Boolean, attribute: 'resize-disabled', reflect: true }) resizeDisabled = false;

  @state() private presentation?: DashboardPanelPresentation;

  /** @internal */
  declare _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'region';
  }

  disconnectedCallback() {
    for (const control of this.shadowRoot?.querySelectorAll('.grip > [data-pointer-focus]') ?? []) {
      control.removeAttribute('data-pointer-focus');
    }

    this._internals.states.delete('placed');
    this._internals.states.delete('fullscreen');
    this._internals.states.delete('fullscreen-excluded');
    super.disconnectedCallback();
  }

  #controlFocusOut = (event: FocusEvent) => {
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.removeAttribute('data-pointer-focus');
    }
  };

  /** @internal */
  _getSpanConstraints(): DashboardSpanConstraints {
    return {
      id: this.id,
      minColumnSpan: this.minColumnSpan,
      minRowSpan: this.minRowSpan,
      maxColumnSpan: this.maxColumnSpan,
      maxRowSpan: this.maxRowSpan
    };
  }

  /** @internal */
  _configure(presentation: DashboardPanelPresentation) {
    const previous = this.presentation;

    this.#configureFullscreen(presentation.fullscreen);
    this.#configurePlacement(presentation.placed);

    if (presentation.carried) {
      this._internals.states.add('carried');
    } else {
      this._internals.states.delete('carried');
    }

    if (presentation.lifted) {
      this._internals.states.add('lifted');
    } else {
      this._internals.states.delete('lifted');
    }

    this._internals.ariaLabel = this._getLabel();

    if (
      !previous ||
      previous.placed !== presentation.placed ||
      previous.movable !== presentation.movable ||
      previous.resizable !== presentation.resizable ||
      previous.mode !== presentation.mode ||
      previous.fullscreenControl !== presentation.fullscreenControl ||
      previous.labels !== presentation.labels
    ) {
      this.presentation = presentation;
    }
  }

  #configurePlacement(placed: boolean) {
    if (placed) {
      this._internals.states.add('placed');
    } else {
      this._internals.states.delete('placed');
    }
  }

  #configureFullscreen(fullscreen: DashboardPanelPresentation['fullscreen']) {
    if (fullscreen === 'selected') {
      this._internals.states.add('fullscreen');
    } else {
      this._internals.states.delete('fullscreen');
    }

    if (fullscreen === 'excluded') {
      this._internals.states.add('fullscreen-excluded');
    } else {
      this._internals.states.delete('fullscreen-excluded');
    }
  }

  #renderFullscreenControl() {
    const control = this.presentation?.fullscreenControl;
    if (!control) return null;

    const selected = control === 'exit';

    return html`<div class="fullscreen-action"><nve-icon-button
      part="fullscreen-button" icon-name=${selected ? 'minimize' : 'maximize'}
      container="flat" size="sm" command="--toggle-fullscreen"
      .commandForElement=${this} .disabled=${control === 'unavailable'}
      aria-label=${this.presentation?.labels[selected ? 'exitFullscreen' : 'enterFullscreen']}
    ></nve-icon-button></div>`;
  }

  /** @internal */
  _getLabel(): string {
    const header = this.querySelector(':scope > nve-dashboard-panel-header');
    return (
      [...(header?.childNodes ?? [])]
        .filter(node => !(node instanceof Element) || !node.getAttribute('slot'))
        .map(node => node.textContent ?? '')
        .join('')
        .trim() || this.id
    );
  }

  #renderResizeEdges(resizable: boolean) {
    return resizable
      ? html`
        <div class="resize-edge left" data-dashboard-action="resize" data-dashboard-edge="left" aria-hidden="true"></div>
        <div class="resize-edge right" data-dashboard-action="resize" data-dashboard-edge="right" aria-hidden="true"></div>
        <div class="resize-edge top" data-dashboard-action="resize" data-dashboard-edge="top" aria-hidden="true"></div>
        <div class="resize-edge bottom" data-dashboard-action="resize" data-dashboard-edge="bottom" aria-hidden="true"></div>
      `
      : null;
  }

  render() {
    const presentation = this.presentation;
    const movable = !!presentation?.movable;
    const resizable = !!presentation?.resizable;
    const hasFooter = !isServer && [...this.children].some(child => child.slot === 'footer');
    const footerCollapsed = !resizable && !hasFooter;
    const labels = presentation?.labels ?? {};
    const placed = presentation?.placed !== false;

    return html`
      <div internal-host ?hidden=${!placed} ?inert=${!placed}>
        <div class="header">
          <div class="grip move-grip" ?inert=${!movable}>
            <nve-drag-handle data-dashboard-action="move" @focusout=${this.#controlFocusOut} part="drag-handle" draggable="false" nofocus .pressed=${presentation?.mode === 'move'} aria-label=${labels.move}></nve-drag-handle>
          </div>
          <span class="control-divider move-divider" aria-hidden="true" ?inert=${!movable}></span>
          <slot name="header"></slot>
          ${this.#renderFullscreenControl()}
        </div>
        <div class="body" tabindex="0"><slot></slot></div>
        <div class="footer" ?inert=${footerCollapsed}>
          <slot name="footer" @slotchange=${() => this.requestUpdate()}></slot>
          <span class="control-divider resize-divider" aria-hidden="true" ?inert=${!resizable}></span>
          <div class="grip resize-grip" ?inert=${!resizable}>
            <nve-icon-button type="button" data-dashboard-action="resize" @focusout=${this.#controlFocusOut} class="resize" part="resize-button" icon-name="arrow-both" container="flat" size="sm" nofocus .pressed=${presentation?.mode === 'resize'} aria-label=${labels.resize}></nve-icon-button>
          </div>
        </div>
      </div>
      ${this.#renderResizeEdges(resizable)}
    `;
  }
}
