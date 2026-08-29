# Browser GPU performance diagnostic playbook

Use this reference to choose measurements and optimizations after defining a representative workload. Select only the checks relevant to the suspected bottleneck.

## Separate the timelines

More than one timeline can limit a frame:

1. Application JavaScript updates state and prepares typed data.
2. JavaScript calls WebGPU to upload resources and encode or submit commands.
3. The browser and driver validate, translate, and schedule commands.
4. The GPU executes vertex, fragment, compute, copy, and presentation work.
5. Readback, queries, or resource reuse can force those timelines to synchronize.

Without awaiting a WebGPU completion promise, wall-clock time around a render function measures CPU-side work in steps 1 and 2, not completed GPU execution. If the function awaits `GPUBuffer.mapAsync()` or `GPUQueue.onSubmittedWorkDone()`, it also includes synchronization waits. GPU timers cover scheduled GPU work, but not all JavaScript or browser overhead. Frame intervals include both pipelines plus scheduling and display cadence. Use at least two perspectives before assigning a bottleneck.

## Instrument without adding a stall

### JavaScript and frame pacing

- Use `performance.now()` around stable phases such as scene update, culling, packing, upload calls, command encoding, and submission. Avoid timers inside every object iteration because instrumentation overhead can dominate small operations.
- Inspect the browser performance profile for long tasks, garbage collection, repeated allocation, style or layout, event handlers, and gaps between animation frames.
- Track frame intervals and useful percentiles. Also report missed-frame counts against the intended frame budget. Do not use a vsync-capped FPS average as the only metric.
- Warm up shader, JIT, and cache paths before measuring steady state. Measure startup separately when it matters.

### WebGPU GPU timing

- Request the optional `timestamp-query` feature only when the adapter exposes it.
- Place timestamps around the pass or command region to investigate, resolve queries, and read results after later frames so the render loop does not wait for the GPU.
- Reuse query, resolve, and readback resources when practical. Keep validation and error-scope diagnostics out of the production hot path.
- Do not put `queue.onSubmittedWorkDone()` in every frame to estimate GPU time. It observes queue completion and can serialize work; use it only for an intentional out-of-band boundary.

## Interpret controlled perturbations

| Observation                                                 | Likely limiting path                                                   | Next discriminating experiment                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| JavaScript time is high while GPU time is low               | data preparation, scene traversal, allocation/GC, or API submission    | freeze updates, bypass packing, then vary draw calls independently                            |
| JavaScript time rises mainly with draw count                | command encoding, state changes, driver/API crossings                  | batch compatible draws, reuse state, or test instancing                                       |
| Time rises mainly with changed records or uploaded bytes    | conversion, dirty-range handling, upload calls, or transfer bandwidth  | compare partial/full commits and one batched upload with equal bytes                          |
| GPU time falls strongly with canvas pixel count             | fragment shading, overdraw, blending, attachments, or bandwidth        | reduce fragment work, transparency, attachment cost, or render scale one at a time            |
| GPU time follows vertex or primitive count more than pixels | vertex shading, topology, geometry bandwidth, or raster setup          | simplify geometry, cull, add level of detail, or test instancing                              |
| Intermittent spikes align with GC or allocation             | temporary arrays, objects, closures, resource creation, or cache churn | reuse scratch storage and move stable creation out of the frame                               |
| First frames are slow but steady state is healthy           | pipeline/shader compilation, uploads, or resource initialization       | profile initialization and warmup separately; reuse or compile asynchronously where supported |
| Readback or query frames stall                              | forced CPU/GPU synchronization                                         | defer and ring-buffer results; use `GPUBuffer.mapAsync()` for readback completion             |

These are hypotheses, not proof. Mixed bottlenecks can shift after the first optimization.

## Inspect the JavaScript critical path

Look for work multiplied by object, layer, or frame count:

