// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  DOCS_LOG_URL,
  getCrossShadowRootAnchorWarning,
  getDuplicatePackageGlobalVersionWarning,
  getExcessiveInstanceLimitWarning,
  getIdMatchNotFoundWarning,
  getInvalidParentWarning,
  getInvalidSlottedChildrenWarning,
  getSSRMismatchWarning
} from './audit-logs.js';

describe('getExcessiveInstanceLimitWarning', () => {
  it('should return warning message for excessive instance limit', () => {
    expect(getExcessiveInstanceLimitWarning(10, 'test-element')).toBe(
      `Excessive rendering of 10 test-element were detected in DOM. Recycle/reuse elements when possible to improve application performance. ${DOCS_LOG_URL}#excessive-instance-limit`
    );
  });
});

describe('getInvalidSlottedChildrenWarning', () => {
  it('should return warning message for invalid slotted elements', () => {
    expect(getInvalidSlottedChildrenWarning('test-element', ['test-element-one', 'test-element-two'])).toBe(
      `Invalid slotted elements detected in test-element. Allowed: test-element-one, test-element-two. ${DOCS_LOG_URL}#invalid-slotted-children`
    );
  });
});

describe('getInvalidParentWarning', () => {
  it('should return warning message for invalid parent element', () => {
    expect(getInvalidParentWarning('test-element', 'test-element-parent')).toBe(
      `Element test-element can only be used as a direct child of test-element-parent. ${DOCS_LOG_URL}#invalid-parent`
    );
  });
});

describe('getIdMatchNotFoundWarning', () => {
  it('should return warning message for id selectors unmatched in DOM', () => {
    expect(getIdMatchNotFoundWarning('no-id-found-test-element')).toBe(
      `Provided id "no-id-found-test-element" not found in DOM. ${DOCS_LOG_URL}#id-match-not-found`
    );
  });
});

describe('getSSRMismatchWarning', () => {
  it('should return warning message for hydration mismatch', () => {
    expect(getSSRMismatchWarning('nve-tree')).toBe(
      `nve-tree rendered on the client with mismatched SSR content. ${DOCS_LOG_URL}#ssr-mismatch`
    );
  });
});

describe('getCrossShadowRootAnchorWarning', () => {
  it('should return warning message for cross shadow root anchoring', () => {
    expect(getCrossShadowRootAnchorWarning('nve-tooltip')).toBe(
      `(deprecated) nve-tooltip provided an anchor outside of its render root. ${DOCS_LOG_URL}#cross-shadow-root-anchor`
    );
  });
});

describe('getDuplicatePackageGlobalVersionWarning', () => {
  it('should return warning message for duplicate package version', () => {
    expect(getDuplicatePackageGlobalVersionWarning()).toBe(
      `@nve: Multiple versions of Elements loaded, please check for duplicate package versions. ${DOCS_LOG_URL}#duplicate-package-version`
    );
  });
});
