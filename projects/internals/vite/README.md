# @nve-internals/vite

This project is a private and internal API for the elements repo. This provides default Vite build and test configs for our projects.

The default configs are standard Vite configuration objects. The objects can be overridden per project level. The configs provide common standard options for our libraries including library API/performance optimizations and test coverage requirements.

## Build

```typescript
// vite.config.ts
import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      include: ['./src/**/*.test.lighthouse.ts'],
      alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
```

## Test

```typescript
// vitest.config.ts
import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './src') }
  }
});
```

## Axe

```typescript
// vitest.axe.ts
import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryAxeTestConfig, {
  test: {
    include: ['./src/**/*.test.axe.ts'],
    alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './dist') },
  }
});
```

## Lighthouse

```typescript
// vitest.lighthouse.ts
import { mergeConfig } from 'vitest/config';
import { libraryLighthouseConfig } from '@nve-internals/vite';

export default mergeConfig(libraryLighthouseConfig, {
  test: {
    include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts']
  }
});
```

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

Create a test file example: `src/badge/badge.test.lighthouse.ts`

```typescript
import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

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
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
```

The tests will return a report containing the lighthouse score results in performance, best practices and accesibility.

```shell
vitest run --config=vitest.lighthouse.ts
```
