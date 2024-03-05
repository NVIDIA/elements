import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { LogService } from './log.service.js';

describe('LogService', () => {
  beforeEach(() => {
    window.NVE_ELEMENTS.state.env = 'development';
  });

  afterEach(() => {
    window.NVE_ELEMENTS.state.env = 'production';
  });

  it('should log out values if in development', async () => {
    const original = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    console.log = () => null;
    console.warn = () => null;
    console.error = () => null;

    vi.spyOn(console, 'log');
    vi.spyOn(console, 'warn');
    vi.spyOn(console, 'error');

    LogService.log('test');
    LogService.warn('test');
    LogService.error('test');
    expect(console.log).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();

    console.log = original;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('should not log out values if in production', async () => {
    const original = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    console.log = () => null;
    console.warn = () => null;
    console.error = () => null;

    vi.spyOn(console, 'log');
    vi.spyOn(console, 'warn');
    vi.spyOn(console, 'error');

    window.NVE_ELEMENTS.state.env = 'production';
    LogService.log('test');
    LogService.warn('test');
    LogService.error('test');
    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();

    console.log = original;
    console.warn = originalWarn;
    console.error = originalError;
  });
});
