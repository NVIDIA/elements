---
{
  title: 'Lighthouse Testing',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Lighthouse performance, accessibility, and best practices tests.

**Key Patterns:**

- Test performance, accessibility, and best practices scores
- Check JavaScript bundle size limits

**Example:**

```typescript
import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('badge lighthouse report', () => {
  test('badge should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-badge', /* html */`
      <nve-badge>badge</nve-badge>
      <script type="module">
        import '@nvidia-elements/core/badge/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(15.7);
  });
});
```

## Running Tests

Test scripts should be run in the root directory of the project where the `package.json` is located.

```shell
# run all tests
pnpm run test:lighthouse

# run single test suite
pnpm run test:lighthouse -- src/badge/badge.test.lighthouse.ts
```
