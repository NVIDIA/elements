export function createMonacoEnvironment() {
  return {
    async getWorker(_: string, label: string) {
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
