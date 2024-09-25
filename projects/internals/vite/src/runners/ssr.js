import { render } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';

/**
 * This runner does a basic string render for SSR.
 * This helps ensure components do not throw exceptions and can do basic shallow
 * server side rendering.
 *
 * https://lit.dev/docs/ssr/authoring/
 */
class SSRRunner {
  async render(content) {
    const result = render(content);
    const contents = await collectResult(result);
    return contents;
  }
}

export const ssrRunner = new SSRRunner();
