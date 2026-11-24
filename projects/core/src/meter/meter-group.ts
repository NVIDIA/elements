// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController } from 'lit';
import { html, LitElement } from 'lit';
import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { Meter } from './meter.js';
import { getMeterRange } from './meter-range.js';
import styles from './meter-group.css?inline';

/**
 * @element nve-meter-group
 * @description A meter group arranges direct `nve-meter` children into a shared segmented track in DOM order. Children must have matching effective bounds. The `no-invalid-meter-group` lint rule checks static bounds and capacity.
 * @documentation https://nvidia.github.io/elements/docs/elements/meter/
 * @since 2.28.0
 * @entrypoint \@nvidia-elements/core/meter
 * @slot - Direct meter children that own their values, bounds, colors, statuses, and accessible names.
 * @cssprop --background - Shared track background.
 * @cssprop --height - Shared track height.
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/group_role
 * @stable false
 */
export class MeterGroup extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = { tag: 'nve-meter-group', version: '0.0.0', children: [Meter.metadata.tag] };

  /** @private */
  declare _internals: ElementInternals;

  #controllers = new Map<Meter, ReactiveController>();

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.requestUpdate()}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
    this.requestUpdate();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    for (const meter of this.#controllers.keys()) this.#releaseMeter(meter);
  }

  updated() {
    if (!this.isConnected) return;
    const meters = this.shadowRoot!.querySelector('slot')!
      .assignedElements()
      .filter((element): element is Meter => element instanceof Meter && element.parentElement === this);

    for (const meter of this.#controllers.keys()) {
      if (!meters.includes(meter)) this.#releaseMeter(meter);
    }
    meters.forEach(meter => this.#observeMeter(meter));

    meters.forEach(meter => {
      const size = `${getMeterRange(meter).fraction * 100}%`;
      if (meter.style.getPropertyValue('--_meter-segment-size') !== size) {
        meter.style.setProperty('--_meter-segment-size', size);
      }
    });
  }

  #observeMeter(meter: Meter) {
    if (this.#controllers.has(meter)) return;
    let previous = getMeterRange(meter);
    const controller: ReactiveController = {
      hostUpdated: () => {
        const range = getMeterRange(meter);
        if (range.min !== previous.min || range.max !== previous.max || range.value !== previous.value) {
          previous = range;
          this.requestUpdate();
        }
      }
    };
    this.#controllers.set(meter, controller);
    meter.addController(controller);
  }

  #releaseMeter(meter: Meter) {
    const controller = this.#controllers.get(meter);
    if (controller) meter.removeController(controller);
    this.#controllers.delete(meter);
    // A new group may already own the meter after a move between groups.
    if (meter.parentElement === this || !(meter.parentElement instanceof MeterGroup)) {
      meter.style.removeProperty('--_meter-segment-size');
    }
  }
}
