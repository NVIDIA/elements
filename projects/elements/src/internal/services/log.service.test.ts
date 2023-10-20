import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { LogService } from './log.service.js';

describe('LogService', () => {
  beforeEach(() => {
    window.MLV_ELEMENTS.state.env = 'development';
  });

  afterEach(() => {
    window.MLV_ELEMENTS.state.env = 'production';
  });

  it('should log out values if in development', async () => {
    const original = console.log;
    const originalError = console.error;
    console.log = () => null;
    console.error = () => null;

    vi.spyOn(console, 'log');
    vi.spyOn(console, 'error');

    LogService.log('test');
    LogService.error('test');
    expect(console.log).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();

    console.log = original;
    console.error = originalError;
  });

  it('should not log out values if in production', async () => {
    const original = console.log;
    const originalError = console.error;
    console.log = () => null;
    console.error = () => null;

    vi.spyOn(console, 'log');
    vi.spyOn(console, 'error');

    window.MLV_ELEMENTS.state.env = 'production';
    LogService.log('test');
    LogService.error('test');
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();

    console.log = original;
    console.error = originalError;
  });
});
