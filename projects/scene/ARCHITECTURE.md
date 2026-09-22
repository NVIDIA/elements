# Scene Architecture

This document defines the architectural boundaries for `@nvidia-elements/scene`. Use it when proposing, designing,
reviewing, or implementing Scene features. It describes the responsibilities that belong in Scene, the constraints
that preserve its API and performance characteristics, and the responsibilities that must remain in applications or
integration layers.

Scene is a curated spatial visualization library. Scene is not an application framework, data transport, simulation
engine, or general-purpose visualization system.

## Mission

Scene renders coherent, application-supplied spatial snapshots with WebGPU-backed Web Components. It provides stable
declarative structure for scenes and packed data paths for geometry that changes frequently.

Scene supports operator-facing robotics and spatial-monitoring interfaces. Its useful domain includes robots,
facilities, transforms, telemetry, perception output, routes, surfaces, and spatial annotations. A capability belongs
in Scene when it directly represents or interacts with spatial content and can consume a bounded, source-agnostic
snapshot.

The application remains the authority for what the current snapshot means. Scene renders the state captured at its
render boundary, but it does not establish coherence across independent property assignments.

## System boundary

The data flow has five boundaries:

```text
application snapshot
  -> Scene sources and Web Component state
  -> renderer snapshot
  -> prepared GPU resources
  -> WebGPU passes and presentation
```

Each boundary narrows responsibility. Applications resolve data origin and time before assigning content. Scene
validates spatial inputs, captures renderable state, and owns the corresponding renderer resources. The renderer does
not reach back into application services or data transports.

### Scene responsibilities

Scene owns:

- Web Components that describe stable scene structure.
- Canonical packed layouts and typed source APIs for frequently changing geometry.
- Validation and capture of scene-local values at documented ownership boundaries.
- Scene-local frame composition and camera projection.
- Spatial primitives, meshes, surfaces, vector labels, and annotations.
- Renderer snapshots that pair content with transforms, topology, units, and interaction configuration.
- WebGPU resource creation, reuse, uploads, render passes, picking, cleanup, and device recovery.
- Local diagnostics for invalid component state and unsupported rendering behavior.
- Deterministic resource checks and workload definitions used to assess performance changes.

### Application and integration responsibilities

Applications and integration layers own:

- Network, file, process-memory, middleware, and device transports.
- Protocol parsing, schema conversion, decompression, and origin-specific decoding.
- Sampling, scheduling, buffering, interpolation, prediction, and time synchronization.
- Replay, persistence, history, timeline control, and selection of the current snapshot.
- Atomic coordination of transforms, sensor buffers, annotations, and other independent assignments.
- Application workflows, panels, commands, selection models, and non-spatial interface state.
- Mapping domain identifiers to Scene feature identifiers and responding to Scene interaction events.
- Expensive preparation that is specific to an origin, debugger, application, or product workflow.

An integration may use Scene as a geometry presentation lens. It must resolve expressions, files, memory, messages,
or recorded data into bounded Scene inputs before crossing the Scene API boundary.

## API architecture

### Use declarative structure for durable relationships

Web Components define stable scene structure, including frames, cameras, layers, and authored markers. This structure
keeps composition compatible with HTML, component lifecycle, accessibility, and framework-independent use.

Do not turn the element tree into a high-frequency transport. Large or frequently changing collections must use the
typed source and publication APIs instead of creating or updating thousands of child elements.

### Use typed sources for high-frequency data

Packed buffers and external sources describe data through canonical layouts. A layer accepts only compatible source
kinds. Explicit capacity, active count, and publication ranges make ownership and update cost observable.

New high-frequency APIs must:

- Use a typed or otherwise unambiguous data representation.
- Define whether Scene borrows, copies, adopts, or shares input storage.
- Separate allocation capacity from the active render count.
- Provide an explicit changed range for partial updates.
- Preserve validated snapshots when more than one layer consumes the same immutable source.
- Keep data-origin concepts out of the source type.

A transport-shaped source, such as a ROS subscription, WebSocket connection, debugger address, or file path, does not
belong in Scene. An adapter must convert that input into a canonical Scene source.

### Keep render configuration with renderable content

