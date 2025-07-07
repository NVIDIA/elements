---
{
  title: 'Accessibility Testing',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Accessibility compliance tests using axe-core.

**Key Patterns:**

- Use `runAxe` from `@nvidia-elements/testing/axe`
- Expect zero violations: `expect(results.violations.length).toBe(0)`

**Example:**

```typescript
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@nvidia-elements/testing';
import { runAxe } from '@nvidia-elements/testing/axe';
import { Badge } from '@nvidia-elements/core/badge';
import '@nvidia-elements/core/badge/define.js';

describe(Badge.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <nve-badge status="scheduled">scheduled</nve-badge>
      <nve-badge status="queued">queued</nve-badge>
      <!-- ... other status variants -->
    `);

    await elementIsStable(fixture.querySelector(Badge.metadata.tag));
    const results = await runAxe([Badge.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
```

## Running Tests

Test scripts should be run in the root directory of the project where the `package.json` is located.

```shell
# run all tests
pnpm run test:axe

# run single test suite
pnpm run test:axe -- src/badge/badge.test.axe.ts
```
