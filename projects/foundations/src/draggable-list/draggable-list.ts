// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import { useStyles } from '../internal/styles/index.js';
import { DraggableListController } from './draggable-list.controller.js';
import styles from './draggable-list.css?inline';

const dropzoneSelector = '[nve-draggable~="dropzone"]';

/**
 * @element nve-draggable-list
 * @description Native dragging and keyboard movement for consumer-owned items. Activate a focusable item or handle to pick up, use arrows or Home/End to choose a position, then Enter or Space to request a drop. Escape cancels; Tab reaches another list, and click or tap places the item. A handle limits pickup to that control. The application owns order and applies or ignores each drop request. Items can transfer between lists. Set `nve-draggable="dropzone"` on the list to append items by dropping on its background. Give the list a visible drop area when empty and make it focusable for keyboard placement. Use Foundations i18n to translate dragPickedUp, dragPosition, dragDropped, and dragCanceled messages; templates accept {label}, {position}, and {count}. The component supports native dragging and rendered virtual items; applications handle other touch gestures and offscreen movement.
 * @documentation https://nvidia.github.io/elements/docs/foundations/draggable-list/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/foundations/draggable-list
 * @slot - Draggable items and optional focusable `nve-draggable="dropzone"` append targets. Empty lists can receive items through a visible dropzone on the list or a child. Use focusable items or labeled `nve-draggable="handle"` controls for keyboard pickup. Explicit `draggable="false"` prevents pickup. The wrapper adds no role or tab stops. Scripts, styles, templates, hidden and inert items cannot receive drops.
 * @event draggable-start - Pickup intent with immutable DraggableSourceDetail: source, sourceContainer, sourceIndex, and interaction. Indices refer to rendered items, excluding dropzones; sourceIndex snapshots pickup order. Events bubble across shadow boundaries.
 * @event draggable-drag - Native drag movement with DraggableSourceDetail. The source container emits this event.
 * @event draggable-enter - A proposed target or placement changed, with DraggableDropDetail. The destination container emits this event.
 * @event draggable-over - Native movement over a valid destination, with DraggableDropDetail.
 * @event draggable-leave - The proposed placement cleared, with its previous DraggableDropDetail.
 * @event draggable-drop - Reorder request with immutable DraggableDropDetail: source, target, sourceContainer, targetContainer, sourceIndex, targetIndex, placement (before, after, append), and interaction (pointer or keyboard). targetIndex is the destination insertion index after removing source. A drop on the list background reports append with the list as both target and targetContainer. The destination emits this event without moving DOM. Match column data and cells in your handler; map virtual elements to logical data yourself. A no-op emits no request.
 * @event draggable-end - The source container reports DraggableEndDetail with dropped indicating that a request fired, not application acceptance. Cancellation and cleanup emit dropped: false.
 * @stable false
 */
export class DraggableList extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-draggable-list', version: '0.0.0' };

  /** Movement axis for keyboard navigation and pointer midpoint placement. Layout remains consumer-owned. Horizontal movement follows text direction. */
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  /** Disable pickup and drops, and cancel an unfinished interaction. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private announcement = '';

  #controller: DraggableListController = new DraggableListController(this, () => ({
    items: this.#children.filter(item => !item.matches(dropzoneSelector)),
    dropZones: [...this.#children, this].filter(item => item.matches(dropzoneSelector)),
    orientation: this.orientation,
    disabled: this.disabled,
    accepts: (_source, container) => container.localName === DraggableList.metadata.tag,
    announce: message => {
      this.announcement = message;
    }
  }));

  get #children() {
    return Array.from(this.children).filter(
      (item): item is HTMLElement => item instanceof HTMLElement && !item.matches('script,style,template')
    );
  }

  render() {
    return html`<div internal-host><slot @slotchange=${() => this.requestUpdate()}></slot></div><span class="announcement" role="status" aria-live="polite" aria-atomic="true">${this.announcement}</span>`;
  }

  /** Cancel pickup without requesting a reorder. */
  cancel(): void {
    this.#controller.cancel();
  }
}
