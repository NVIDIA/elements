// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Waits for one canvas paint after a label mutation without retaining stale listeners. */
export function waitForLabelMutationPaint(
  canvas: EventTarget,
  mutate: () => void,
  timeoutMs = 1_000
): Promise<boolean> {
  return new Promise(resolve => {
    let settled = false;
    const finish = (painted: boolean) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timeout);
      canvas.removeEventListener('paint', onPaint);
      resolve(painted);
    };
    const onPaint = () => finish(true);
    const timeout = globalThis.setTimeout(() => finish(false), timeoutMs);
    canvas.addEventListener('paint', onPaint, { once: true });
    mutate();
  });
}
