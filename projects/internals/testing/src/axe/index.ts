// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { AxeResults, RunOptions } from 'axe-core';

/**
 * @experimental
 * Runs axe-core to meet min WCAG compliance requirements
 * https://wcag.com/legal/
 *
 * Finds on average 57% of WCAG issues automatically
 * https://github.com/dequelabs/axe-core
 */
// axe-core installs this browser global through the accessibility-test setup.
const axeGlobal = globalThis as typeof globalThis & {
  axe: { run: (selectors: string[], config: RunOptions) => Promise<AxeResults> };
};

export async function runAxe(selectors: string[], config: RunOptions = {}): Promise<AxeResults> {
  return await axeGlobal.axe.run(selectors, {
    rules: {
      // axe does not support ElementInternals AOM yet https://github.com/dequelabs/axe-core/issues/4259
      'aria-prohibited-attr': { enabled: false }
    },
    ...config
  });
}
