// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { notifyOwningSceneLabel } from '../internal/label/notifications.js';
import { invalidateLabel, registerLabelState, touchLabelState } from '../internal/label/state.js';
import type { Vec3 } from '../internal/types.js';
import styles from './label.css?inline';

export type SceneLabelAnchor =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

/**
 * @element nve-scene-label
 * @description Positions one element of DOM content in a Scene.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/label
 * @slot - Exactly one element of label content, retained in light DOM by the owning Scene.
 * @stable false
 */
export class SceneLabel extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene-label',
    version: '0.0.0'
  };

  /** Selects an optional unique frame in the owning Scene. */
  @property({ type: String }) frame: string | null = null;

  /** Defines the anchor point in frame or scene coordinates in x y z order. */
  @property({ type: Array }) position: Vec3 = [0, 0, 0];

  /** Selects which content-box point aligns to the projected position. */
  @property({ type: String }) anchor: SceneLabelAnchor = 'center';

  /** Defines an x/y screen-space offset in CSS pixels. */
  @property({ type: Array }) offset: [number, number] = [0, 0];

  constructor() {
    super();
    registerLabelState(this);
  }

  /** Marks label capture content dirty for the owning Scene. */
  invalidate(): void {
    invalidateLabel(this);
    notifyOwningSceneLabel(this);
  }

  /** Indicates that the uniquely referenced frame has no current transform. Managed by the owning Scene. */
  get stale(): boolean {
    return this.hasAttribute('stale');
  }

  /** Indicates texture-mode pointer occlusion. Managed by the owning Scene. */
  get occluded(): boolean {
    return this.hasAttribute('occluded');
  }

  render() {
    return html`<slot></slot>`;
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.size > 0) {
      touchLabelState(this);
      notifyOwningSceneLabel(this);
    }
  }
}
