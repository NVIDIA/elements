import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as monaco from '@nvidia-elements/monaco';

import { applyThemeForColorScheme, defineThemes, getTheme, toggleThemeForColorScheme } from './index.js';
import type { ThemeName } from './index.js';

function expectValidHexColor(value: string) {
  expect(value).toMatch(/^#[0-9a-f]{6,8}$/);
}

function expectValidMonacoThemeColors(colors: Record<string, string>) {
  Object.entries(colors).forEach(([key, value]) => {
    expect(key).toMatch(/^[a-zA-Z.]+$/);
    expectValidHexColor(value);
  });
}

function expectValidMonacoThemeRule(rule: monaco.editor.ITokenThemeRule) {
  expect(rule).toHaveProperty('token');
  expect(typeof rule.token).toBe('string');

  if ('foreground' in rule) {
    expectValidHexColor(rule.foreground);
  }
  if ('background' in rule) {
    expectValidHexColor(rule.background);
  }
}

function expectValidMonacoTheme(theme: monaco.editor.IStandaloneThemeData, base: 'vs' | 'vs-dark') {
  expect(theme).toMatchObject({
    inherit: false,
    base
  });

  expect(theme.colors).toBeDefined();
  expectValidMonacoThemeColors(theme.colors);

  expect(Array.isArray(theme.rules)).toBe(true);
  theme.rules.forEach(expectValidMonacoThemeRule);
}

describe('themes', () => {
  let editorMock: {
    defineTheme: ReturnType<typeof vi.fn>;
    setTheme: ReturnType<typeof vi.fn>;
    getTheme: ReturnType<typeof vi.fn>;
  };
  let monacoMock: typeof monaco;
  let rootEl: HTMLElement;
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    editorMock = {
      defineTheme: vi.fn(),
      setTheme: vi.fn(),
      getTheme: vi.fn()
    };

    monacoMock = {
      editor: editorMock
    } as unknown as typeof monaco;

    rootEl = document.createElement('div');
    getComputedStyleSpy = vi
      .spyOn(globalThis, 'getComputedStyle')
      .mockReturnValue({ colorScheme: 'dark' } as CSSStyleDeclaration);
  });

  afterEach(() => {
    vi.clearAllMocks();
    getComputedStyleSpy.mockRestore();
  });

  describe('getTheme', () => {
    it('should return the correct theme', async () => {
      const darkTheme = await getTheme('elements-dark');
      expect(darkTheme).toBeDefined();
      expectValidMonacoTheme(darkTheme, 'vs-dark');

      const lightTheme = await getTheme('elements-light');
      expect(lightTheme).toBeDefined();
      expectValidMonacoTheme(lightTheme, 'vs');
    });

    it('should throw if the theme name is unknown', async () => {
      await expect(() => getTheme('invalid' as ThemeName)).rejects.toThrow('Unknown theme: invalid');
    });
  });

  describe('defineThemes', () => {
    it('should define themes only once', async () => {
      await defineThemes(monacoMock);

      expect(editorMock.defineTheme).toHaveBeenCalledTimes(2);

      const [, darkTheme] =
        vi.mocked(editorMock.defineTheme).mock.calls.find(([themeName]) => themeName === 'elements-dark') ?? [];
      expect(darkTheme).toBeDefined();
      expectValidMonacoTheme(darkTheme, 'vs-dark');

      const [, lightTheme] =
        vi.mocked(editorMock.defineTheme).mock.calls.find(([themeName]) => themeName === 'elements-light') ?? [];
      expect(lightTheme).toBeDefined();
      expectValidMonacoTheme(lightTheme, 'vs');

      vi.clearAllMocks();

      await defineThemes(monacoMock);

      expect(editorMock.defineTheme).not.toHaveBeenCalled();
    });
  });

  describe('applyThemeForColorScheme', () => {
    it('should apply dark theme when color scheme is dark', () => {
      getComputedStyleSpy.mockReturnValue({ colorScheme: 'dark' } as CSSStyleDeclaration);

      applyThemeForColorScheme(monacoMock, rootEl);
      expect(editorMock.setTheme).toHaveBeenCalledWith('elements-dark');
    });

    it('should apply light theme when color scheme is light', () => {
      getComputedStyleSpy.mockReturnValue({ colorScheme: 'light' } as CSSStyleDeclaration);

      applyThemeForColorScheme(monacoMock, rootEl);

      expect(editorMock.setTheme).toHaveBeenCalledWith('elements-light');
    });
  });

  describe('toggleThemeForColorScheme', () => {
    it('should toggle theme when current theme is elements-dark', () => {
      editorMock.getTheme.mockReturnValue('elements-dark');
      getComputedStyleSpy.mockReturnValue({ colorScheme: 'light' } as CSSStyleDeclaration);

      toggleThemeForColorScheme(monacoMock, rootEl);

      expect(editorMock.setTheme).toHaveBeenCalledWith('elements-light');
    });

    it('should toggle theme when current theme is elements-light', () => {
      editorMock.getTheme.mockReturnValue('elements-light');
      getComputedStyleSpy.mockReturnValue({ colorScheme: 'dark' } as CSSStyleDeclaration);

      toggleThemeForColorScheme(monacoMock, rootEl);

      expect(editorMock.setTheme).toHaveBeenCalledWith('elements-dark');
    });

    it('should not toggle theme when current theme is not elements-dark or elements-light', () => {
      editorMock.getTheme.mockReturnValue('some-other-theme');
      getComputedStyleSpy.mockReturnValue({ colorScheme: 'dark' } as CSSStyleDeclaration);

      toggleThemeForColorScheme(monacoMock, rootEl);

      expect(editorMock.setTheme).not.toHaveBeenCalled();
    });
  });
});
