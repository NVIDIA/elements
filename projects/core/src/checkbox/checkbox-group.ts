// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CSSResult } from 'lit';
import { typeSSR, useStyles, audit } from '@nvidia-elements/core/internal';
import { ControlGroup } from '@nvidia-elements/core/forms';
import styles from './checkbox-group.css?inline';

/**
 * @element nve-checkbox-group
 * @description Groups related checkboxes together with a shared label and validation messaging for multi-select form inputs.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/checkbox
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 */
@audit()
@typeSSR()
export class CheckboxGroup extends ControlGroup {
  static styles: CSSResult[] = useStyles([...ControlGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-checkbox-group',
    version: '0.0.0',
    children: ['label', 'nve-control-message', 'nve-checkbox']
  };
}
