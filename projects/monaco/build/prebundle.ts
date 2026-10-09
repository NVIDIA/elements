import fs from 'fs';
import path from 'path';

import { generateDtsBundle } from 'dts-bundle-generator';

import { build } from 'esbuild';
import type { Plugin } from 'esbuild';

import postcss from 'postcss';
import type { AtRule } from 'postcss';

const outdir = path.resolve(import.meta.dirname, '../src/vendor/monaco-editor/');
fs.mkdirSync(outdir, { recursive: true });

const node_modules_dir = path.resolve(import.meta.dirname, '../node_modules');

// ---

const postcssPlugin: Plugin = {
  name: 'postcss-plugin',
  setup(build) {
    const globalCssRules = new Set<string>();

    build.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const code = await fs.promises.readFile(path, 'utf8');
      const result = await postcss([
        {
          postcssPlugin: 'extract-global-rules',
          Rule(rule) {
            // Extract .monaco-aria-container rules
            // These must be applied to the root DOM (not the Shadow DOM)
            if (rule.selector?.includes('.monaco-aria-container')) {
              globalCssRules.add(rule.toString());
              rule.remove();
            }
          },
          AtRule: {
            'font-face': (atRule: AtRule) => {
              // Remove all @font-face rules - manually mirrored to monaco.global.css
              // @font-face() declarations within the Shadow DOM do not currently work in Chrome
              // See: https://bugs.chromium.org/p/chromium/issues/detail?id=336876
              atRule.remove();
            }
          }
        }
      ]).process(code, { from: path });

      return {
        contents: result.css,
        loader: 'css'
      };
    });

    build.onEnd(() => {
      fs.writeFileSync(path.resolve(outdir, 'editor.global.css'), Array.from(globalCssRules).join('\n\n'));
    });
  }
};

// ---

const workerUrlRewritePlugin: Plugin = {
  name: 'worker-url-rewrite',
  setup(build) {
    const languages = ['css', 'html', 'json', 'typescript'];

    build.onLoad({ filter: /workerManager\.js$/ }, async ({ path }) => {
      const normalizedPath = path.replace(/\\/g, '/');

      for (const language of languages) {
        if (normalizedPath.endsWith(`monaco-editor/esm/vs/languages/features/${language}/workerManager.js`)) {
          const workerFile = language === 'typescript' ? 'ts.worker.js' : `${language}.worker.js`;
          const code = await fs.promises.readFile(path, 'utf8');
          const rewritten = code.replace(
            new RegExp(`new Worker\\(new URL\\(['"\`]${workerFile}['"\`],\\s*import\\.meta\\.url\\)`, 'g'),
            `new Worker(/* @vite-ignore */new URL(/* @vite-ignore */'${`../../../workers/${workerFile}`}', import.meta.url)`
          );
          if (rewritten === code) {
            throw new Error(`Unable to rewrite the ${language} worker URL in ${path}`);
          }
          return {
            contents: rewritten,
            loader: 'js'
          };
        }
      }
      return;
    });
  }
};

// ---

// Prebundle the vendored monaco-editor code
await build({
  entryPoints: {
    'editor/editor.main': 'monaco-editor',
    'editor/editor.worker': 'monaco-editor/editor/editor.worker',
    'language/css/css.worker': 'monaco-editor/languages/features/css/css.worker',
    'language/html/html.worker': 'monaco-editor/languages/features/html/html.worker',
    'language/json/json.worker': 'monaco-editor/languages/features/json/json.worker',
    'language/typescript/ts.worker': 'monaco-editor/languages/features/typescript/ts.worker'
  },
  plugins: [workerUrlRewritePlugin, postcssPlugin],
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
    filePath: path.resolve(node_modules_dir, 'monaco-editor/esm/vs/index.d.ts'),
    libraries: {
      inlinedLibraries: ['monaco-editor']
    },
    output: {
      inlineDeclareExternals: true,
      exportReferencedTypes: false,
      sortNodes: false,
      noBanner: true
    }
  }
]);

fs.writeFileSync(path.resolve(outdir, 'editor/editor.main.d.ts'), types.join('\n'));

// ---

// Copy LICENSE to vendor directory
fs.copyFileSync(path.resolve(node_modules_dir, 'monaco-editor/LICENSE'), path.resolve(outdir, 'LICENSE'));
