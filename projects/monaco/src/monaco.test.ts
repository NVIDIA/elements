// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { injectMonacoGlobalStyles, loadMonaco, loadEditorStyles } from './monaco.js';
import { createMonacoEnvironment } from './environment.js';

describe('Monaco Module', () => {
  describe('loadMonaco', () => {
    it('should dynamically import and return the Monaco instance', async () => {
      const monaco = await loadMonaco();
      expect(monaco).toBeDefined();
      expect(monaco.editor).toBeDefined();
    });

    it('should create a default MonacoEnvironment if not already specified', async () => {
      await loadMonaco();
      expect(globalThis.MonacoEnvironment).toBeDefined();
      expect(globalThis.MonacoEnvironment?.getWorker).toBeDefined();

      const worker = globalThis.MonacoEnvironment?.getWorker;
      const jsonWorker = await worker?.('', 'json');
      expect(jsonWorker).toBeDefined();

      const cssWorker = await worker?.('', 'css');
      expect(cssWorker).toBeDefined();

      const htmlWorker = await worker?.('', 'html');
      expect(htmlWorker).toBeDefined();

      const tsWorker = await worker?.('', 'typescript');
      expect(tsWorker).toBeDefined();

      const defaultWorker = await worker?.('', 'other');
      expect(defaultWorker).toBeDefined();
    });

    it('should not replace MonacoEnvironment if already specified', async () => {
      const defaultEnv = createMonacoEnvironment();
      function getWorker(_, label: string) {
        return defaultEnv.getWorker(_, label);
      }
      const existingEnv = { getWorker };
      globalThis.MonacoEnvironment = existingEnv;

      await loadMonaco();
      expect(globalThis.MonacoEnvironment).toBe(existingEnv);
      expect(globalThis.MonacoEnvironment.getWorker).toBe(existingEnv.getWorker);
    });

    it('should define and apply the elements monaco theme for the current color scheme', async () => {
      const monaco = await loadMonaco();

      expect(monaco.editor.getTheme()).toBeDefined();

      const currentTheme = monaco.editor.getTheme();
      const colorScheme = getComputedStyle(document.documentElement).colorScheme;
      expect(currentTheme).toBe(colorScheme === 'dark' ? 'elements-dark' : 'elements-light');
    });

    it('should load the monaco codicon font', async () => {
      await loadMonaco();
      await document.fonts.load('16px codicon');

      expect(document.fonts.check('16px codicon')).toBe(true);
    });
  });

  describe('injectMonacoGlobalStyles', () => {
    it('should inject the monaco global styles', async () => {
      const injectedStyles = await injectMonacoGlobalStyles();

      expect(injectedStyles).toBeDefined();
      expect(globalThis.document.adoptedStyleSheets.includes(injectedStyles)).toBe(true);
    });

    it('should not inject the monaco global styles if they have already been injected', async () => {
      const injectedStyles = await injectMonacoGlobalStyles();
      const injectedStyles2 = await injectMonacoGlobalStyles();

      expect(injectedStyles2).toBe(injectedStyles);
      expect(globalThis.document.adoptedStyleSheets.filter(style => style === injectedStyles).length).toBe(1);
    });
  });

  describe('loadEditorStyles', () => {
    it('should return a CSSStyleSheet', async () => {
      const styles = await loadEditorStyles();
      expect(styles).toBeInstanceOf(CSSStyleSheet);
    });

    it('should load Monaco editor styles', async () => {
      const styles = await loadEditorStyles();
      expect(styles.cssRules.length).toBeGreaterThan(0);
    });
  });
});
