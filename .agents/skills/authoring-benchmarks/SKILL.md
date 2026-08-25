---
name: authoring-benchmarks
description: Design, implement, run, debug, and interpret browser performance benchmarks for Elements components and utilities. Use whenever the user asks to benchmark or performance-test runtime code, create or update a .test.bench.ts file, compare benchmark results, investigate a browser performance regression, understand Vitest bench metrics such as throughput, mean, p99, RME, or samples, or add a test:bench task. Do not use this workflow for whole-CI profiling; use the audit-ci skill instead.
---

# Authoring Benchmarks

Create browser benchmarks that answer a specific performance question. Browser behavior is the product behavior, so Chromium is the default runtime for component and utility benchmarks.

## Required Context

Before changing benchmarks:

1. Read [the testing overview](/projects/site/src/docs/internal/guidelines/testing.md).
2. Read the Bench section of [the Vite internals documentation](/projects/internals/vite/README.md).
3. Read the target project's `DEVELOPMENT.md`.
4. Inspect the implementation, its unit tests, and the closest existing benchmark.

Use the `guidance-build` skill as well when adding or changing Wireit tasks. Use the `audit-ci` skill instead when measuring `pnpm run ci`, build orchestration, or the CI completion path.

## Choose the Correct Performance Test

| Question                                                                                              | Tool                                          |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| How fast is a repeatable function, DOM traversal, state synchronization, filter, or component update? | Browser benchmark (`*.test.bench.ts`)         |
| How does a page load, score in Lighthouse, or consume network resources?                              | Lighthouse test (`*.test.lighthouse.ts`)      |
| Did a visual rendering result change?                                                                 | Visual test (`*.test.visual.ts`)              |
| Which build or test task controls CI wall-clock time?                                                 | `audit-ci` workflow                           |
| Is behavior correct?                                                                                  | Unit, accessibility, SSR, or integration test |

Do not use an SSR benchmark as a substitute for browser lifecycle performance. SSR serialization and browser DOM work are different workloads.

## Benchmark Convention

- Name every benchmark file `*.test.bench.ts`.
- Run every benchmark through Chromium using `libraryBenchConfig`.
- Keep the benchmark beside the implementation it measures.
- Use one `vitest.bench.ts` configuration per project.
- Do not add `.test.bench.browser.ts`, a second browser configuration, or a Node-default benchmark convention.
- Use `describe(Component.metadata.tag, ...)` for component benchmarks and a descriptive subsystem name for utilities.
- Use action-and-scale labels such as `filters 1,000 options to one match`.

The shared configuration is `@internals/vite/configs/bench.js`. The Core reference configuration is [projects/core/vitest.bench.ts](/projects/core/vitest.bench.ts).

## Design the Workload First

State the performance question before writing benchmark syntax. A useful benchmark has:

1. **A product-relevant operation:** Filtering options, traversing a grid, synchronizing tree state, generating a path, or updating rendered icons.
2. **A representative scale:** Prefer enough data to expose algorithmic and allocation costs. A leaf rendering benchmark without scalable work does not justify its maintenance cost.
3. **A stable input:** Use fixed deterministic data. Avoid randomness, clocks, network requests, and machine-specific files.
4. **Consistent iterations:** Every sample must perform the same class of work. Alternate values to force updates without allowing state to grow indefinitely.
5. **An observable completion point:** Return computed values. For Lit updates, await `elementIsStable()` and any follow-up asynchronous update triggered by the component.
6. **A narrow boundary:** Exclude fixture creation, selectors, and data generation unless those operations are explicitly under test.

Use at least two sizes when the scaling behavior is the question. If comparing a single operation with a batch, normalize the batch mean per item before drawing conclusions.

## Browser Fixture Pattern

Vitest suite hooks are not the benchmark lifecycle. Use `BenchOptions.setup` and `teardown` so fixtures exist during warmup and sampled runs.

```typescript
import { html } from 'lit';
import type { BenchOptions } from 'vitest';
import { bench, describe } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Combobox } from '@nvidia-elements/core/combobox';
import '@nvidia-elements/core/combobox/define.js';

const optionTemplates = Array.from(
  { length: 1_000 },
  (_, index) => html`<option value=${`${index % 2 ? 'odd' : 'even'}-${index}`}>Option ${index}</option>`
);

describe(Combobox.metadata.tag, () => {
  let element: Combobox;
  let fixture: HTMLElement;
  let input: HTMLInputElement;
  let searchIndex = 0;

  const options: BenchOptions = {
    throws: true,
    async setup() {
      fixture = await createFixture(html`
        <nve-combobox>
          <label>Benchmark</label>
          <input type="search" />
          <datalist>${optionTemplates}</datalist>
        </nve-combobox>
      `);
      element = fixture.querySelector<Combobox>(Combobox.metadata.tag)!;
      input = fixture.querySelector<HTMLInputElement>('input')!;
      await elementIsStable(element);
    },
    teardown() {
      removeFixture(fixture);
    }
  };

  bench(
    'filters 1,000 options',
    async () => {
      input.value = searchIndex++ % 2 ? 'even' : 'odd';
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      await elementIsStable(element);
    },
    options
  );
});
```

