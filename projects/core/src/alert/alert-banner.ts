// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { CSSResult } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { AlertGroup } from './alert-group.js';
import styles from './alert-banner.css?inline';

/**
 * @deprecated
 * @element nve-alert-banner
 * @description An alert banner is an element that displays a brief, important message outside the context of the current page.
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --background
 * @cssprop --border-radius
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 */
export class AlertBanner extends AlertGroup {
  static styles: CSSResult[] = useStyles([...AlertGroup.styles, styles]);

  static readonly metadata = {
    tag: 'nve-alert-banner',
    version: '0.0.0',
    children: []
  };
}
