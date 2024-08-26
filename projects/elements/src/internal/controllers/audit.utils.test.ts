import { describe, expect, it } from 'vitest';
import { getExcessiveInstanceLimitWarning, getInvalidSlotsWarning } from './audit.utils.js';

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
