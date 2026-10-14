// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { unsafeCSS } from 'lit';
import base from './base.css?inline';
import state from './interaction-state.css?inline';

export function useStyles(styles: unknown[]) {
  return [unsafeCSS(base), unsafeCSS(state), ...styles.map(style => unsafeCSS(style))];
}
