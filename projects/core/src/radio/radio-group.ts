// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CSSResult } from 'lit';
import { audit, typeSSR, useStyles } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import styles from './radio-group.css?inline';

/**
 * @element nve-radio-group
 * @description Groups related radio buttons together with a shared label and validation messaging for single-select form inputs.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/radio
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 */
@audit()
@typeSSR()
export class RadioGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-radio-group',
    version: '0.0.0',
    children: ['label', 'nve-control-message', 'nve-radio']
  };
}
