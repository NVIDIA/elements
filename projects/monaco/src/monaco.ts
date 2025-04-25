import type { Monaco } from './types.js';

import { applyThemeForColorScheme, defineThemes } from './themes/index.js';

export function createMonacoEnvironment() {
  return {
    async getWorker(_, label: string) {
      switch (label) {
        case 'json':
          return new (await import('./workers/json.worker.js?worker&inline')).default();
        case 'css':
          return new (await import('./workers/css.worker.js?worker&inline')).default();
        case 'html':
          return new (await import('./workers/html.worker.js?worker&inline')).default();
        case 'javascript':
        case 'typescript':
          return new (await import('./workers/ts.worker.js?worker&inline')).default();
        default:
          return new (await import('./workers/editor.worker.js?worker&inline')).default();
      }
    }
  };
}

async function injectMonacoGlobalStyles() {
  const global = await import('./monaco.global.css?inline');
  const globalStyles = new CSSStyleSheet();
  globalStyles.replaceSync(global.default);
  globalThis.document.adoptedStyleSheets = [globalStyles, ...globalThis.document.adoptedStyleSheets];
}

let lazyLoadedMonaco: Promise<Monaco> | undefined;

export async function loadMonaco(): Promise<Monaco> {
  // NOTE: Guards against multiple evaluations of await import() from different import paths. (Encountered in Vitest.)
  lazyLoadedMonaco ??= (async () => {
    self.MonacoEnvironment ??= createMonacoEnvironment();
    await injectMonacoGlobalStyles();
    const monaco = (await import('./editor.main.js')) as Monaco;
    await defineThemes(monaco);
    applyThemeForColorScheme(monaco, self.document.documentElement);
    return monaco;
  })();
  return lazyLoadedMonaco;
}

export async function loadEditorStyles(): Promise<CSSStyleSheet> {
  const inline = await import('./editor.main.css?inline');
  const styles = new CSSStyleSheet();
  styles.replaceSync(inline.default);
  return styles;
}
