import { describe, expect, it, vi } from 'vitest';
import { stopEvent } from '@elements/elements/internal';

describe('stopEvent', () => {
  it('should cause event to prevent default behavior (preventDefault)', async () => {
    const event = new KeyboardEvent('keydown', { code: 'Enter' });
    stopEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('should prevent event from bubbling (stopPropagation)', async () => {
    const fn = vi.fn();
    document.addEventListener('keydown', fn);
    document.body.addEventListener('keydown', e => stopEvent(e));
    document.body.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }));
    expect(fn).toBeCalledTimes(0);
  });
});
