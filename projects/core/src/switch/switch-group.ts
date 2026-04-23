// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CSSResult } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import styles from './switch-group.css?inline';

/**
 * @element nve-switch-group
 * @description A switch group is a container for a group of switches.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/switch
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 */
@audit()
export class SwitchGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-switch-group',
    version: '0.0.0',
    children: ['label', 'nve-control-message', 'nve-switch']
  };
}