Rules for every case:

- Set `throws: true`. Without it, a failing benchmark can report empty or `NaN` results instead of failing.
- Put fixture and data preparation in `setup` when they are outside the measured workload; setup time is not sampled.
- Perform synchronous cleanup in `teardown` with `removeFixture()`.
- Use real registered custom elements and the real DOM. Mock only unavailable browser capabilities.
- Force actual work. Reassigning the current value can turn the benchmark into a no-op.
- Await completion. Measuring only the property assignment misses rendering and asynchronous synchronization.
- Keep cold-load and steady-state questions separate. Warmup and browser caching make benchmarks suitable for steady-state work; use Lighthouse for first-load behavior.

For a pure utility, keep deterministic input outside the callback and return the result:

```typescript
bench('transforms 10,000 values', () => transformValues(values), { throws: true });
```

## Avoid Invalid Measurements

Do not:

- Measure only Lit fixture overhead when the claimed target is component logic.
- Use `beforeAll`, `afterAll`, `beforeEach`, or `afterEach` to manage benchmark fixtures.
- Include assertions, console output, snapshots, or debug logging in the timed callback.
- Accumulate selected nodes, listeners, DOM children, or other state across samples.
- Compare `hz` directly between workloads that process different item counts.
- Treat one noisy local run as proof of a regression or optimization.
- Hide outliers by deleting samples or adding arbitrary delays.

If an operation is faster than the browser timer resolution, benchmark a fixed batch and normalize the result. A reported `min` of `0` is a timer-resolution warning, not zero-cost code.

## Run Benchmarks

Run repository commands through mise. From the target project:

```shell
mise exec -- pnpm run test:bench
```

For one benchmark file, first ensure the project build is current, then run:

```shell
NODE_ENV=production mise exec -- pnpm exec vitest bench --run --config=vitest.bench.ts src/<feature>/<feature>.test.bench.ts
```

Do not run other browser-heavy tasks concurrently when collecting comparison data. For regression analysis, use the same machine, Chromium version, power state, command, inputs, and build mode. Collect at least three runs per revision and compare medians.

## Interpret Results

| Metric                       | Meaning                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| `hz`                         | Completed benchmark operations per second; higher is faster      |
| `mean`                       | Average milliseconds per operation; lower is faster              |
| `p75`, `p99`, `p995`, `p999` | Tail latency percentiles                                         |
| `min`, `max`                 | Observed latency range                                           |
| `rme`                        | Relative margin of error; lower indicates a more stable estimate |
| `samples`                    | Number of timed observations                                     |

Use `mean` or its inverse `hz` for central throughput, percentiles for tail behavior, and RME to judge confidence. Investigate high RME by checking machine contention, outliers, state accumulation, timer resolution, and inconsistent work. Rerun before changing implementation.

For a batch of `N` items:

```text
per-item mean = batch mean / N
per-item throughput = N × batch hz
```

Report the command, browser/runtime context, workload size, median across runs, tail latency, RME, and any normalization. Describe observed changes as correlation unless one-variable experiments establish causality.

## Add Benchmark Support to a Project

When a project has no benchmark task, follow the current Core setup rather than inventing another harness:

1. Add `vitest.bench.ts` using `libraryBenchConfig` and a source alias.
2. Add a Wireit-backed `test:bench` script with benchmark files and configuration as inputs and no outputs.
3. Depend on the builds required by the benchmark imports.
4. Exclude `*.test.bench.ts` from production build inputs and library TypeScript output.
5. Confirm unit-test discovery and coverage exclude benchmark files.
6. Document `pnpm run test:bench` in the project's `DEVELOPMENT.md`.

Benchmarking is opt-in unless the repository's CI policy explicitly adds it to a required workflow. Do not add unstable wall-clock thresholds without a baseline strategy and controlled runners.

## Existing References

- [Icon browser updates](/projects/core/src/icon/icon.test.bench.ts)
- [Sparkline transforms](/projects/core/src/sparkline/sparkline.test.bench.ts)
- [Combobox filtering](/projects/core/src/combobox/combobox.test.bench.ts)
- [Grid navigation and traversal](/projects/core/src/grid/grid.test.bench.ts)
- [Tree synchronization](/projects/core/src/tree/tree.test.bench.ts)
- [Select synchronization](/projects/core/src/select/select.test.bench.ts)

## Validation

After modifying benchmark code or configuration, run:

```shell
cd projects/<project>
mise exec -- pnpm run lint
mise exec -- pnpm run test
mise exec -- pnpm run build
mise exec -- pnpm run test:bench
```

Also run Prettier, Vale for changed Markdown, and `git diff --check`. Confirm no benchmark source appears in production `dist/` output.
