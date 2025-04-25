import { describe, it, expect } from 'vitest';
import { loadMonaco, loadEditorStyles, createMonacoEnvironment } from './monaco.js';

describe('Monaco Module', () => {
  describe('loadMonaco', () => {
    it('should dynamically import and return the Monaco instance', async () => {
      const monaco = await loadMonaco();
      expect(monaco).toBeDefined();
      expect(monaco.editor).toBeDefined();
    });

    it('should create a default MonacoEnvironment if not already specified', async () => {
      await loadMonaco();
      expect(self.MonacoEnvironment).toBeDefined();
      expect(self.MonacoEnvironment?.getWorker).toBeDefined();

      const worker = self.MonacoEnvironment?.getWorker;
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
      self.MonacoEnvironment = existingEnv;

      await loadMonaco();
      expect(self.MonacoEnvironment).toBe(existingEnv);
      expect(self.MonacoEnvironment.getWorker).toBe(existingEnv.getWorker);
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
