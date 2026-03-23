import { describe, expect, it } from 'vitest';
import { getControlLayout, breakpoints, isInlineInputType } from './layout.js';

describe('getControlLayout', () => {
  it('should show all messages that do not have a validation requirement', async () => {
    const layout = 'horizontal-inline';

    expect(getControlLayout(breakpoints.horizontalInline, layout)).toBe(layout);

    expect(getControlLayout(breakpoints.horizontalInline - 1, layout)).toBe('horizontal-inline');

    expect(getControlLayout(breakpoints.horizontal - 1, layout)).toBe('horizontal');

    expect(getControlLayout(breakpoints.verticalInline - 1, layout)).toBe('vertical-inline');

    expect(getControlLayout(breakpoints.vertical - 1, layout)).toBe('vertical');
  });
});

describe('isInlineInputType', () => {
  it('should determine if input is a inline type', () => {
    expect(isInlineInputType({ type: 'radio' } as HTMLInputElement)).toBe(true);
    expect(isInlineInputType({ type: 'checkbox' } as HTMLInputElement)).toBe(true);
  });
});
