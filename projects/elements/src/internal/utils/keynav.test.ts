import { describe, expect, it, vi } from 'vitest';
import { onKeys } from '@nvidia-elements/core/internal';

describe('onKeys', () => {
  it('should call function when a single key is pressed', async () => {
    const fn = vi.fn();
    onKeys(['Enter'], new KeyboardEvent('keydown', { code: 'Enter' }), fn);
    expect(fn).toBeCalledTimes(1);
  });

  it('should not call function when a non listed key is pressed', async () => {
    const fn = vi.fn();
    onKeys(['Space'], new KeyboardEvent('keydown', { code: 'Enter' }), fn);
    expect(fn).toBeCalledTimes(0);
  });

  it('should call function when multiple possible keys are pressed', async () => {
    const fn = vi.fn();
    onKeys(['Enter', 'Space'], new KeyboardEvent('keydown', { code: 'Enter' }), fn);
    onKeys(['Enter', 'Space'], new KeyboardEvent('keydown', { code: 'Space' }), fn);
    onKeys(['Enter', 'Space'], new KeyboardEvent('keydown', { code: 'Shift' }), fn);
    expect(fn).toBeCalledTimes(2);
  });
});
