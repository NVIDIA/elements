import axe from 'axe-core';

/**
 * @private
 * Runs axe-core to meet minimum WCAG compliance requirements
 * https://wcag.com/legal/
 *
 * Finds on average 57% of WCAG issues automatically
 * https://github.com/dequelabs/axe-core
 */
export async function runAxe(selectors: string[], config = { }) {
  const results = await axe.run(selectors, config);
  if (results.violations.length) {
    throw new Error(`AXE Failure: ${JSON.stringify(results.violations, null, 2)}`);
  }

  return results;
}
