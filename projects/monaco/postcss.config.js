// @font-face() declarations within the Shadow DOM do not currently work in Chrome
// See: https://bugs.chromium.org/p/chromium/issues/detail?id=336876

// Workaround:
// - Remove the @font-face declarations (with inlined TTF) when importing monaco-editor CSS files
// - Dynamically create a <style> tag with a similar declaration in monaco.ts and append it to the root DOM

const targets = ['src/editor.main.css?inline', 'monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css'];

const removeFontFaces = {
  postcssPlugin: 'remove-font-faces',
  AtRule: {
    'font-face': (atRule, { result }) => {
      if (targets.some(target => result.opts.from.endsWith(target))) {
        atRule.remove();
      }
    }
  }
};

export default {
  plugins: [removeFontFaces]
};
