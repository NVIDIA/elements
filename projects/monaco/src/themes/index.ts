import type { monaco, Monaco } from '../types.js';

let definedThemes = false;

export async function defineThemes(monaco: Monaco) {
  if (definedThemes) {
    return;
  }

  const [darkTheme, lightTheme] = await Promise.all([
    import('./generated/dark.json'),
    import('./generated/light.json')
  ]);

  monaco.editor.defineTheme('elements-dark', darkTheme.default as monaco.editor.IStandaloneThemeData);
  monaco.editor.defineTheme('elements-light', lightTheme.default as monaco.editor.IStandaloneThemeData);

  definedThemes = true;
}

export function applyThemeForColorScheme(monaco: Monaco, rootEl: HTMLElement) {
  const colorScheme = globalThis.getComputedStyle(rootEl).colorScheme;
  monaco.editor.setTheme(colorScheme === 'dark' ? 'elements-dark' : 'elements-light');
}

export function toggleThemeForColorScheme(monaco: Monaco, rootEl: HTMLElement) {
  // NOTE: intentionally do nothing if a different theme has been applied
  if (['elements-dark', 'elements-light'].includes(monaco.editor.getTheme())) {
    applyThemeForColorScheme(monaco, rootEl);
  }
}
