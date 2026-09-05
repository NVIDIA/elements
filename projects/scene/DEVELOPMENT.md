# Development

| Command                      | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `pnpm run build`             | Build the library                           |
| `pnpm run build:watch`       | Build the library in watch mode             |
| `pnpm run dev`               | Start development mode with file watching   |
| `pnpm run lint`              | Lint source files                           |
| `pnpm run lint:fix`          | Fix supported source lint errors            |
| `pnpm run lint:style`        | Lint component styles                       |
| `pnpm run test`              | Run unit tests                              |
| `pnpm run test:watch`        | Run unit tests in watch mode                |
| `pnpm run test:axe`          | Run accessibility tests                     |
| `pnpm run test:artifacts`    | Validate generated package artifacts        |
| `pnpm run test:bench`        | Run local benchmarks once                   |
| `pnpm run test:coverage`     | Run unit tests with coverage                |
| `pnpm run test:ssr`          | Run server-side rendering tests             |
| `pnpm run test:visual`       | Run visual regression tests                 |
| `pnpm run test:lighthouse`   | Run Lighthouse performance tests            |
| `pnpm run test:webgpu`       | Check external WebGPU call/resource budgets |
| `pnpm run typecheck`         | Validate TypeScript source and tests        |
| `pnpm run webgpu:measure`    | Run three native timing passes per profile  |
| `pnpm run webgpu:diagnostic` | Capture an external DevTools trace          |
| `pnpm run webgpu:lifecycle`  | Check lifecycle memory and cleanup          |
| `pnpm run ci`                | Run the full CI pipeline                    |

Pass Vitest benchmark comparison options directly to the script:

```shell
pnpm run test:bench -- --reporter=json --outputFile=benchmark.json
```

The shared `vitest.webgpu.ts` configuration runs the package-owned `*.test.webgpu.ts` suite against the production build.
The native performance commands require a native Chromium WebGPU adapter. The timing suite uses headed Chromium, warms
each profile for five seconds, measures for 30 seconds, and writes reproducible JSON reports to `.webgpu/`. Record
the host power state with `WEBGPU_TEST_POWER_STATE`. `WEBGPU_TEST_HEADLESS=1` is available on hosts whose headless
Chromium exposes a native adapter; the runner rejects software adapters. The deterministic `test:webgpu` command
uses software WebGPU because it checks API call and resource invariants rather than timing. Set
`WEBGPU_TEST_EXECUTABLE_PATH` when the native Chrome or Chromium executable is outside a standard installation path.

Use `WEBGPU_TEST_WARMUP_MS`, `WEBGPU_TEST_DURATION_MS`, and `WEBGPU_TEST_RUNS` to adjust native timing. Use
`WEBGPU_TEST_TRACE_MS` for diagnostic capture and `WEBGPU_TEST_LIFECYCLE_LOOPS` for lifecycle testing.
