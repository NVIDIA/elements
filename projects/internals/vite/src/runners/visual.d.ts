// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { visualRunner as defaultRunner } from '../index.js';

type Runner = typeof defaultRunner;

export declare class VisualRunner {
  constructor(options?: { chromiumArgs?: string[]; chromiumChannel?: string });
  open: Runner['open'];
  close: Runner['close'];
  render: Runner['render'];
  inspect: Runner['inspect'];
  runWebGPUSmoke: Runner['runWebGPUSmoke'];
}

export declare const visualRunner: VisualRunner;
