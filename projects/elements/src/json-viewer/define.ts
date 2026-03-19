// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { define, LogService } from '@nvidia-elements/core/internal';
import { JSONNode } from './node/node.js';
import { JSONViewer } from './index.js';

LogService.warn('json-viewer is an internal API and will be removed.');

define(JSONViewer);
define(JSONNode);

declare global {
  interface HTMLElementTagNameMap {
    'nve-json-viewer': JSONViewer;
    'nve-json-node': JSONNode;
  }
}
