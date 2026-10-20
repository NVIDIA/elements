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
- Spatial primitives, meshes, surfaces, camera-facing SDF text labels, and annotations.
- Bounded body geometry file loading through lazy, extension-dispatched decoders.
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

An integration may use Scene as a geometry presentation lens. It must resolve expressions, memory, messages,
or recorded data into bounded Scene inputs before crossing the Scene API boundary. The mesh geometry loader is a
narrow exception: `nve-scene-mesh.src` fetches bounded geometry files and decodes them into the same triangle arrays that
applications assign through `nve-scene-mesh.geometry`; this adds no alternate renderer. The concept element carries
`src`. A file format is a lazily loaded decoder selected by extension, never a per-format element. Scene ships an
ASCII and binary STL decoder. Applications own texture fetching and playback.

A model is a whole entity made of bodies connected by joints. A body owns a coordinate frame and one rigid
compound of shapes, corresponding to a link in URDF. A shape is one inert primitive or mesh inside a body.
A coordinate frame defines a rigid origin and orientation; a joint connects explicit parent and child bodies. These concepts do not own transport, time, history, interpolation,
or description decoding.

## Non-goals

The following capabilities do not belong in Scene.

### Data acquisition and transport

Scene does not open sockets, subscribe to middleware, read logs, poll devices, or map process memory. It does not
define ROS, telemetry, debugger, recording, or product-specific message schemas. The body geometry loader
can fetch geometry files on demand through isolated decoders, with cancellation, bounded file sizes, and bounded decoded allocations. It does
not load recordings, decode joint descriptions, or own application replay. Parsing and body compilation remain
outside render callbacks, and file changes never allow an older request to publish over a newer input.

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
