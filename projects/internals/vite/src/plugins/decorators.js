import { transformWithEsbuild } from 'vite';

/**
 * - https://github.com/oxc-project/oxc/issues/9170
 * - https://vite.dev/guide/migration#javascript-transforms-by-oxc
 */
export const transpileDecorators = () => {
  return {
    // Oxc preserves TC39 decorators (only transpiles legacy), but Istanbul's
    // Babel parser can't parse them. Use esbuild to downlevel decorators.
    name: 'transpile-decorators',
    async transform(code, id) {
      if (!id.includes('.ts') || !/(?:^|\s)@\w+/m.test(code)) return null;
      const result = await transformWithEsbuild(code, id, { target: 'es2022' });
      return { code: result.code, map: result.map };
    }
  };
};
