# @nvidia-elements/testing-lighthouse

The `@nvidia-elements/testing-lighthouse` project provides utilities for running Lighthouse audits via Vite. This will run a series of Accessibility, Performance and Best Practice tests against each component in isolation. Due to the isolation required for the tests, the average test takes around 5-6 seconds to complete.

## Install

```bash
# add internal registry to local .npmrc file
@nve:registry=https://registry.npmjs.org
```

```shell
pnpm install @nvidia-elements/testing-lighthouse --save-dev
```

## Configure Vitest

Create a vite.lighthouse.ts file in your project root with the following content:

```typescript
import { mergeConfig } from 'vitest/config';
import { lighthouseConfig } from '@nvidia-elements/testing-lighthouse/vite';

export default mergeConfig(lighthouseConfig, {
  test: {
    include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts']
  }
});
```

## Base Template

Create a base template for lighthouse to run tests in `vitest.lighthouse.html`

```html
<!doctype html>
<html lang="en" nve-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="view-transition" content="same-origin" />
    <meta name="description" content="about page" />
    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon" />
    <title>Lighthouse</title>
    <style>
      @import '@nvidia-elements/themes/fonts/inter.css';
      @import '@nvidia-elements/themes/index.css';
      @import '@nvidia-elements/themes/dark.css';
      @import '@nvidia-elements/styles/layout.css';
      @import '@nvidia-elements/styles/typography.css';
    </style>
  </head>
  <body nve-layout="column gap:lg pad:md">
    <p nve-text="body">Lighthouse Test</p>
  </body>
</html>
```

## Test File

Create a test file example: `src/badge/badge.test.lighthouse.ts`

```typescript
import { expect, test, describe } from 'vitest';
import { runner } from '@nvidia-elements/testing-lighthouse';

describe('badge lighthouse report', () => {
  test('badge should meet lighthouse benchmarks', async () => {
    const report = await runner.getReport('nve-badge', /* html */`
      <mlv-badge>badge</nve-badge>
      <script type="module">
        import '@nvidia-elements/core/badge/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
```

## Run Tests

The tests will return a report containing the lighthouse score results in performance, best practices and accesibility.

```shell
vitest run --config=vitest.lighthouse.ts
```
