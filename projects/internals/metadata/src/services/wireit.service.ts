// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WireitGraph } from '../types.js';

export class WireitService {
  static #graph: WireitGraph | null = null;

  static async getData() {
    if (!WireitService.#graph) {
      WireitService.#graph = (await import('../../static/wireit.json', { with: { type: 'json' } })).default;
    }
    return WireitService.#graph;
  }
}
