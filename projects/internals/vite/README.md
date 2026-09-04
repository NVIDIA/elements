# @internals/vite

This project is a private and internal API for the elements repo. This provides default Vite build and test configs for all Elements projects.

The default configs are standard Vite configuration objects. The objects can be overridden per project level. The configs provide common standard options for the libraries including library API/performance optimizations and test coverage requirements.

- `configs/`: base vite configs for vite builds and tests
- `playwright/`: playwright specific scripts
- `plugins/`: vite plugins for build pipelines such as TS and minification
- `runners/`: test runners for run time evaluation steps, lighthouse or visual
- `setup/`: initialize files for setup/teardown work with specific test runners

## Documentation

### Build

```typescript
// vite.config.ts
import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

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

### Test

```typescript
// vitest.config.ts
import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './src') }
  }
});
```

```typescript
// dot.test.ts
import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Dot } from '@nvidia-elements/core/dot';
import '@nvidia-elements/core/dot/define.js';

describe(Dot.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Dot;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-dot></nve-dot>
    `);
    element = fixture.querySelector(Dot.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Dot.metadata.tag)).toBeDefined();
  });
});
```

To run the tests run `pnpm run test`

```shell
vitest run --config=vitest.ts
```

### Bench

Browser benchmark files use the `.test.bench.ts` suffix.

```typescript
// vitest.bench.ts
import { resolve } from 'node:path';
import { mergeConfig } from 'vitest/config';
import { libraryBenchConfig } from '@internals/vite/configs/bench.js';

export default mergeConfig(libraryBenchConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './src') }
  }
});
```

```typescript
// calculate-layout.test.bench.ts
import { describe, test } from 'vitest';
import { calculateLayout } from './calculate-layout.js';

const items = Array.from({ length: 1_000 }, (_, index) => ({ height: index % 10, width: index % 10 }));

describe('calculateLayout', () => {
  test('lays out 1,000 items', async ({ bench }) => {
    await bench('lays out 1,000 items', () => calculateLayout(items)).run({
      iterations: 10,
      throws: true,
      time: 500,
      warmupIterations: 5,
      warmupTime: 100
    });
  });
});
```

To run the benchmarks run `pnpm run test:bench`.

```shell
vitest bench --run --config=vitest.bench.ts
```

### WebGPU

WebGPU rendering test files use the `.test.webgpu.ts` suffix. Vitest runs these files in Node.js so the shared runner can
measure a clean Playwright page without adding the Vitest browser client to frame, trace, or memory results.

```typescript
// vitest.webgpu.ts
import { mergeConfig } from 'vitest/config';
import { libraryWebGPUTestConfig } from '@internals/vite/webgpu';

export default mergeConfig(libraryWebGPUTestConfig, {
  root: import.meta.dirname
});
```

Use `WebGPUTestRunner` and the related test utilities from `@internals/vite/webgpu`. The runner starts an isolated Vite
server and Chromium instance, loads a package-owned workload page, and optionally installs an external WebGPU call
observer. The workload page must expose a `ready` promise and its operations through
`globalThis.__webgpuTestWorkload`.

Set `WEBGPU_TEST_MODE` to `check`, `measure`, `diagnostic`, or `lifecycle`. Check mode uses deterministic software WebGPU.
The other modes use a native adapter and reject software fallbacks. Use `WEBGPU_TEST_EXECUTABLE_PATH` to select a native
Chrome or Chromium executable and `WEBGPU_TEST_HEADLESS=1` when the host exposes native WebGPU in headless mode.
`WebGPUTestRunner.load()` rejects a fallback adapter in native mode and waits up to 30 seconds for the workload `ready`
promise by default. Pass `readyTimeout` to adjust that readiness deadline.

Keep workload construction, profiles, budgets, and product lifecycle operations in the consuming project. Reuse the
shared runner for browser lifecycle, adapter validation, WebGPU observation, traces, memory snapshots, environment data,
statistics, and report artifacts.

### Axe

```typescript
// vitest.axe.ts
import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@internals/vite';

export default mergeConfig(libraryAxeTestConfig, {
  test: {
    include: ['./src/**/*.test.axe.ts'],
    alias: { '@nvidia-elements/library': resolve(import.meta.dirname, './dist') },
  }
});
```

```typescript
// dot.test.axe.ts
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { runAxe } from '@internals/testing/axe';
import { Dot } from '@nvidia-elements/core/dot';
import '@nvidia-elements/core/dot/define.js';

describe(Dot.metadata.tag, () => {
  it('should pass axe check for status', async () => {
    const fixture = await createFixture(html`
      <nve-dot></nve-dot>
    `);

    await elementIsStable(fixture.querySelector(Dot.metadata.tag));
    const results = await runAxe([Dot.metadata.tag]);
    expect(results.violations.length).toBe(0);
    removeFixture(fixture);
  });
});
```

To run the tests run `pnpm run test:axe`

```shell
vitest run --config=vitest.axe.ts
```

### Lighthouse

```typescript
// vitest.lighthouse.ts
import { mergeConfig } from 'vitest/config';
import { libraryLighthouseConfig } from '@internals/vite';

export default mergeConfig(libraryLighthouseConfig, {
  test: {
    include: ['src/**/*.test.lighthouse.ts']
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
  <body role="main" nve-layout="column gap:lg pad:md">
    <p nve-text="body">Lighthouse Test</p>
  </body>
</html>
```

```typescript
// dot.test.lighthouse.ts
import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@internals/vite';

describe('dot lighthouse report', () => {
  test('dot should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport('nve-dot', /* html */`
      <nve-dot>dot</nve-dot>
      <script type="module">
        import '@nvidia-elements/core/dot/define.js';
      </script>
    `);

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(18);
  });
});
```

The tests return a report containing the lighthouse score results in performance, best practices, and accessibility. (`pnpm run test:lighthouse`)

```shell
vitest run --config=vitest.lighthouse.ts
```

### Visual

```typescript
// vitest.visual.ts
import { mergeConfig } from 'vitest/config';
import { libraryVisualTestConfig } from '@internals/vite';

export default mergeConfig(libraryVisualTestConfig, {
  test: {
    include: [
      'src/**/*.test.visual.ts'
    ],
    outputFile: {
      junit: './coverage/visual/junit.xml'
    }
  }
});
```

Create a base template for visual to run tests in `vitest.visual.html`

```html
<!doctype html>
<html lang="en" nve-theme="">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="about page" />
    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon" />
    <title>Visual</title>
    <style>
      @import '@nvidia-elements/themes/fonts/inter.css';
      @import '@nvidia-elements/themes/index.css';
      @import '@nvidia-elements/themes/dark.css';
      @import '@nvidia-elements/styles/typography.css';
      @import '@nvidia-elements/styles/layout.css';
    </style>
  </head>
  <body></body>
</html>
```

Create a test file example: `src/dot/dot.test.visual.ts`

```typescript
import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('dot visual', () => {
  test('dot should match visual baseline', async () => {
    const report = await visualRunner.render('dot', /* html */`
      <script type="module">
        import '@nvidia-elements/core/dot/define.js';
      </script>
      <nve-dot>•︎•︎•︎</nve-dot>
    `);
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
```

The tests generate a `.visual` directory with the baseline snapshots. Later tests compare against these generated images. If a test needs updating, simply delete the image that needs regenerating and rerun the test. (`pnpm run test:visual`)

```shell
vitest run --config=vitest.visual.ts
```

### SSR

Ensure Lit based components successfully can be server side rendered (SSR).

```typescript
// vitest.ssr.ts
import { mergeConfig } from 'vitest/config';
import { libraryLitSSRTestConfig } from '@internals/vite';

export default mergeConfig(libraryLitSSRTestConfig, {
  test: {
    include: [
      './src/**/*.test.ssr.ts'
    ],
    outputFile: {
      junit: './coverage/ssr/junit.xml'
    }
  }
});
```

```typescript
// dot.test.ssr.ts
import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Dot } from '@nvidia-elements/core/dot';
import '@nvidia-elements/core/dot/define.js';

describe(Dot.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`<nve-dot></nve-dot>`);
    expect(result.includes('shadowroot="open"')).toBe(true);
    expect(result.includes('nve-dot')).toBe(true);
  });
});
```

To run the tests run `pnpm run test:ssr`

```shell
vitest run --config=vitest.ssr.ts
```
