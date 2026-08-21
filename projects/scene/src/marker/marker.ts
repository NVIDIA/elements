// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { attachInternals, useStyles } from '@nvidia-elements/core/internal';
import { activateSceneMarker } from '../internal/markers/interaction.js';
import { notifyOwningMarkerLayer } from '../internal/markers/layer-notifications.js';
import { registerMarkerState, validateMarkerParent } from '../internal/markers/state.js';
import type { Quaternion, Vec3 } from '../internal/types.js';
import styles from './marker.css?inline';

/**
 * @element nve-scene-marker
 * @description Defines one declarative instance inside a Scene primitive layer.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/marker
 * @stable false
 */
export class SceneMarker extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-scene-marker',
    version: '0.0.0'
  };

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, 'role', 'tabindex'];
  }

  /** @private */
  declare _internals: ElementInternals;

  /** Defines the marker translation in x y z order. */
  @property({ type: Array }) position: Vec3 = [0, 0, 0];

  /** Defines the marker orientation as an x y z w quaternion. */
  @property({ type: Array }) orientation: Quaternion = [0, 0, 0, 1];

  /** Defines the marker scale in x y z order. */
  @property({ type: Array }) scale: Vec3 = [1, 1, 1];

  /** Defines the marker color using a CSS color value. */
  @property({ type: String }) color = '#ffffff';

  /** Defines the cube outline color using a CSS color value. */
  @property({ type: String, attribute: 'outline-color' }) outlineColor = 'transparent';

  /** Defines the start point for an arrow marker. */
  @property({ type: String }) from: string | null = null;

  /** Defines the end point for an arrow marker. */
  @property({ type: String }) to: string | null = null;

  #appliedDefaultRole = false;

  constructor() {
    super();
    registerMarkerState(this);
  }

  render() {
    return html`<slot></slot>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    attachInternals(this);
    validateMarkerParent(this);
    this.addEventListener('keydown', this.#handleKeydown);
    this.#syncAccessibility();
  }

  override disconnectedCallback(): void {
    this.removeEventListener('keydown', this.#handleKeydown);
    super.disconnectedCallback();
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if ((name === 'role' || name === 'tabindex') && oldValue !== newValue) {
      this.#syncAccessibility();
    }
  }

  protected override updated(): void {
    validateMarkerParent(this);
    notifyOwningMarkerLayer(this);
    this.#syncAccessibility();
  }

  #syncAccessibility(): void {
    if (!this.isConnected) {
      return;
    }
    if (this.tabIndex >= 0 && !this.hasAttribute('role')) {
      this._internals.role = 'button';
      this.#appliedDefaultRole = true;
      return;
    }
    if (this.#appliedDefaultRole) {
      this._internals.role = null;
      this.#appliedDefaultRole = false;
    }
  }

  #handleKeydown = (event: KeyboardEvent): void => {
    const role = this.#getAutomaticActivationRole();
    if (this.tabIndex < 0 || !role || !shouldActivateRoleOnKey(role, event.key)) {
      return;
    }
    event.preventDefault();
    activateSceneMarker(this, event);
  };

  #getAutomaticActivationRole(): 'button' | 'link' | null {
    if (this.hasAttribute('role')) {
      const role = this.getAttribute('role')?.trim().toLowerCase();
      return role === 'button' || role === 'link' ? role : null;
    }
    return this.#appliedDefaultRole ? 'button' : null;
  }
}

function shouldActivateRoleOnKey(role: 'button' | 'link', key: string): boolean {
  return key === 'Enter' || (role === 'button' && key === ' ');
}
