// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { marked } from 'marked';
import ora, { type Ora } from 'ora';
import {
  banner,
  colors,
  getSpinnerProgressMessage,
  runAsyncTool,
  getArgValue,
  getEditor,
  getSelect,
  getInput,
  getBoolean,
  isReport,
  reportHasFailures,
  renderReport,
  isObjectLiteral,
  renderResult,
  statusIcons,
  wrapUrl
} from './utils.js';

vi.mock('ora');
vi.mock('marked');
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  input: vi.fn(),
  confirm: vi.fn(),
  editor: vi.fn()
}));

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constants', () => {
    it('should export banner constant', () => {
      expect(banner).toBeDefined();
      expect(typeof banner).toBe('string');
      expect(banner.length).toBeGreaterThan(0);
      expect(banner).toContain('░██');
    });

    it('should export colors object with correct methods', () => {
      expect(colors).toBeDefined();
      expect(typeof colors.info).toBe('function');
      expect(typeof colors.error).toBe('function');
      expect(typeof colors.warning).toBe('function');
      expect(typeof colors.complete).toBe('function');
    });

    it('should apply ANSI color codes correctly', () => {
      expect(colors.info('test')).toBe('\x1b[34mtest\x1b[0m');
      expect(colors.error('test')).toBe('\x1b[31mtest\x1b[0m');
      expect(colors.warning('test')).toBe('\x1b[33mtest\x1b[0m');
      expect(colors.complete('test')).toBe('\x1b[32mtest\x1b[0m');
    });

    it('should export statusIcons object', () => {
      expect(statusIcons).toBeDefined();
      expect(statusIcons.success).toBe('✅');
      expect(statusIcons.danger).toBe('❌');
      expect(statusIcons.warning).toBe('⚠️');
      expect(statusIcons.info).toBe('💡');
      expect(statusIcons.log).toBe('🔍');
      expect(statusIcons.undefined).toBe('');
    });
  });

  describe('getSpinnerProgressMessage', () => {
    it('should return a random message from predefined list', () => {
      const message = getSpinnerProgressMessage();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });

    it('should return different messages on multiple calls', () => {
      const messages = new Set();
      // Call multiple times to increase chance of getting different messages
      for (let i = 0; i < 10; i++) {
        messages.add(getSpinnerProgressMessage());
      }
      // Should have at least 2 different messages in 10 calls
      expect(messages.size).toBeGreaterThan(1);
    });
  });

  describe('runAsyncTool', () => {
    const mockFn = vi.fn();
    const mockSpinner: Partial<Ora> = {
      start: vi.fn(),
      stop: vi.fn()
    };

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(ora).mockReturnValue(mockSpinner as any);
      mockFn.mockResolvedValue('test result');
    });

    it('should run function without spinner in CI environment', async () => {
      process.env.CI = 'true';
      const args = {};
      const result = await runAsyncTool(args, mockFn);

      expect(result).toBe('test result');
      expect(mockFn).toHaveBeenCalledWith(args);
      expect(ora).not.toHaveBeenCalled();
      delete process.env.CI;
    });

    it('should run function without spinner when start flag is true', async () => {
      const args = { start: true };
      const result = await runAsyncTool(args, mockFn);

      expect(result).toBe('test result');
      expect(mockFn).toHaveBeenCalledWith(args);
      expect(ora).not.toHaveBeenCalled();
    });

    it('should run function without spinner when log flag is true', async () => {
      const args = { log: true };
      const result = await runAsyncTool(args, mockFn);

      expect(result).toBe('test result');
      expect(mockFn).toHaveBeenCalledWith(args);
      expect(ora).not.toHaveBeenCalled();
    });

    it('should run function with spinner in interactive mode', async () => {
      const args = {};
      const result = await runAsyncTool(args, mockFn);

      expect(result).toBe('test result');
      expect(mockFn).toHaveBeenCalledWith(args);
      expect(ora).toHaveBeenCalledWith({
        spinner: 'star',
        color: 'green',
        text: expect.any(String)
      });
      expect(mockSpinner.start).toHaveBeenCalled();
      expect(mockSpinner.stop).toHaveBeenCalled();
    });

    it('should handle function errors', async () => {
      const args = {};
      const error = new Error('Test error');
      mockFn.mockRejectedValue(error);

      await expect(runAsyncTool(args, mockFn)).rejects.toThrow('Test error');
      expect(mockFn).toHaveBeenCalledWith(args);
    });
  });

  describe('getArgValue', async () => {
    const { select, input, confirm, editor } = await import('@inquirer/prompts');

    it('should call getSelect for string enum properties', async () => {
      vi.mocked(select).mockResolvedValue('option1');
      const schema = { type: 'string', enum: ['option1', 'option2'] };
      const result = await getArgValue('testArg', schema);

      expect(result).toBe('option1');
      expect(select).toHaveBeenCalledWith({
        message: 'Select a testArg:',
        choices: [
          { name: 'option1', value: 'option1' },
          { name: 'option2', value: 'option2' }
        ]
      });
    });

    it('should call getBoolean for boolean properties', async () => {
      vi.mocked(confirm).mockResolvedValue(true);
      const schema = { type: 'boolean', description: 'Test boolean' };
      const result = await getArgValue('testArg', schema);

      expect(result).toBe(true);
      expect(confirm).toHaveBeenCalledWith({
        message: '(testArg) Test boolean:'
      });
    });

    it('should call getEditor for string properties with defaultTemplate', async () => {
      vi.mocked(editor).mockResolvedValue('edited content');
      const schema = {
        type: 'string',
        defaultTemplate: 'default content',
        filename: '.md'
      };

      const result = await getArgValue('testArg', schema);

      expect(result).toBe('edited content');
      expect(editor).toHaveBeenCalledWith({
        message: 'Enter testArg.',
        postfix: '.md',
        default: 'default content'
      });
    });

    it('should call getInput for other string properties', async () => {
      vi.mocked(input).mockResolvedValue('input value');
      const schema = { type: 'string' };
      const result = await getArgValue('testArg', schema);

      expect(result).toBe('input value');
      expect(input).toHaveBeenCalledWith({ message: 'Enter testArg:' });
    });

    it('should split comma-separated input into array for array properties', async () => {
      vi.mocked(input).mockResolvedValue('nve-button, nve-badge');
      const schema = { type: 'array', items: { type: 'string' } };
      const result = await getArgValue('names', schema);

      expect(result).toEqual(['nve-button', 'nve-badge']);
      expect(input).toHaveBeenCalledWith({ message: 'Enter names:' });
    });

    it('should handle single value input for array properties', async () => {
      vi.mocked(input).mockResolvedValue('nve-button');
      const schema = { type: 'array', items: { type: 'string' } };
      const result = await getArgValue('names', schema);

      expect(result).toEqual(['nve-button']);
    });

    it('should filter empty entries from array input', async () => {
      vi.mocked(input).mockResolvedValue('nve-button,,nve-badge,');
      const schema = { type: 'array', items: { type: 'string' } };
      const result = await getArgValue('names', schema);

      expect(result).toEqual(['nve-button', 'nve-badge']);
    });
  });

  describe('input functions', async () => {
    const { select, input, confirm, editor } = await import('@inquirer/prompts');

    describe('getEditor', () => {
      it('should call editor with correct parameters', async () => {
        vi.mocked(editor).mockResolvedValue('edited content');
        const result = await getEditor('testValue', {
          filename: '.js',
          defaultTemplate: 'default content'
        });

        expect(result).toBe('edited content');
        expect(editor).toHaveBeenCalledWith({
          message: 'Enter testValue.',
          postfix: '.js',
          default: 'default content'
        });
      });

      it('should handle missing properties', async () => {
        vi.mocked(editor).mockResolvedValue('content');
        const result = await getEditor('testValue', {});

        expect(result).toBe('content');
        expect(editor).toHaveBeenCalledWith({
          message: 'Enter testValue.',
          postfix: '.html',
          default: undefined
        });
      });
    });

    describe('getSelect', () => {
      it('should call select with enum choices', async () => {
        vi.mocked(select).mockResolvedValue('choice2');
        const result = await getSelect('testValue', { enum: ['choice1', 'choice2', 'choice3'] });

        expect(result).toBe('choice2');
        expect(select).toHaveBeenCalledWith({
          message: 'Select a testValue:',
          choices: [
            { name: 'choice1', value: 'choice1' },
            { name: 'choice2', value: 'choice2' },
            { name: 'choice3', value: 'choice3' }
          ]
        });
      });

      it('should handle missing enum property', async () => {
        vi.mocked(select).mockResolvedValue('default');
        const result = await getSelect('testValue', {});

        expect(result).toBe('default');
        expect(select).toHaveBeenCalledWith({
          message: 'Select a testValue:',
          choices: []
        });
      });
    });

    describe('getInput', () => {
      it('should call input with correct message', async () => {
        vi.mocked(input).mockResolvedValue('user input');
        const result = await getInput('testValue');

        expect(result).toBe('user input');
        expect(input).toHaveBeenCalledWith({
          message: 'Enter testValue:'
        });
      });
    });

    describe('getBoolean', () => {
      it('should call confirm with description', async () => {
        vi.mocked(confirm).mockResolvedValue(false);
        const result = await getBoolean('testValue', { description: 'Enable feature' });

        expect(result).toBe(false);
        expect(confirm).toHaveBeenCalledWith({
          message: '(testValue) Enable feature:'
        });
      });

      it('should handle missing description', async () => {
        vi.mocked(confirm).mockResolvedValue(true);
        const result = await getBoolean('testValue', {});

        expect(result).toBe(true);
        expect(confirm).toHaveBeenCalledWith({
          message: '(testValue) :'
        });
      });
    });
  });

  describe('wrapUrl', () => {
    it('should return short URLs unchanged', () => {
      const url = 'https://example.com/short';
      expect(wrapUrl(url)).toBe(url);
    });

    it('should wrap long URLs at path boundaries', () => {
      const url =
        'https://example.com/very/long/url/that/should/be/wrapped/at/eighty/characters/for/better/readability';
      expect(wrapUrl(url)).toBe(
        'https://example.com/very/long/url/that/should/be/wrapped/at/eighty/characters\n/for/better/readability'
      );
    });

    it('should respect custom maxWidth', () => {
      const url = 'https://example.com/path/to/resource';
      expect(wrapUrl(url, 30)).toBe('https://example.com/path/to\n/resource');
    });

    it('should handle URLs at exactly maxWidth', () => {
      const url = 'https://example.com'; // 19 chars
      expect(wrapUrl(url, 19)).toBe(url);
    });
  });

  describe('isReport', () => {
    it('should return true for valid report objects', () => {
      const validReport = {
        test1: { status: 'success', message: 'Test passed' },
        test2: { status: 'danger', message: 'Test failed' }
      };
      expect(isReport(validReport)).toBe(true);
    });

    it('should return true for empty report object', () => {
      expect(isReport({})).toBe(true);
    });

    it('should return false for invalid report objects', () => {
      expect(isReport({ test: { status: 'success' } })).toBe(false); // missing message
      expect(isReport({ test: { message: 'test' } })).toBe(false); // missing status
      expect(isReport({ test: 'invalid' })).toBe(false); // not an object
      expect(isReport('not an object')).toBe(false);
      expect(isReport(null)).toBe(false);
      expect(isReport([])).toBe(false);
    });
  });

  describe('isObjectLiteral', () => {
    it('should return true for plain object literals', () => {
      expect(isObjectLiteral({})).toBe(true);
      expect(isObjectLiteral({ key: 'value' })).toBe(true);
      expect(isObjectLiteral(Object.create(null))).toBe(true);
    });

    it('should return false for non-plain objects', () => {
      expect(isObjectLiteral(null)).toBe(false);
      expect(isObjectLiteral(undefined)).toBe(false);
      expect(isObjectLiteral([])).toBe(false);
      expect(isObjectLiteral('string')).toBe(false);
      expect(isObjectLiteral(123)).toBe(false);
      expect(isObjectLiteral(new Date())).toBe(false);
      expect(isObjectLiteral(new RegExp(''))).toBe(false);
    });
  });

  describe('reportHasFailures', () => {
    it('should return true when report has danger status', () => {
      const report = {
        test1: { status: 'success' as const, message: 'Passed' },
        test2: { status: 'danger' as const, message: 'Failed' }
      };
      expect(reportHasFailures(report)).toBe(true);
    });

    it('should return false when report has no danger status', () => {
      const report = {
        test1: { status: 'success' as const, message: 'Passed' },
        test2: { status: 'warning' as const, message: 'Warning' },
        test3: { status: 'info' as const, message: 'Info' }
      };
      expect(reportHasFailures(report)).toBe(false);
    });

    it('should return false for empty report', () => {
      expect(reportHasFailures({})).toBe(false);
    });
  });

  describe('renderReport', () => {
    beforeEach(() => {
      vi.mocked(marked.parse).mockImplementation(input => Promise.resolve(input));
    });

    it('should log formatted report and not exit on success', async () => {
      const report = {
        testCase: { status: 'success' as const, message: 'Test passed' },
        anotherTest: { status: 'info' as const, message: 'Information' }
      };

      await renderReport(report);

      expect(console.log).toHaveBeenCalledWith('✅ (**test case**): Test passed\n💡 (**another test**): Information');
      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should log formatted report and exit on failure', async () => {
      const report = {
        failedTest: { status: 'danger' as const, message: 'Test failed' }
      };

      await expect(() => renderReport(report)).rejects.toThrow('process.exit called');
      expect(console.log).toHaveBeenCalledWith('❌ (**failed test**): Test failed');
    });

    it('should format camelCase keys to readable labels', async () => {
      const report = {
        camelCaseTestName: { status: 'success' as const, message: 'Formatted correctly' }
      };

      await renderReport(report);

      expect(console.log).toHaveBeenCalledWith('✅ (**camel case test name**): Formatted correctly');
    });
  });

  describe('renderResult', () => {
    beforeEach(() => {
      vi.mocked(marked.parse).mockResolvedValue('parsed markdown');
    });

    it('should render report objects using renderReport', async () => {
      const report = {
        test: { status: 'success', message: 'Test passed' }
      };

      await renderResult(report);
      expect(console.log).toHaveBeenCalledWith('parsed markdown');
    });

    it('should render arrays as JSON', async () => {
      const array = ['item1', 'item2', 'item3'];
      await renderResult(array);
      expect(console.log).toHaveBeenCalledWith(JSON.stringify(array, null, 2));
    });

    it('should render object literals as JSON', async () => {
      const obj = { key1: 'value1', key2: 'value2' };
      await renderResult(obj);
      expect(console.log).toHaveBeenCalledWith(JSON.stringify(obj, null, 2));
    });

    it('should render HTTP URLs with line wrapping at path boundaries', async () => {
      const url =
        'https://example.com/very/long/url/that/should/be/wrapped/at/eighty/characters/for/better/readability';
      await renderResult(url);
      expect(console.log).toHaveBeenCalledWith(
        colors.complete(
          'https://example.com/very/long/url/that/should/be/wrapped/at/eighty/characters\n/for/better/readability'
        )
      );
    });

    it('should render multiline strings as markdown', async () => {
      const markdown = '# Title\n\nThis is **bold** text.';
      await renderResult(markdown);
      expect(marked.parse).toHaveBeenCalledWith(markdown);
      expect(console.log).toHaveBeenCalledWith('parsed markdown');
    });

    it('should render other values directly', async () => {
      await renderResult(42);
      expect(console.log).toHaveBeenCalledWith(42);
    });

    it('should handle single-line non-URL strings as markdown', async () => {
      const text = 'Simple text without newlines';
      await renderResult(text);
      expect(marked.parse).toHaveBeenCalledWith(text);
      expect(console.log).toHaveBeenCalledWith('parsed markdown');
    });
  });
});
