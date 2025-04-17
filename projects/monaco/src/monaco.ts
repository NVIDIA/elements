export async function loadMonaco() {
  // using ?worker&inline inlines the worker so consumer does not need to define relative paths to the worker files https://github.com/microsoft/monaco-editor/issues/4739
  self.MonacoEnvironment = {
    async getWorker(_, label: string) {
      switch (label) {
        case 'json':
          return new (await import('monaco-editor/esm/vs/language/json/json.worker.js?worker&inline')).default();
        case 'css':
          return new (await import('monaco-editor/esm/vs/language/css/css.worker.js?worker&inline')).default();
        case 'html':
          return new (await import('monaco-editor/esm/vs/language/html/html.worker.js?worker&inline')).default();
        case 'javascript':
        case 'typescript':
          return new (await import('monaco-editor/esm/vs/language/typescript/ts.worker.js?worker&inline')).default();
        default:
          return new (await import('monaco-editor/esm/vs/editor/editor.worker.js?worker&inline')).default();
      }
    }
  };

  // import codicon font into global root https://bugs.chromium.org/p/chromium/issues/detail?id=336876
  const global = await import('./editor/editor.global.css?inline');
  const globalStyles = new CSSStyleSheet();
  globalStyles.replaceSync(global.default);
  globalThis.document.adoptedStyleSheets = [globalStyles, ...globalThis.document.adoptedStyleSheets];

  // load editor styles
  const inline = await import('monaco-editor/min/vs/editor/editor.main.css?inline');
  const styles = new CSSStyleSheet();
  styles.replaceSync(inline.default);

  // load editor
  const monaco = await import('monaco-editor/esm/vs/editor/editor.main.js');

  return { monaco, styles };
}
