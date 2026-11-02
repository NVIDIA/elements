// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

declare global {
  var process: { env?: { NODE_ENV?: string } } | undefined;
}

/** Reports development diagnostics without depending on a component library. */
export function diagnostic(value: string, ...args: unknown[]) {
  if (globalThis.process?.env?.NODE_ENV === 'production') return;
  if (globalThis.location?.hostname !== 'localhost' && !globalThis.location?.href.includes('elements-playground'))
    return;
  console.warn(`@nve: ${value}`, ...args);
  globalThis.document?.dispatchEvent(new CustomEvent('NVE_ELEMENTS_LOG', { detail: { type: 'warn', value, args } }));
}
