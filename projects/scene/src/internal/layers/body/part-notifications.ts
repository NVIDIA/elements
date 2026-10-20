// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const listeners = new WeakMap<Element, () => void>();

/** Registers the body's recompilation callback without coupling part elements to body compilation. */
export function observeBodyParts(body: Element, listener: () => void): void {
  listeners.set(body, listener);
}

/** Recompiles the parent body after a direct shape or mesh part changes. */
export function notifyOwningBodyPart(part: Element): void {
  const body = part.parentElement;
  if (body) listeners.get(body)?.();
}
