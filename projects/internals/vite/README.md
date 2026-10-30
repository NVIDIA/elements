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

### Render

Core uses `*.test.render.ts`, `vitest.render.ts`, and `libraryRenderTestConfig` for Chromium render regression tests. Vitest orchestrates Node callbacks against a clean Playwright page. Each scenario builds its fixture with `buildPage`, opens a fresh Chromium browser through `VitePlaywrightRunner`, and closes its CDP session, page, browser, and server. The configuration uses one worker, serial files, no retries, and no coverage instrumentation.

```typescript
import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { beforeEach, describe, it } from 'vitest';
import { renderRunner } from '@internals/vite';

describe('nve-grid: rendering', () => {
  let content: TemplateResult;

  beforeEach(() => {
    content = html`
      <nve-grid><nve-grid-row><nve-grid-cell>before</nve-grid-cell></nve-grid-row></nve-grid>
      <script type="module">
        import '@nvidia-elements/core/grid/define.js';
        import { elementIsStable } from '@internals/testing';
        const grid = document.querySelector('nve-grid');
        const cell = grid.querySelector('nve-grid-cell');
        window.renderWorkload = {
          ready: Promise.all([grid, ...grid.querySelectorAll('*')].map(elementIsStable)),
          mutate() { cell.textContent = 'after'; },
          async complete() {
            await elementIsStable(grid);
            if (cell.textContent !== 'after') throw new Error('Mutation did not complete');
          }
        };
      </script>`;
  });

  it('batches a cell text mutation', async () => {
    await renderRunner.getReport({
      name: 'grid-one-cell-text',
      workload: 'one cold text mutation',
      content,
      prepare: page => page.evaluate('window.renderWorkload.ready'),
      interact: page => page.evaluate('window.renderWorkload.mutate()'),
      complete: page => page.evaluate('window.renderWorkload.complete()'),
      budgets: { layoutCount: 4, styleRecalcCount: 4 }
    });
  });
});
```

From `projects/core`, run:

```shell
mise exec -- pnpm run test:render
# After building prerequisites, these commands always execute measurements, bypassing Wireit freshness:
mise exec -- pnpm exec vitest run --config=vitest.render.ts
mise exec -- pnpm exec vitest run --config=vitest.render.ts src/grid/grid.test.render.ts
mise exec -- pnpm exec vitest run --config=vitest.render.ts src/grid/grid.test.render.ts -t '500 grid cells'
RENDER_TRACE=1 mise exec -- pnpm exec vitest run --config=vitest.render.ts src/grid/grid.test.render.ts
```

`renderRunner.getReport(options)` accepts a unique descriptive `name`, `workload` description, fixture `content`, Node callbacks `prepare(page)`, `interact(page)`, and `complete(page)`, optional count `budgets`, `trace`, `timeoutMs` (default 10,000 per callback phase), and `outputDir` (default `.render/reports`). Callbacks receive Playwright's Page. Pass JSON-compatible values to `page.evaluate`; Node imports and closure variables do not exist in the browser. Omit `budgets` to collect calibration reports. Committed regression scenarios must supply explicit budgets.

Fixture `content` accepts either an HTML string or a Lit `html` template. Templates support nested templates, arrays, text escaping, attributes, and boolean attributes. Serialization happens before fixture building and measurement; components initialize in Chromium. The runner leaves their internals untouched in Node. The runner removes Lit's serialization markers from the fixture HTML.

Use attributes for initial markup and `prepare(page)` for browser properties or behavior. Node event handlers and property bindings cannot cross this boundary, so the runner rejects `@event` and `.property` bindings. Keep module scripts static and pass scenario configuration through data attributes.

Expose fixture APIs through `window.renderWorkload`. Each `getReport` call creates a fresh browser document, so fixtures can reuse this name without sharing state. Each fixture defines the methods its scenario needs.

Fixture browser modules can import shared utilities from `@internals/testing/render`:

- `waitForAnimationFrames(count = 2)` waits for rendering opportunities. Unit tests can also import it from `@internals/testing`.
- `waitForEvent(target, type, { label, timeoutMs })` installs its listener immediately and removes it on success or timeout.
- `waitForLitAnimations(element, { label, timeoutMs })` awaits Lit updates, allows transition creation, resolves styles,
  and awaits the animations present at that boundary. It accepts canceled animations and returns the observed animation count;
  callers must still verify the resulting component state. Both waits default to 2,000 ms.
- `observePopover(element)` collects the ID, native popover attribute/state, rectangle count, and computed display.
  Read these observations outside the measured window; keep component assertions in the scenario.
- `resizeWithGeometryReads(element, { widths: [480, 800], iterations: 120 })` deliberately alternates width writes and
  geometry reads in one task and returns the sum of observed widths. Use it inside the measured interaction only when
  those reads are part of the intended workload. Check for width clamping during preparation.

Frame and animation waits do not establish completion of arbitrary observers or timers. Keep component completion signals explicit. Core's `vitest.render.html` loads shared theme, layout, and typography styles for every fixture. Keep scenario-specific styles in the fixture content.

Group scenarios with `describe` and `it`, and construct fixture templates in `beforeEach`. Keep browser readiness in `prepare`, the measured operation in `interact`, and structural assertions in `validate` so the runner saves failures in reports. The runner owns browser, CDP, and server cleanup in `finally`. Use `afterEach` for resources owned by the test, such as restoring spies.

