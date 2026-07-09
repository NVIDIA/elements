import { transformWithEsbuild } from 'vite';

/**
 * - https://github.com/oxc-project/oxc/issues/9170
 * - https://vite.dev/guide/migration#javascript-transforms-by-oxc
 * @param {{ experimentalDecorators?: boolean }} [options]
 */
export const transpileDecorators = ({ experimentalDecorators = false } = {}) => {
  return {
    // Oxc preserves TC39 decorators, but downstream runtimes and tooling don't
    // consistently support them. Use esbuild to downlevel decorators.
    name: 'transpile-decorators',
    async transform(code, id) {
      if (!id.includes('.ts') || !/(?:^|\s)@\w+/m.test(code)) return null;
      const result = await transformWithEsbuild(code, id, {
        target: 'es2022',
        ...(experimentalDecorators
          ? {
              tsconfigRaw: {
                compilerOptions: {
                  experimentalDecorators: true,
                  useDefineForClassFields: false
                }
              }
            }
          : {})
      });
      return { code: result.code, map: result.map };
    }
  };
};
