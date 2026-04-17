// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/* istanbul ignore file -- @preserve */
import { isServer } from 'lit';
import { supportsCSSPositionArea, supportsCSSLegacyInsetArea } from '../utils/supports.js';
import _popoverStyles from './popover.css?inline';

// vite/esbuild minifier does not understand this syntax
const anchor = /* css */ `
[internal-host] { anchor-name: --internal-host }
.arrow { position-anchor: --internal-host }
`;

function getPopoverStyles() {
  if (!isServer && !supportsCSSPositionArea() && supportsCSSLegacyInsetArea()) {
    return _popoverStyles.replaceAll('position-area', 'inset-area') + anchor;
  } else {
    return _popoverStyles + anchor;
  }
}

export const popoverStyles = getPopoverStyles();