The renderer snapshot carries the information needed to interpret data, including spatial transforms, primitive kind,
topology, layout, units, visibility, and interaction configuration. The renderer must not recover this information
from unrelated global application state.

This rule keeps each render item concrete and testable. It also lets different components share rendering machinery
without hiding meaningful differences behind a broad abstraction.

### Keep public APIs focused on observable scene behavior

Public component APIs describe spatial state, appearance, and interaction. Internal resource objects, cache entries,
pipeline state, and device generations must not leak into public elements.

Do not add a public property only to expose an implementation mechanism. Add an API when applications need to control
or observe a stable Scene behavior and when the behavior applies independently of a specific backend or transport.

## Performance architecture

Scene performance depends on bounding work before optimizing individual operations. Every new feature must identify
its input scale, update frequency, preparation cost, GPU resources, and cleanup path.

### Render only on demand

Scene schedules a frame when component state, camera state, renderer readiness, interaction, or size changes. It must
not run an unconditional animation loop. Applications that animate content publish changes at their chosen rate, and
Scene coalesces those changes at the next render boundary.

### Make incremental work proportional to the change

Publication ranges communicate which records changed. CPU validation, snapshot updates, and GPU uploads should scale
with that range or with the newly activated data. They should not routinely scan or upload an entire capacity for a
small change.

Topology changes may require complete preparation because they change how the renderer interprets a source. APIs and
tests must distinguish topology replacement from an attribute-only or record-only update.

### Keep open-ended work bounded

Any operation whose cost can grow with application input must define an appropriate limit. Depending on the feature,
the contract may need byte, record, primitive, glyph, partition, texture-dimension, or pixel limits.

Limits are part of the API contract. Validate them before large allocation or traversal. Do not rely on an allocation
failure, WebGPU validation error, or stalled frame as the effective limit.

### Keep expensive preparation off the frame path

Frame preparation may perform predictable bookkeeping and encode commands. It must not synchronously parse, decode,
traverse, transform, hash, or create an open-ended payload.

When a feature requires expensive preparation, choose one of these boundaries:

- Require the application or adapter to provide prepared, bounded content.
- Prepare the artifact asynchronously and install it only if its renderer and device generation remain current.
- Cache an immutable prepared artifact with every parameter that affects its interpretation.

Never add a synchronous hash of a large source to the render path merely to improve cache reuse.

### Reuse resources with explicit ownership

Scene reuses immutable prepared snapshots and GPU resources when ownership and invalidation rules allow it. Resource
sharing must use scoped leases or explicit reference tracking so a resource remains alive while a renderer uses it.

Replacement follows an ownership sequence: prepare the next generation, install it for the current owner, and then
release the superseded generation. Disconnection, layer removal, resize, device loss, and failed initialization must
all have deterministic cleanup paths.

### Keep asynchronous work generation-safe

Optional rendering systems may load lazily. A completion from an obsolete connection, renderer, or WebGPU device must
not mutate the active generation. Scene must coalesce duplicate pending work, and resource owners must release
obsolete resources even if they never become active.

Picking and other readbacks must remain asynchronous. Do not wait for queue completion in each frame. Interactive
requests may discard stale hover results, but explicitly ordered operations must preserve their documented ordering.

### Require evidence for performance claims

Use the smallest evidence mode that can answer the question:

- Unit tests verify data preparation, range handling, ownership, and cleanup logic.
- Browser benchmarks measure repeatable CPU-side preparation behavior.
- `test:webgpu` verifies deterministic WebGPU calls, upload sizes, pass structure, resource reuse, and cleanup.
- Native WebGPU measurement evaluates frame cadence and application-defined latency on a controlled GPU host.
- Focused diagnostics capture traces or lifecycle evidence for a specific hypothesis.

Software WebGPU resource checks do not predict native GPU performance. JavaScript timing around a render call does not
measure completed GPU execution. Do not describe either result as GPU time.

## Failure and diagnostic architecture

Scene fails closed for data that it knows is invalid. It reports invalid component state through local Scene
diagnostics and keeps unrelated layers usable. Immediate violations of a JavaScript API contract may throw before
Scene stores the value.

