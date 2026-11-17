import { transform } from 'esbuild';

/**
 * - https://github.com/oxc-project/oxc/issues/9170
 * - https://vite.dev/guide/migration#javascript-transforms-by-oxc
 */
export const transpileDecorators = () => {
  return {
    // Vite's Oxc pass removes TypeScript syntax and preserves standard decorators.
    // Lower those decorators for Node.js and Istanbul.
    name: 'transpile-decorators',
    async transform(code, id) {
      const filename = id.split(/[?#]/, 1)[0];
      if (!/\.tsx?$/.test(filename) || !code.includes('@')) return null;

      const result = await transform(code, {
        target: 'es2022',
        sourcefile: id,
        sourcemap: true
      });
      return { code: result.code, map: result.map };
    }
  };
};
