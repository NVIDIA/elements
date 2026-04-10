// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CSSResult } from 'lit';
import { useStyles, appendRootNodeStyle } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import globalStyles from './input-group.global.css?inline';
import styles from './input-group.css?inline';

/**
 * @element nve-input-group
 * @description Visually combines many related input controls into a unified composite field with shared styling.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/input
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --gap
 * @cssprop --border
 * @cssprop --padding
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 */
export class InputGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-input-group',
    version: '0.0.0'
  };

  async connectedCallback() {
    appendRootNodeStyle(this, globalStyles);
    super.connectedCallback();
    await this.updateComplete;
    const controls = Array.from(
      this.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])')!.assignedElements()
    );
    controls[0]?.setAttribute('first-control', '');
    controls[controls.length - 1]?.setAttribute('last-control', '');
  }
}
