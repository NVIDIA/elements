---
{
  title: 'Visual Testing',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Visual regression tests using Playwright screenshots.

**Key Patterns:**

- Test both light and dark themes
- Use comprehensive element variants
- Expect diff percentage < 1%
- Use placeholder text (`•︎•︎•︎`) for consistent visual testing

**Example:**

```typescript
import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('badge visual', () => {
  test('badge should match visual baseline', async () => {
    const report = await visualRunner.render('badge', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('badge should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('badge.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/badge/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="row gap:xs align:wrap">
    <nve-badge status="scheduled">•︎•︎•︎</nve-badge>
    <!-- ... other variants -->
  </div>
  `;
}
```

## Running Tests

Test scripts should be run in the root directory of the project where the `package.json` is located.

```shell
# run all tests
pnpm run test:visual

# run single test suite
pnpm run test:visual -- src/badge/badge.test.visual.ts
```
