// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

interface ElementDefinition extends CustomElementConstructor {
  metadata: { tag: string; version: string };
}

/** Defines an element with the global custom element registry. */
export function define(element: ElementDefinition) {
  if (!customElements.get(element.metadata.tag)) {
    customElements.define(element.metadata.tag, element);
  }
}
