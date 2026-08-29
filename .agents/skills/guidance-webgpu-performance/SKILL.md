---
name: guidance-webgpu-performance
description: Diagnose and improve browser WebGPU rendering performance, including frame pacing, draw and state-submission overhead, buffer uploads, shaders, and JavaScript work on the render critical path. Use for slow or stuttering GPU-backed interfaces, rendering regressions, CPU/GPU bottleneck analysis, or renderer performance changes; do not use for general page-load or build performance without a rendering symptom.
---

# Optimize WebGPU Performance

Find the limiting resource before changing the renderer. Produce a reproducible diagnosis that separates JavaScript preparation, browser/API submission, data transfer, and GPU execution, then make only changes supported by measurements.

## Required context

1. Read the repository `AGENTS.md` and the affected project's `DEVELOPMENT.md`.
2. Inspect the render loop, update path, buffer and texture ownership, shader code, and resource lifecycle involved in the representative workload.
3. Before adding or changing a benchmark, inspect the affected package's `package.json`, local Vitest benchmark configuration, existing `*.test.bench.ts` files, and any shared configuration they import. Do not assume another project's harness applies unchanged.
4. Read [the performance diagnostic playbook](references/performance-diagnostics.md) when classifying a bottleneck, selecting instrumentation, or proposing an optimization.

## Establish the performance question

Define the workload and target before measuring:

- Separate initialization, steady rendering, interactive updates, streaming updates, picking/readback, and cleanup. Do not combine them into one unexplained metric.
- Record object and primitive counts, update frequency and size, draw/pass counts, canvas pixel dimensions, device-pixel ratio, transparency, anti-aliasing, and relevant renderer settings.
- Choose the user-visible metric: frame budget and tail latency, update latency, throughput, startup time, or memory. FPS alone can hide missed frames behind the display's refresh-rate ceiling.
- Preserve correctness and representative visual output. A faster result that omits required work is not an optimization.
- Inspect `git status --short` and preserve unrelated changes. Record when measurements include a dirty worktree.

## Classify before optimizing

Use independent CPU and GPU evidence plus controlled perturbations. Do not infer a GPU bottleneck from low FPS or a CPU bottleneck from a busy render callback alone.

1. Measure frame intervals and the JavaScript phases that prepare data, update scene state, encode commands, and submit work.
2. Measure GPU pass duration asynchronously when the API and adapter expose timer queries. Treat the absence of timer-query support as a measurement limitation, not as zero GPU cost.
3. Vary one dimension at a time: object or draw count, changed-record count, upload bytes, primitive count, canvas pixels, transparency, or pass count.
4. Use diagnostic toggles that preserve most of the pipeline while removing one class of work. Compare render-disabled, update-frozen, upload-bypassed, reduced-resolution, and reduced-shader-cost cases as applicable.
5. Classify the evidence as JavaScript/GC, API submission or state churn, transfer/synchronization, vertex/geometry, fragment/fill, shader compilation, resource allocation, or mixed/unknown.

If the evidence remains ambiguous, propose the smallest next experiment instead of recommending a large rewrite.

## Use repository CPU benchmarks correctly

Discover the affected project's `test:bench` script, benchmark config, and `*.test.bench.ts` files before extending them. The repository's shared Vitest library benchmark configuration recognizes `src/**/*.test.bench.ts`, but the package's local config and `DEVELOPMENT.md` determine how to run it and what environment it uses.

Treat an ordinary Vitest benchmark as a CPU microbenchmark unless its configured environment and measured callback show otherwise. Timing data generation, validation, packing, dirty-range handling, or calls that prepare upload bytes does not measure `GPUQueue.writeBuffer`, command execution, shaders, presentation, or frame pacing.

Follow the affected package's established patterns:

- Preserve its benchmark options so baseline and candidate results remain comparable. If the package has no precedent, choose explicit warmup, duration, and iteration settings and document them.
- Create representative typed-array sources outside the timed callback when source creation is not under test.
- Place construction inside the callback only when allocation or initialization is intentionally part of the measurement.
- Compare steady-state reuse with replacement or growth, partial with full commits, and ordinary with worst-case data when those paths differ.
- Use scaling series such as record count, changed percentage, and consumer fan-out to identify complexity and crossover points.
- Consume results or state transitions so the benchmark exercises the measured path.
- Name benchmarks with the workload size and operation. Add a paired reference when the result is otherwise difficult to interpret.

Run commands from the affected project through mise and only when its `DEVELOPMENT.md` defines the script:

```shell
mise exec -- pnpm run test:bench
mise exec -- pnpm run test:bench -- --outputJson=benchmark.json
mise exec -- pnpm run test:bench -- --compare=benchmark.json
```

Keep baseline and candidate environment, workload, benchmark options, and worktree state comparable. Use browser instrumentation for any claim about GPU execution or end-to-end rendering.

## Select evidence-backed changes

Prefer reducing repeated work on the confirmed limiting path:

- For JavaScript cost, look for per-frame allocation, repeated conversion or validation, matrix and bounds work, duplicate fan-out, cache invalidation, and avoidable DOM/reactive work.
- For submission cost, reduce redundant state changes and API crossings; batch compatible draws or use instancing when the workload has enough repeated geometry to justify it.
- For upload cost, reuse capacity, merge dirty ranges, batch compatible uploads, separate data by update frequency, and avoid creating upload views or typed arrays in hot loops.
- For GPU cost, test culling, level of detail, overdraw and transparency, render resolution, attachment formats, anti-aliasing, texture sampling, and shader work according to the measured scaling behavior.
- For initialization cost, reuse pipelines and resources, avoid duplicate compilation, and consider creation-time mapping only for static data.

Treat advanced staging rings, indirect drawing, shader or compute rewrites, data-layout changes, and WebAssembly as experiments with added complexity. Require evidence that a simpler change cannot meet the target.

Also inspect bind-group and pipeline reuse, write frequency, buffer-offset alignment, command/pass structure, shader compilation, texture and attachment churn, and asynchronous mapping or readback behavior.

## Verify and report

When the user asks only for diagnosis, report findings without changing code. When the user asks for an improvement, implement the smallest supported change and verify:

1. the targeted baseline/candidate measurement under the same conditions;
2. an integration measurement that exercises the real browser renderer when the claim extends beyond CPU preparation;
3. relevant correctness, visual, and project tests from `DEVELOPMENT.md`;
4. memory, variance, and another workload size when the change can trade one regime for another.

Report the workload, environment, measurements and spread, bottleneck classification, evidence, change or recommendation, confidence, and remaining uncertainty. State explicitly whether each result is a CPU microbenchmark, JavaScript frame measurement, GPU timer result, or end-to-end observation.
