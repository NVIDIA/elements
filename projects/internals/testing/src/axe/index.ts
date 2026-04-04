// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @experimental
 * Runs axe-core to meet min WCAG compliance requirements
 * https://wcag.com/legal/
 *
 * Finds on average 57% of WCAG issues automatically
 * https://github.com/dequelabs/axe-core
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const axeGlobal = globalThis as any as { axe: { run: (selectors: string[], config: object) => Promise<unknown> } };

export async function runAxe(selectors: string[], config = {}) {
  return await axeGlobal.axe.run(selectors, {
    rules: {
      // axe does not support ElementInternals AOM yet https://github.com/dequelabs/axe-core/issues/4259
      'aria-prohibited-attr': { enabled: false }
    },
    ...config
  });
}
