# Reusable WebGPU test suite

Use this reference when a package needs end-to-end WebGPU resource checks, native timing, a DevTools trace, or lifecycle diagnostics. The shared tooling lives behind `@internals/vite/webgpu`; the consuming package supplies the real production workload and assertions.

## Choose the evidence mode

| Mode         | Adapter and browser       | Suitable evidence                                                         | Automation policy                 |
| ------------ | ------------------------- | ------------------------------------------------------------------------- | --------------------------------- |
| `check`      | Software WebGPU, headless | API calls, resource counts, upload sizes, pass structure, and cleanup     | Standard hosted CI                |
| `measure`    | Native WebGPU             | Frame cadence and application-defined update or interaction latency       | Local or controlled dedicated GPU |
| `diagnostic` | Native WebGPU             | Focused DevTools trace plus an optional external WebGPU observer snapshot | Local or controlled dedicated GPU |
| `lifecycle`  | Native WebGPU             | Reconnect, device recovery, resource destruction, and memory bounds       | Local or controlled dedicated GPU |

Package script names are local API. Inspect the consumer's `DEVELOPMENT.md` and `package.json` instead of assuming one set of names. A useful convention is a required `test:webgpu` check plus opt-in `webgpu:measure`, `webgpu:diagnostic`, and `webgpu:lifecycle` commands.

Do not confuse these modes with `test:bench`. Repository `*.test.bench.ts` files measure repeatable CPU or browser-side JavaScript work. Shared-runner timing varies with contention, and a Vitest benchmark does not become a WebGPU benchmark because the implementation eventually prepares GPU data. Keep it out of required PR CI unless a controlled runner, stored baseline, comparison policy, and noise tolerance exist.

## Consumer structure

A consumer normally owns:

```text
vitest.webgpu.ts
src/<area>.test.webgpu.ts
performance/index.html
performance/workload.js
```

The default harness path is `performance/index.html`, but `WebGPUTestRunner` accepts another `harnessPath`. The workload should import the consumer's production build so measurements cover the shipped renderer rather than source-only test instrumentation.

Configure Vitest through the dedicated entrypoint:

```typescript
import { mergeConfig } from 'vitest/config';
import { libraryWebGPUTestConfig } from '@internals/vite/webgpu';

export default mergeConfig(libraryWebGPUTestConfig, {
  root: import.meta.dirname
});
```

The shared config discovers `src/**/*.test.webgpu.ts`, runs the orchestration test in Node.js, serializes files and workers, disables retries, and selects mode-specific timeouts. Keeping Vitest outside the workload page avoids adding
its browser client, sockets, and scheduling work to traces and measurements.

Import all runtime utilities and types from the same entrypoint:

```typescript
import {
  WEBGPU_BUFFER_USAGE,
  WebGPUTestRunner,
  assertNativeWebGPUAdapter,
  collectWebGPUMemorySnapshot,
  getWebGPUWrites,
  summarizeWebGPUResources
} from '@internals/vite/webgpu';
import type { WebGPUObserverSnapshot, WebGPUTestSession } from '@internals/vite/webgpu';
```

## Workload contract and lifecycle

The workload page must install `globalThis.__webgpuTestWorkload` before its exported `ready` promise resolves:

```javascript
const ready = initializeProductionWorkload();

globalThis.__webgpuTestWorkload = {
  getProfile: () => profile,
  pause,
  ready,
  teardown,
  triggerUpdate
};
```

The runner waits for `ready`. A test invokes workload operations with `session.call(method, ...args)`, so arguments and return values must use types that Playwright evaluation supports. Query-string profiles are available through the `profile` option to `runner.load()`.

Use this lifecycle shape:

1. Inspect the production boundary and open one `WebGPUTestRunner` in suite setup.
2. Load an isolated session for the profile and adapter mode that the test targets.
3. Pause recurring animation or updates before narrow resource checks.
4. Reset the observer immediately before the operation under test, invoke one explicit workload method, then snapshot.
5. Assert `session.errors` is empty unless `allowedConsoleErrors` contains a narrowly expected console prefix.
6. Close every session in `finally` or suite cleanup, and always close the runner.

`runner.load()` creates an isolated browser context and supports `viewport`, `deviceScaleFactor`, `profile`, and `observeWebGPU`. The runner captures unexpected page exceptions and console errors. Do not broadly allow console errors; use a stable prefix only for an intentional event such as simulated device loss.

## External WebGPU observer

