import { describe, expect, it } from 'vitest';
import {
  getCrossShadowRootAnchorWarning,
  getExcessiveInstanceLimitWarning,
  getIdMatchNotFoundWarning,
  getInvalidParentWarning,
  getInvalidSlotsWarning,
  getInvalidSlottedChildrenWarning,
  getSSRMismatchWarning,
  getUseElementWarning
} from './audit.js';

describe('getExcessiveInstanceLimitWarning', () => {
  it('should return warning message for excessive instance limit', () => {
    expect(getExcessiveInstanceLimitWarning(10, 'test-element')).toBe(
      'Excessive rendering of 10 test-element were detected in DOM. Recycle/reuse elements when possible to improve application performance.'
    );
  });
});

describe('getInvalidSlotsWarning', () => {
  it('should return warning message for invalid slotted elements', () => {
    expect(getInvalidSlotsWarning('test-element', ['test-element-one', 'test-element-two'])).toBe(
      'Invalid slotted elements detected in test-element. Allowed: test-element-one, test-element-two'
    );
  });
});

describe('getInvalidParentWarning', () => {
  it('should return warning message for invalid parent element', () => {
    expect(getInvalidParentWarning('test-element', 'test-element-parent')).toBe(
      'Element test-element can only be used as a direct child of test-element-parent.'
    );
  });
});

describe('getIdMatchNotFoundWarning', () => {
  it('should return warning message for id selectors unmatched in DOM', () => {
    expect(getIdMatchNotFoundWarning('no-id-found-test-element')).toBe(
      'Provided id "no-id-found-test-element" was not found in DOM'
    );
  });
});

describe('getSSRMismatchWarning', () => {
  it('should return warning message for hydration mismatch', () => {
    expect(getSSRMismatchWarning('nve-tree')).toBe(
      'nve-tree rendered on the client with mismatched SSR content. https://lit.dev/docs/ssr/overview/'
    );
  });
});

describe('getCrossShadowRootAnchorWarning', () => {
  it('should return warning message for cross shadow root anchoring', () => {
    expect(getCrossShadowRootAnchorWarning('nve-tooltip')).toBe(
      '(deprecated) nve-tooltip was provided an anchor outside of its render root. https://NVIDIA.github.io/elements/docs/foundations/popovers/#shadow-root-anchoring'
    );
  });
});

describe('getInvalidSlottedChildrenWarning', () => {
  it('should return warning message for invalid slotted children', () => {
    expect(getInvalidSlottedChildrenWarning('test-element', ['test-element-one', 'test-element-two'])).toBe(
      'Invalid slotted children detected in test-element. Disallowed: test-element-one, test-element-two'
    );
  });
});

describe('getUseElementWarning', () => {
  it('should return warning message for invalid slotted children', () => {
    expect(getUseElementWarning('test-element', 'test-element-one', 'test-element-two')).toBe(
      'Element test-element-one found in test-element, use test-element-two instead.'
    );
  });
});
