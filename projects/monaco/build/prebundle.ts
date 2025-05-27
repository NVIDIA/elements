import fs from 'fs';
import path from 'path';

import { generateDtsBundle } from 'dts-bundle-generator';

import { build } from 'esbuild';
import type { Plugin } from 'esbuild';

import postcss from 'postcss';
import type { AtRule, Result } from 'postcss';

const outdir = path.resolve(import.meta.dirname, '../src/vendor/monaco-editor/');
fs.mkdirSync(outdir, { recursive: true });

const node_modules_dir = path.resolve(import.meta.dirname, '../node_modules');

// ---

// @font-face() declarations within the Shadow DOM do not currently work in Chrome
// See: https://bugs.chromium.org/p/chromium/issues/detail?id=336876
// Workaround:
// - Remove the @font-face declarations (with inlined TTF) when importing monaco-editor CSS files
// - Dynamically inject a stylesheet with the same declaration in monaco.ts and append it to the root DOM
const targets = ['monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css'];
const postcssPlugin: Plugin = {
  name: 'postcss-plugin',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const code = await fs.promises.readFile(path, 'utf8');
      const result = await postcss([
        {
          postcssPlugin: 'remove-font-faces',
          AtRule: {
            'font-face': (atRule: AtRule, { result }: { result: Result }) => {
              if (targets.some(target => result.opts.from?.endsWith(target))) {
                atRule.remove();
              }
            }
          }
        }
      ]).process(code, { from: path });
      return {
        contents: result.css,
        loader: 'css'
      };
    });
  }
};

// ---

// Add /* @vite-ignore */ to dynamic import()s within vendored monaco-editor code
const viteIgnorePlugin: Plugin = {
  name: 'vite-ignore-import',
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, async ({ path }) => {
      if (
        path.endsWith('monaco-editor/esm/vs/base/common/worker/simpleWorker.js') ||
        path.endsWith('monaco-editor/esm/vs/editor/common/services/editorSimpleWorker.js')
      ) {
        const code = await fs.promises.readFile(path, 'utf8');
        return {
          contents: code.replace(/import\(`(\$\{[^`]+\})`\)/g, 'import(/* @vite-ignore */`$1`)'),
          loader: 'js'
        };
      }
      return;
    });
  }
};

// ---

// Prebundle the vendored monaco-editor code
await build({
  entryPoints: [
    'monaco-editor/esm/vs/editor/editor.main.js',
    'monaco-editor/esm/vs/editor/editor.worker.js',
    'monaco-editor/esm/vs/language/css/css.worker.js',
    'monaco-editor/esm/vs/language/html/html.worker.js',
    'monaco-editor/esm/vs/language/json/json.worker.js',
    'monaco-editor/esm/vs/language/typescript/ts.worker.js'
  ],
  plugins: [viteIgnorePlugin, postcssPlugin],
  outdir,
  format: 'esm',
  target: 'es2020',
  platform: 'browser',
  bundle: true,
  splitting: false,
  minify: false
});

// ---

// Prebundle the vendored monaco-editor types
const types = generateDtsBundle([
  {
    filePath: path.resolve(node_modules_dir, 'monaco-editor/esm/vs/editor/editor.api.d.ts'),
    libraries: {
      inlinedLibraries: ['monaco-editor']
    },
    output: {
      inlineDeclareExternals: true,
      sortNodes: false,
      noBanner: true
    }
  }
]);

fs.writeFileSync(path.resolve(outdir, 'editor/editor.api.d.ts'), types.join('\n'));

// ---

// Copy LICENSE to vendor directory
fs.copyFileSync(path.resolve(node_modules_dir, 'monaco-editor/LICENSE'), path.resolve(outdir, 'LICENSE'));