Set `observeWebGPU: true` only when you need WebGPU API evidence. The runner injects the observer before application code. It records buffer and texture creation/destruction, `writeBuffer` calls, render passes, draws, submits, texture-to-buffer copies, and scissor rectangles. It does not measure GPU execution time.

Important boundaries:

- Prototype wrapping adds instrumentation overhead. Use it for `check`, focused diagnostics, and lifecycle evidence; leave it disabled for clean native timing unless the experiment explicitly measures the observed path.
- `session.resetObserver()` starts a new epoch and clears event arrays, but tracked resource history remains available. Use epoch-aware helpers and fields for operation-local creation and write assertions; use resource `destroyed` state when validating final cleanup.
- Filter writes with `getWebGPUWrites()` and `WEBGPU_BUFFER_USAGE` instead of counting unrelated uniform and storage traffic together. Summaries are reporting aids, not substitutes for assertions on the operation's expected structure.
- A wall-clock duration around a workload method still measures the JavaScript/API boundary unless the workload awaits an intentional completion signal. The observer cannot turn it into GPU duration.

Prefer structural invariants over broad ceilings in `check` mode. Examples include no pick pass without active interaction, one bounded pick pass when enabled, one expected storage upload for a replacement, a partial upload matching the committed byte range, resource reuse across fan-out, allocation only when a feature is active, and destruction of superseded or final resources.

## Native modes

`measure`, `diagnostic`, and `lifecycle` select native WebGPU by default. Call `assertNativeWebGPUAdapter()` before using results; it rejects SwiftShader, known software renderers, fallback adapters, and unavailable adapters.

- Use `WEBGPU_TEST_EXECUTABLE_PATH` when native Chrome or Chromium is outside a standard path.
- Native runs open a headed browser by default. Set `WEBGPU_TEST_HEADLESS=1` only when the host exposes its native adapter in headless Chromium.
- Record `WEBGPU_TEST_POWER_STATE` and include `runner.environmentReport()` so reports capture browser, adapter, host, viewport, device-pixel ratio, commit, and worktree state.
- Use fixed warmup and sampling windows, at least three runs, and medians. Keep frame-interval or update-latency evidence distinct from actual GPU timestamp-query evidence.
- Keep diagnostic traces short and focused on one representative action. `captureTrace()` writes the DevTools trace as an artifact and does not guarantee that Chromium exposes a GPU-duration event.
- For lifecycle checks, assert resource destruction across cleanup and device generations first. Treat browser memory APIs as conditional evidence, collect garbage consistently, and use a generous documented bound rather than exact equality.

Environment integer helpers support consumer-defined variables such as warmup duration, sample duration, run count, trace duration, and lifecycle loops. Keep their defaults in the consuming project because representative workloads and
budgets are product-specific.

## Production boundary and artifacts

Use `runner.inspectProductionBoundary()` before measurement when test scaffolding or monitoring hooks could leak into a published build. Check for forbidden test filenames, imports, globals, event names, or observer tokens while explicitly allowing any intentional public example. The returned fingerprints and byte total make the exact build part of the report.

`runner.writeReport()` and `runner.writeArtifact()` create timestamped files under `.webgpu/` by default. `captureTrace()` uses the same artifact root. A Wireit-backed CI check should:

- depend on the production build and `../internals/vite:ci`;
- include `dist/**/*.js`, the workload, `src/**/*.test.webgpu.ts`, `package.json`, and `vitest.webgpu.ts` as inputs;
- run `WEBGPU_TEST_MODE=check vitest run --config=vitest.webgpu.ts` through `playwright-lock` when browser-heavy tasks can overlap;
- declare `coverage/webgpu/**` and the check-mode `.webgpu` report glob as outputs; and
- use `clean: false` when timestamped reports share the artifact directory with opt-in native runs.

The CI check is reliable because its assertions are deterministic and its software adapter is reproducible, not because software WebGPU predicts native performance. Never place native frame-time budgets in the generic hosted CI job.

## Validation and reporting

When changing the shared framework, run the internal Vite tests as well as a real consumer suite. When changing a consumer, run its lint and production build before `test:gpu`, then exercise each changed native mode on a compatible GPU host. Use the commands documented by that package.

Report which mode ran and label the evidence precisely:

- external WebGPU call/resource observation;
- JavaScript or animation-frame timing;
- DevTools trace observation;
- CDP or browser memory snapshot; or
- GPU timestamp-query duration.

Include workload scale, adapter/browser environment, build and worktree identity, run configuration, variance or percentiles where applicable, and known unavailable measurements. Do not describe observer counts, animation-frame intervals, or queue-completion waits as GPU execution time.
