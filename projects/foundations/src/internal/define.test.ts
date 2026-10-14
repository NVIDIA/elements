// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { define } from '@nvidia-elements/foundations/internal';

describe('define', () => {
  it('should register an element using its metadata without initializing core state', () => {
    class TestElement extends HTMLElement {
      static readonly metadata = { tag: 'foundations-define-test', version: '0.0.0' };
    }

    const state = Object.getOwnPropertyDescriptor(globalThis, 'NVE_ELEMENTS');
    define(TestElement);
    expect(customElements.get(TestElement.metadata.tag)).toBe(TestElement);
    expect(Object.getOwnPropertyDescriptor(globalThis, 'NVE_ELEMENTS')).toEqual(state);
  });

  it('should preserve an existing registration when imported more than once', () => {
    class TestElement extends HTMLElement {
      static readonly metadata = { tag: 'foundations-duplicate-test', version: '0.0.0' };
    }

    class DuplicateElement extends HTMLElement {
      static readonly metadata = TestElement.metadata;
    }

    define(TestElement);
    expect(() => define(TestElement)).not.toThrow();
    expect(() => define(DuplicateElement)).not.toThrow();
    expect(customElements.get(TestElement.metadata.tag)).toBe(TestElement);
  });
});
