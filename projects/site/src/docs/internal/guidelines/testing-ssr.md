---
{
  title: 'SSR Testing',
  description: 'Internal guidelines: write server-side rendering tests for NVIDIA Elements components and catch hydration regressions.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Server-side rendering compatibility tests.

**Key Patterns:**

- Test basic SSR rendering with `html` template
- Check for `shadowroot="open"` attribute
- Verify element tag presence in rendered output

**Example:**

```typescript
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Badge } from '@nvidia-elements/core/badge';
import '@nvidia-elements/core/badge/define.js';

describe(Badge.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-badge>badge</nve-badge>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-badge')).toBe(true);
  });
});
```

## Running Tests

Run test scripts from the root directory of the project where the `package.json` lives.

```shell
# run all tests
pnpm run test:ssr

# run single test suite
pnpm run test:ssr -- src/badge/badge.test.ssr.ts
```
