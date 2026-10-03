# Development

| Command                             | Description                                                         |
| ----------------------------------- | ------------------------------------------------------------------- |
| `pnpm run build`                    | Build the library and generate grammar data                         |
| `pnpm run build:highlight`          | Generate indexed grammars for the library build                     |
| `pnpm run dev`                      | Start development mode with file watching                           |
| `pnpm run lint`                     | Lint source files                                                   |
| `pnpm run test`                     | Run component unit tests                                            |
| `pnpm run test:highlight`           | Check compiler, scanner, corpus, checkpoints, and incremental edits |
| `pnpm run test:visual`              | Run codeblock and native textarea visual tests                      |
| `pnpm run test:ssr`                 | Run server rendering and codeblock hydration tests                  |
| `pnpm run test:watch`               | Run component tests in watch mode                                   |
| `pnpm run test:axe`                 | Run accessibility tests                                             |
| `pnpm run test:bench:code-textarea` | Measure native textarea edit and highlighting latency               |
| `pnpm run test:bench`               | Run scanner and component benchmarks in Chromium                    |
| `pnpm run test:coverage`            | Run component tests with coverage                                   |
| `pnpm run test:lighthouse`          | Run Lighthouse performance tests                                    |
| `pnpm run ci`                       | Run the full CI pipeline                                            |

## Highlighting sources

- `build/highlight/`: compiler, loaders, adapters, profiles, optimizations, provenance, and grammar inspection.
- `src/internal/highlight/`: shared scanner, registry, category vocabulary, and semantic palette.
- `src/internal/highlight/generated/`: ignored machine data, shared regex fragments, registration modules, and attribution.
- `tests/highlight/`: scanner corpora and checkpoint/edit tests.
- `tests/fixtures/`: shared server-rendering and hydration templates.
- `benchmarks/highlight/`: bundle and native browser measurements.

`build` depends on `build:highlight`. The generator writes only machine data and registration artifacts. Both components import the authored registry and scanner directly. Generated registration modules import that same registry. Build tools never enter the browser dependency graph.

Run generation after editing compiler sources or profiles. The library watcher rebuilds runtime changes; it does not watch the Node grammar compiler.

## Adding a language

1. Inspect the grammar with `mise exec -- node build/highlight/tools/audit.mjs @shikijs/langs/json`, replacing the module with the candidate grammar. Counts describe source definitions, including potentially unreachable rules.
2. Add the canonical language and its external grammar closure in `build/highlight/loaders/`. Add adapters or a profile when needed. Unsupported reachable grammar features must produce a compilation error.
3. Record the source fingerprints and licenses in `build/highlight/provenance/`. Generation checks the installed package version, grammar data, and license texts against these pins.
4. Add the public registration entrypoint, package exports, Vite entry, and component language types. Extend Markdown fence coverage when appropriate.
5. Add semantic samples and nesting/edit cases to `tests/highlight/fixtures/`. Run `test:highlight`, the component tests, and representative visual tests.
6. Check the emitted manifest, bundle report, and representative browser benchmarks. Compare complete language closures and the total system; individual grammar sizes do not measure the same capabilities as Highlight.js modules.

Keep category IDs stable because generated machines serialize them. Scope classification belongs in the compiler; the browser uses category indexes. New syntax should first use existing scanner transitions or compiler transformations. A new runtime operation needs corpus and checkpoint/edit coverage.

## Measurements

Build first, then run these commands from this project:

```shell
mise exec -- node benchmarks/highlight/bundle-size.mjs
mise exec -- node benchmarks/highlight/measure-built-component.mjs 3
mise exec -- node benchmarks/highlight/measure-code-textarea.mjs 3
mise exec -- pnpm run test:bench
```

The bundle report measures the scanner, each supported language closure, all languages together, and each component alone and together. It reports minified, gzip, and Brotli sizes with Lit and core external.

The component probe uses bundled Chromium and measures emitted consumer code, repeated updates, native memory, and cleanup. Its update timings exclude forced layout and paint. The textarea probe enables native value ranges, reports registration and paint opportunities separately, and uses the configured browser channel. The scanner benchmarks cover fresh scanners, repeated scans, and incremental edits over deterministic corpora.

Run browser measurements separately from other browser tasks. Compare at least three runs on the same browser and machine; timing and memory samples are diagnostic rather than CI thresholds.

## Browser validation

Playwright 1.63 supplies Chromium 153. The normal unit and visual configurations enable the experimental `OpaqueRange` feature. The bundled browser supports native multiline painting, so CI and local validation use the same pinned browser:

```shell
mise exec -- pnpm run test:coverage
mise exec -- pnpm run test:axe
mise exec -- pnpm run test:ssr
mise exec -- pnpm run test:visual
mise exec -- pnpm run test:lighthouse
mise exec -- pnpm run test:highlight
```

Component unit tests cover range ownership, value changes, incremental edits, native undo/redo, clipboard paste, IME composition, selection, scroll position, and API fallback. Codeblock utility tests cover text-node offsets, copied source, batched line geometry, and its compatibility fallback. The scanner corpus covers the complete language matrix; browser tests use representative nested and embedded language cases.

SSR tests cover server output and codeblock hydration without replacing the server code node. Visual tests capture representative syntax coloring in both themes, including native textarea painting. Accessibility tests verify form controls and keep codeblock line decorations outside the accessibility tree and tab order.

The library build, `publint`, bundle smoke tests, and Lighthouse requests check emitted package entrypoints and language loading. Strict external declaration compilation was part of migration validation; it doesn't require a separate ongoing consumer test project.

Set `NVE_TEST_BROWSER_CHANNEL=chrome` to diagnose behavior in an installed Chrome independently of the pinned browser. Run benchmarks separately from correctness tests.
