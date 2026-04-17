// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Monaco } from '@nvidia-elements/monaco';

import { applyThemeForColorScheme, defineThemes } from '@nvidia-elements/monaco/themes';

let injectedGlobalStyles: CSSStyleSheet | undefined;

export async function injectMonacoGlobalStyles(): Promise<CSSStyleSheet> {
  if (!injectedGlobalStyles) {
    const globalCSS = await import('./editor.global.css?inline');
    injectedGlobalStyles = new CSSStyleSheet();
    injectedGlobalStyles.replaceSync(globalCSS.default);
    globalThis.document.adoptedStyleSheets = [injectedGlobalStyles, ...globalThis.document.adoptedStyleSheets];
  }
  return injectedGlobalStyles;
}

let lazyLoadedMonaco: Promise<Monaco> | undefined;

export async function loadMonaco(): Promise<Monaco> {
  // NOTE: Guards against many evaluations of await import() from different import paths. (Encountered in Vitest.)
  lazyLoadedMonaco ??= (async () => {
    await injectMonacoGlobalStyles();
    const monaco = (await import('@nvidia-elements/monaco')) as Monaco;

    await defineThemes(monaco);
    applyThemeForColorScheme(monaco, globalThis.document.documentElement);

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
