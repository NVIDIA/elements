---
{
  title: 'Accessibility Testing',
  description: 'Internal guidelines: write axe-core accessibility tests and read their Chromium, theme, and rule coverage.',
  layout: 'docs.11ty.js'
}
---

# {{ title }}

Accessibility tests using axe-core. A passing test records an automated result, separate from a WCAG conformance claim. The [accessibility policy](/docs/about/accessibility/) separates the WCAG 2.1 AA target, the current WCAG 2.2 Recommendation, and these checks.

**Coverage of `runAxe`:**

- Browser: Chromium through Playwright.
- Theme: `@nvidia-elements/themes/index.css` with an empty `nve-theme` attribute, which uses the default light theme on `:root`. The setup does not load `dark.css` or `high-contrast.css`.
- Rules: axe-core 4.11.0 default selection, with `aria-prohibited-attr` disabled. That default selection leaves the WCAG 2.2 `target-size` rule disabled.
- Manual follow-up: keyboard, screen reader, focus, contrast, zoom, and interaction testing. axe-core reports that automated rules find, on average, 57% of WCAG issues.

**Key Patterns:**

- Use `runAxe` from `@internals/testing/axe`
- Expect zero violations: `expect(results.violations.length).toBe(0)`

**Example:**

```typescript
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
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

Run test scripts from the root directory of the project where the `package.json` lives.

```shell
# run all tests
pnpm run test:axe

# run single test suite
pnpm run test:axe -- src/badge/badge.test.axe.ts
```
