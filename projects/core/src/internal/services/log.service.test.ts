import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { LogService } from './log.service.js';

describe('LogService', () => {
  beforeEach(() => {
    window.NVE_ELEMENTS.state.env = 'development';
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    window.NVE_ELEMENTS.state.env = 'production';
    vi.restoreAllMocks();
  });

  it('should log out values if in development', () => {
    LogService.log('test');
    LogService.warn('test');
    LogService.error('test');
    expect(console.log).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('should not log out values if in production', () => {
    window.NVE_ELEMENTS.state.env = 'production';
    LogService.log('test');
    LogService.warn('test');
    LogService.error('test');
    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should prefix all messages with @nve: ', () => {
    LogService.log('test message');
    LogService.warn('test message');
    LogService.error('test message');
    expect(console.log).toHaveBeenCalledWith('@nve: test message');
    expect(console.warn).toHaveBeenCalledWith('@nve: test message');
    expect(console.error).toHaveBeenCalledWith('@nve: test message');
  });

  it('should dispatch NVE_ELEMENTS_LOG event with type warn when calling warn()', () => {
    const listener = vi.fn();
    globalThis.document.addEventListener('NVE_ELEMENTS_LOG', listener);

    LogService.warn('test warn', 'extra');

    expect(listener).toHaveBeenCalledOnce();
    const detail = listener.mock.calls[0][0].detail;
    expect(detail).toStrictEqual({ type: 'warn', value: 'test warn', args: ['extra'] });

    globalThis.document.removeEventListener('NVE_ELEMENTS_LOG', listener);
  });

  it('should dispatch NVE_ELEMENTS_LOG event with type error when calling error()', () => {
    const listener = vi.fn();
    globalThis.document.addEventListener('NVE_ELEMENTS_LOG', listener);

    LogService.error('test error', 'extra');

    expect(listener).toHaveBeenCalledOnce();
    const detail = listener.mock.calls[0][0].detail;
    expect(detail).toStrictEqual({ type: 'error', value: 'test error', args: ['extra'] });

    globalThis.document.removeEventListener('NVE_ELEMENTS_LOG', listener);
  });
});