Use a whole-scene unavailable state only when Scene cannot render reliably, such as adapter acquisition, canvas
configuration, device loss, or a required renderer failure. The adapter must reject malformed domain messages and
unsupported producer values or report them at the affected Scene boundary instead of presenting a WebGPU outage.

Diagnostics must identify the affected element and provide a stable error code. They must not silently repair data in
a way that changes its meaning. The application decides whether to keep an older snapshot, show stale state, retry,
or replace the source.

## Non-goals

The following capabilities do not belong in Scene.

### Data acquisition and transport

Scene does not open sockets, subscribe to middleware, read logs, poll devices, map process memory, or fetch files. It
does not define ROS, telemetry, debugger, recording, or product-specific message schemas.

### Time, synchronization, and history

Scene does not synchronize independent streams, select timestamps, interpolate transforms, record state, implement
replay, or store a timeline. It does not promise that assignments made separately form one atomic application
snapshot.

### Debugger evaluation

Scene does not parse expressions, resolve symbols, interpret debug information, traverse target memory, manage data
spaces, infer program types, or select among debugger visualization lenses. A debugger may choose Scene as its geometry
lens after an upstream evaluation system has produced prepared spatial content.

### General-purpose visualization

Scene does not provide tables, charts, hexadecimal memory views, text editors, image inspectors, disassembly, pointer
graphs, or a general visualizer plug-in registry. Spatial labels are part of a 3D scene; they do not make Scene a rich
text or document-rendering system.

### Simulation and world modeling

Scene does not provide physics, collision response, path planning, sensor simulation, entity behavior, asset storage,
or a general-purpose game engine. An application may visualize the output of those systems without moving their logic
into Scene.

### Application interface and orchestration

Scene does not own toolbars, inspectors, workflows, commands, application routing, persistence, or framework-specific
state management. Application UI may compose around Scene and respond to its documented events.

### Origin-specific rendering forks

Do not create separate renderers for the same geometry based on whether it came from a file, process, middleware
message, or generated application state. Normalize origin-specific differences before Scene, then reuse the canonical
source and renderer path.

## Feature decision guide

A proposed feature belongs in Scene only when every required answer below is yes:

1. Does the feature directly represent, compose, render, or interact with spatial content?
2. Can it consume a coherent, source-agnostic value without owning transport or application time?
3. Does the proposal document its input ownership, validation boundary, and observable component behavior?
4. Can every open-ended operation use an explicit range or resource limit?
5. Can frequent updates scale with changed or active data instead of total capacity?
6. Can Scene own and deterministically release every GPU or browser resource it creates?
7. Can failures remain local unless the WebGPU device or required renderer is unusable?
8. Can tests verify behavior, accessibility, server rendering, visual output, resource use, or measured performance as
   appropriate?

If a required answer is no, place the feature in an application adapter, domain package, debugger layer, or other
focused library. Do not broaden Scene merely because it already owns a canvas or WebGPU device.

### Features that fit

- A spatial primitive with a canonical bounded layout and deterministic GPU lifetime.
- A scene-local frame, camera, projection, or picking capability.
- A spatial annotation rendered as part of the 3D composition.
- A partial-update path that reduces validation, copying, or GPU uploads without weakening ownership.
- A renderer optimization supported by reproducible resource or performance evidence.

### Features that do not fit

- A WebSocket or ROS client that feeds a layer directly.
- A replay clock, transform-history buffer, or cross-sensor synchronizer.
- A debugger expression evaluator or process-memory reader.
- A dashboard chart, property inspector, or nonspatial table rendered inside the scene.
- A physics engine, robot behavior model, or path planner.
- A format-specific renderer that duplicates an existing canonical geometry path.

## Changing this architecture

Changes to these boundaries require an explicit architecture discussion. A proposal must explain why the capability
cannot live in an application or adapter, how it preserves source independence, which work and resources it bounds,
and how tests enforce the new contract.

Do not justify a scope expansion only through implementation convenience or access to existing renderer internals.
Prefer a small upstream adapter or a focused package when it preserves clearer ownership.

## Related documentation

- [README](README.md) introduces the package and its public usage.
- [Development](DEVELOPMENT.md) lists supported build, test, and performance commands.
- [Scene documentation](https://nvidia.github.io/elements/docs/scene/) documents public components and examples.