The fixed viewport is 1180 × 820, headless Chromium, with reduced motion requested through the media query. The suite does not globally disable CSS animations. Avoid unrelated motion in fixtures; preserve motion when the scenario measures it. Scenarios use fresh state without warmup. Do not compare these cold operations with warmed benchmarks.

#### Measurements and budgets

The runner enables CDP Performance and subtracts starting counters from ending counters. Required missing, invalid, non-finite, or decreasing metrics fail measurement. Reports expose:

- `layoutCount` and `styleRecalcCount`: page/renderer counter deltas, including legitimate rendering work.
- `layoutDurationMs` and `styleRecalcDurationMs`: duration deltas converted from protocol seconds to milliseconds.
- `name`, `workload`, `budgets`, `exceededBudgets`, Chromium version, viewport, and execution settings.
- `artifacts.report`, optional `artifacts.trace`, `traceRun`, diagnostic errors, and the primary error on failure.

Count budgets must be finite nonnegative integers. Exceeding either supplied count budget fails CI. Durations provide diagnostic context and do not gate CI. JSON reports survive budget and interaction failures, including trace errors. The runner preserves the primary failure when diagnostics or cleanup also fail. Failure reports can lack measurements when the operation did not finish; this is an explicit failure, never a zero-count measurement.

Initial calibration on Chromium `153.0.8010.12` used three uncached executions per scenario:

| Scenario            | Layout counts | Style counts | Count budgets (layout/style) |
| ------------------- | ------------- | ------------ | ---------------------------- |
| Batched 16 writes   | 1, 1, 1       | 1, 1, 1      | 2 / 2                        |
| Batched 64 writes   | 1, 1, 1       | 1, 1, 1      | 2 / 2                        |
| Thrashing 16 writes | 16, 16, 16    | 16, 16, 16   | 2 / 2; expected rejection    |
| Thrashing 64 writes | 64, 64, 64    | 64, 64, 64   | 2 / 2; expected rejection    |
| Grid 500 cells      | 1, 1, 1       | 1, 1, 1      | 4 / 4                        |
| Grid 2,000 cells    | 2, 2, 2       | 2, 2, 2      | 4 / 4                        |

The synthetic control performs every width change but reads geometry before the writes. The thrashing workload changes width before each observable geometry read in the same task. Its expected rejection is a passing detector test. The grid budget permits initial batched rendering and follow-up observer work with a small scheduling allowance. It rejects per-cell layout at either scale. Other interactions can require legitimate layouts.

Review budgets with at least three uncached runs on the same browser, machine, build, and workload. After a Chromium upgrade, compare recorded versions and traces, inspect browser changes and workload completion, and review any budget change explicitly. Never automatically update budgets or increase them to accommodate a deliberately bad implementation. Use the same scenario before and after a proposed batching fix, verify the intended state still changes, and rerun both synthetic controls. Do not subtract harness constants or use retries to hide failures.

#### Diagnostics and limitations

Enable `RENDER_TRACE=1` or `trace: true` to capture the original run through CDP Tracing. Import the generated `.trace.json` into Chrome DevTools' Performance panel. Find the `render-operation` User Timing measure and its `render-operation-start` and `render-operation-end` marks, then inspect Layout style, and JavaScript events in that window. The runner reads the returned stream, closes it, and records trace errors separately. It never reruns a failing scenario to replace the original verdict. Diagnostic tracing can affect timing, so compare count results as well.

Reports and traces use sanitized scenario names plus unique IDs beneath the configured output directory. Temporary fixture builds live in ignored `.render/`; only `.render/reports/**` and `coverage/render/**` are Wireit outputs. CI retains these artifacts on success and failure. The default task acquires the existing Playwright lock. Some other browser suites do not take that lock, so this does not provide machine-wide isolation. Run local calibration commands alone; do not schedule performance comparisons alongside browser-heavy jobs. CI count checks can still share a host with other package tests. Host load, fonts, browser versions, and observer scheduling can affect results.

A layout count is not a forced-reflow count. A geometry read can reuse a valid layout. Style recalculation computes CSS; layout computes geometry; layout shifts describe visible movement; JavaScript benchmark timings measure a different boundary. These page/renderer counters cannot attribute work to individual elements or establish forced-layout causes. Use the raw timeline and JavaScript stacks to investigate interleaved writes and reads, redundant updates, or resize feedback. The suite does not classify forced reflows, compare screenshots, or replace Lighthouse loading audits.

See the protocol references for [Performance](https://chromedevtools.github.io/devtools-protocol/tot/Performance/), [Tracing](https://chromedevtools.github.io/devtools-protocol/tot/Tracing/), and [Playwright CDPSession](https://playwright.dev/docs/api/class-cdpsession).

#### Structural observations

`getReport` also accepts optional `metadata`, `observe(page)`, and `validate(report)` callbacks. The runner captures ending counters and the trace interval's end mark before calling `observe`. Return a JSON-compatible record of component-specific observations. `validate` can reject those observations; the saved report retains observations, metrics, budget results, and the primary validation error. Observation and validation use the same bounded timeout as other callbacks. Geometry reads in `observe` do not contribute to the reported counter deltas.

Use `reducedMotion: 'no-preference'` for a dedicated real-motion scenario. The default remains `reduce`; report settings record the requested policy. Motion preference alone does not disable component transitions.
