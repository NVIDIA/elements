import type * as monaco from '@nvidia-elements/monaco';
import type { Monaco } from '@nvidia-elements/monaco';

export type ThemeName = 'elements-dark' | 'elements-light';

export async function getTheme(name: ThemeName): Promise<monaco.editor.IStandaloneThemeData> {
  switch (name) {
    case 'elements-dark':
      return (await import('./generated/dark.json')).default as monaco.editor.IStandaloneThemeData;
    case 'elements-light':
      return (await import('./generated/light.json')).default as monaco.editor.IStandaloneThemeData;
    default:
      throw new Error(`Unknown theme: ${name}`);
  }
}

let definedThemes = false;

export async function defineThemes(monaco: Monaco) {
  if (definedThemes) {
    return;
  }

  const [darkTheme, lightTheme] = await Promise.all([getTheme('elements-dark'), getTheme('elements-light')]);

  monaco.editor.defineTheme('elements-dark', darkTheme);
  monaco.editor.defineTheme('elements-light', lightTheme);

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