- typed-array or `DataView` construction, `subarray` views, array literals, closures, iterator objects, and temporary matrices;
- repeated data normalization, geometry validation, transparency classification, bounds computation, serialization, or coordinate conversion;
- replacing buffers that have sufficient capacity, copying identical source data across layers, or preparing the same source more than once;
- scanning a full data set for a small update, emitting many disjoint dirty ranges, or uploading inside loops;
- repeated bind-group, pipeline, attachment, texture-view, or resource creation;
- DOM queries, layout reads, style changes, Lit updates, and event work interleaved with animation-frame preparation;
- promise chaining, readback, or query polling that delays the next frame.

Cache or reuse only when ownership and invalidation remain correct. A stale or over-broad cache can trade speed for incorrect rendering or excessive memory.

## WebGPU optimization candidates

Select candidates based on the measured path:

- Map static vertex or index buffers at creation when they do not need later queue writes. This only targets initialization.
- Pack compatible attributes and interleave vertex data when it reduces buffer bindings and improves access locality.
- Separate global, material, and per-object data so each class updates at its actual frequency.
- Batch per-object uniform data into larger writes and use aligned offsets. Respect `minUniformBufferOffsetAlignment` and device limits.
- Merge adjacent or overlapping dirty ranges. Compare fewer larger writes against excess bytes rather than assuming either extreme wins.
- Reuse buffer capacity, bind groups, pipelines, samplers, texture views, query sets, and scratch typed arrays. Do not reuse single-use `GPUCommandEncoder` or `GPUCommandBuffer` instances.
- Use instancing for sufficiently repeated geometry. Keep a direct path when grouping overhead outweighs saved draws.
- Use mapped staging buffers as a pool or ring only when upload copies materially affect performance. Never wait for mapping inside the frame; remap resources asynchronously after submission.
- Resize canvas and depth/color attachments only when their pixel dimensions change.
- Consider indirect drawing, GPU culling, or compute preparation only when object-scale CPU submission is the demonstrated limit.

## Use repository Vitest benchmarks as CPU evidence

Discover benchmark support in the affected package rather than routing every investigation through one project:

- Read the package's `DEVELOPMENT.md`, `package.json`, local Vitest benchmark config, and existing `*.test.bench.ts` files.
- Follow any imported repository configuration, such as the shared library benchmark include for `src/**/*.test.bench.ts`.
- Preserve local benchmark options and fixture conventions so comparisons stay compatible.
- Add the benchmark beside the code under test or to the package's established benchmark entry point.
- Keep expensive fixture creation outside the callback unless initialization is the target.

Choose experiment axes that match the code path. Useful comparisons include small-to-large inputs, incremental-to-full updates, cold creation-to-steady reuse, one-to-many consumers, ordinary-to-worst-case data, and ergonomic-to-direct encoding. Add browser-side evidence for queue uploads, render passes, shaders, rasterization, presentation, or interaction.

## Design a credible comparison

- Keep browser version, GPU and driver, operating system, power mode, display refresh, canvas pixels, workload, and visibility state fixed.
- Run baseline and candidate close together and repeat enough samples to expose variance or thermal drift. Prefer distributions and medians over a single best run.
- Change one performance variable at a time where practical.
- Include workloads below, near, and above the suspected crossover, extending far enough beyond it to amortize setup, memory, or grouping costs.
- Check output equivalence with the relevant unit and visual tests. Measure memory when pooling, caching, batching, or duplicating buffers.
- Do not add overlapping CPU phase timings and GPU pass timings as though they were sequential; browser and GPU work can overlap.
- Do not translate an isolated microbenchmark percentage directly into expected end-to-end frame improvement.

## Source basis

- [WebGPU Speed and Optimization](https://webgpufundamentals.org/webgpu/lessons/webgpu-optimization.html) explains measurement of JavaScript and GPU work, vertex packing, data separation by update frequency, large aligned uniform buffers, mapped staging buffers, and additional advanced options.
