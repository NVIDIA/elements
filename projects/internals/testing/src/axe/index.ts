/**
 * @experimental
 * Runs axe-core to meet min WCAG compliance requirements
 * https://wcag.com/legal/
 *
 * Finds on average 57% of WCAG issues automatically
 * https://github.com/dequelabs/axe-core
 */
export async function runAxe(selectors: string[], config = {}) {
  return await globalThis.axe.run(selectors, {
    rules: {
      // axe does not support ElementInternals AOM yet https://github.com/dequelabs/axe-core/issues/4259
      'aria-prohibited-attr': { enabled: false }
    },
    ...config
  });
}
