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
or recorded data into bounded Scene inputs before crossing the Scene API boundary. The body geometry loader is a
narrow exception: `nve-scene-body.src` fetches bounded geometry files and decodes them into the same nodes that
applications assign through `nve-scene-body.geometry`; this adds no alternate renderer. The concept element carries
`src`. A file format is a lazily loaded decoder selected by extension, never a per-format element. Scene ships an
ASCII and binary STL decoder. Applications own texture fetching and playback.

A model is a whole entity made of bodies connected by joints. A body is one rigid compound of shapes, and a shape
is one inert primitive or mesh inside a body. A coordinate frame defines a rigid origin and orientation; a joint
specializes a frame with one degree of freedom. These concepts do not own transport, time, history, interpolation,
or description decoding.

## Internal source organization

Every file in `src/internal/` belongs to a directory that names its responsibility.

| Directory      | Responsibility                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `composition/` | Scene discovery, scoped names, frame and joint composition, model tint, camera state, and notifications.             |
| `layers/`      | Layer sources, state, validation, and rendering specific to each content type.                                       |
| `records/`     | Packed record storage, mutable buffers, publication, canonical layouts, and record encoding.                         |
| `algorithms/`  | Reusable algorithms over plain data, independent of geometry, color, record layouts, and GPU resources.              |
| `structures/`  | Reusable bit arrays, numeric ring buffers, range sets and maps, copy-on-write bytes, flag indexes, and bounds trees. |
| `interaction/` | Feature identities, pointer requests, routed events, and the scene interaction source.                               |
| `rendering/`   | Render items, shared render passes, targets, preparation, and GPU picking.                                           |
| `gpu/`         | The platform boundary, device recovery, storage limits, buffer leases, and upload ranges.                            |
| `math/`        | Spatial numeric types, matrices, quaternions, geometric algorithms, and primitive tessellation.                      |
| `color/`       | Color types, CSS color parsing, normalized RGBA storage, RGBA8 encoding, transfer functions, and tint modulation.    |
| `dom/`         | Host styles, attribute converters, and DOM viewport measurements for Web Components.                                 |
| `diagnostics/` | Error codes and diagnostic episode reporting.                                                                        |
| `testing/`     | Platform overrides and frame lookup for tests.                                                                       |

`layers/body/` owns body geometry capture, primitive compilation, bounded file requests, and the geometry decoder
registry in `decoders.ts`. Its extension table contains dynamic imports; format implementations, including `decoders/stl.ts`,
stay outside the base body bundle. Each decoder module has its own size budget. Import-boundary lint rejects
static decoder imports.
`composition/frame/` owns the named registry, resolved transform graph, and chain validity.
`composition/joint/` owns motion capture and synchronous one-level mimic dependencies.
`composition/model/` owns inherited body tint; the model element owns its scoped joint view.

Keep tests and benchmarks beside their implementation. Keep layer-specific pipelines and resources with their layer;
shared pass orchestration belongs in `rendering/`. Label font preparation belongs in `layers/labels/font/`.
The adapters in `layers/sources/` connect packed sources to layer-specific validation and prepared snapshots.

Keep structures independent of layer policies, record layouts, DOM elements, and GPU resources. Record range
validation belongs in `records/`; marker bounds decoding belongs in `layers/markers/`.

General algorithms can depend on `structures/`; structures do not depend on `algorithms/`. Shared representations and
validation, such as `RangeInterval`, stay in `structures/`. Spatial algorithms belong in `math/`, and color computations
belong in `color/`.

`rgba.ts` captures and compares normalized RGBA tuples with separate color and alpha channels. `rgba8.ts` owns red, green, blue,
and alpha bytes: finite channels clamp to [0, 1], quantization rounds half upward, and decoding applies no color-space
transfer. Its shared WGSL decoder reads little-endian packed words for packed records, labels, and scalar grids.
Checked Scene color APIs reject out-of-range channels before writing; layout writers retain their finite-value
clamping policy and diagnostics. `PreparedRGBAModulation` captures a tint once, multiplies RGB in linear light,
returns RGB to the renderer's sRGB convention, and multiplies alpha directly. Its repeated writes use caller-owned
spans without allocating color tuples. Layer defaults, record offsets, and transparency classification stay with callers.

`color/alpha.ts` classifies normalized float and byte alpha without quantization or color transfer. `AlphaSummary`
counts zero, partial, and opaque channels over checked spans with an offset and stride. Summaries merge by addition;
span replacement subtracts the previous contribution and adds the next. Mesh, body, and heightfield layers capture summaries with their
owned color arrays. Accepted mesh color publications update only the selected span after geometry validation; rejected
and empty publications preserve the counts. Render snapshots combine these counts with layer tint and texture policy
without scanning color arrays. Mesh publication still copies the complete published attribute and validates complete
geometry. Packed marker and vertex layers retain their flag prefix indexes and active-count policies.

`math/polyline.ts` owns shared WGSL geometry for screen-space and frame-local line joins. It defines segment direction
tolerances, turn detection, adjacent normal handling, averaged miter widths, and bevel fallback. The miter limit
also bounds world-space joins during scene fitting. Color and picking passes use the same kernel. Rendering owns
projection, topology, units, dash suppression, and feature identities. Miters use two triangles to fill the corner;
bevels suppress the second triangle to avoid overlapping translucent fragments. The kernel and draw submission
share the join vertex count. Numeric tests execute the kernel through GPU readback against geometric fixtures.

Flag prefix indexes use trees of block counts for all-record and even-record queries. Single-record edits update
the trees eagerly; bulk scans accumulate signed deltas per 256-record block until a query or clone. The index
selects sparse tree updates or linear rebuilding of affected channels from the number of changed blocks. Dense
updates recover block counts from the trees without scanning record flags again. Reset and initialization discard
pending deltas, and clones own independent flags and trees. Marker and vertex layers own record validation and
flag meanings; the index owns batching and prefix aggregation.

`GenerationTasks` owns one pending task per key. Each handle moves once from pending to completed, failed, cancelled,
or superseded. Reusing an input creates a new handle; obsolete success and failure callbacks cannot release a newer
task's key. Cancellation and owner removal invalidate handles before their next scheduling checkpoint. Completed
handles release the key before render notifications, and settled handles release their registry callback. Mesh,
grid, and label renderers use these handles with the preparation runner. Layers own input equivalence, GPU
publication, and candidate cleanup. Returning to installed data cancels pending work for another source while keeping
the installed resources drawable. Renderer disconnection cancels all pending handles.

Marker bounds use a numeric segment tree over 256-record blocks. The marker layer owns visibility, decoding,
and rebuilding changed blocks; the tree owns numeric unions and prefix aggregation. It batches ancestor updates
until the next query and clones independently with prepared snapshots. The tree uses twice the numeric storage
of the block summaries, while the marker layer retains its version-and-count query cache and trailing-record scan.

Frustum culling uses the pure `classifyAabbFrustum` math kernel and shared `AabbBounds` and `FrustumRelation` types.
The kernel applies six half-space tests to a local box using a validated local-to-clip matrix at JavaScript precision.
It follows WebGPU depth bounds from zero to the clip-space w coordinate, includes touching boundaries, computes
box center and extents once, and stops at the first rejecting plane. The intersecting result identifies a conservative
candidate; passing all planes does not establish an exact box/frustum intersection.
`MarkerBoundsClassifier` owns its reusable Float64 matrix and the marker policies for unknown and empty bounds.
The renderer consumes the shared relation type to select marker culling and compaction work.
`math/frustum.ts` owns one ordered plane definition for CPU classification and the generated `FRUSTUM_WGSL` sphere tests.
Both use strict support-interval rejection through the same half-space rule; touching remains a candidate without
normalization or a tolerance. Box support uses absolute coefficient-weighted extents, while sphere support uses radius
times plane-normal length. CPU calculations retain JavaScript precision; shader calculations retain float32 precision.
Marker compaction owns record decoding, its enclosing-sphere radius, alpha routing, and dispatch policy.

`PreparedAffineTransform` captures finite affine matrix coefficients at JavaScript precision and writes positions
directly into caller-owned coordinate spans. Singular transforms remain valid for positions. `PreparedAffineGeometryTransform`
adds a captured inverse transpose through the existing pivoted matrix inverse and classifies reflections using scaled
columns. Geometry preparation requires a finite inverse and gives zero normals the existing positive Z fallback.
Prepared transforms retain independent coefficients; repeated writes allocate no vectors and round only into destination
storage. Body compilation prepares one transform per shape or mesh piece; bounds queries prepare one per position layer.
Callers own source validation, record decoding, output storage, winding, and diagnostics. General matrix operations
remain in `math/mat4.ts`; box bounds retain the perspective path for non-affine matrices.

`math/projection.ts` owns optical-camera view matrices, perspective and orthographic WebGPU projection matrices,
point projection, unprojection, and unit rays from the near plane. Viewport conversions use continuous coordinates
from the top left and preserve zero-to-one depth. Calculations retain JavaScript precision and Float64 matrices.
Forward projection requires finite clip coordinates and positive w; offscreen results remain available for visibility
classification. Ray unprojection requires finite results and absolute w of at least `Number.EPSILON`. Depth-sample
reconstruction selects an explicit policy that divides by any nonzero w and retains undivided coordinates at zero w.
Scene queries own submitted-frame selection, DOM offsets, viewport containment, and frozen results. Picking owns
device-pixel selection and the half-pixel center offset. Camera composition retains state validation, behavior
resolution, and navigation policy.

`MeshAssembly` in `math/mesh-assembly.ts` plans and joins checked geometry into independent planar attribute arrays.
Attribute spans count numeric elements and support interleaved or planar storage; zero strides broadcast constant
attributes. Planning checks span boundaries and reports vertex, index, and byte counts without reading vertex values
or allocating output arrays. Body compilers check their allocation limits before assembly. The shared writer applies
affine position and inverse-transpose normal transforms, adjusts triangle indices, and reverses winding for reflected
shapes. Its loops allocate no objects per vertex or triangle. Optional UV output keeps missing coordinates at zero.
Callers choose direct color copies or prepared linear-light modulation and supply their position-overflow error policy.
The primitive compiler retains its cached tessellations and constant colors; body geometry retains hierarchy validation,
generated attributes, and its finite Float32 position limit. Source arrays and assembled results own independent storage.

`extendAffineBounds` in `math/bounds.ts` extends caller-owned minimum and maximum tuples with an affine box.
It selects extrema from both endpoint products on each axis and adds terms in point-transform order. Each box
uses 18 coefficient multiplications and no temporary storage. This preserves corner results without midpoint or
extent arithmetic, including extreme finite coordinates, shear, reflection, and singular transforms. The kernel
captures source endpoints before writing, supports aliases with distinct destination tuples, and rejects invalid
matrices and overflowing bounds. Upper zero bounds follow point accumulation's positive-zero convention.
`BoundsAccumulator.includeBox` uses this kernel for affine transforms and corner projection for perspective transforms.

`PreparedGridSampler` in `math/grid-sampling.ts` captures dimensions, spacing, and origin from a checked `UniformScalarGrid`
while borrowing its sample storage. It owns bilinear and triangle interpolation, analytic surface normals, inclination,
and batch height writes into caller-owned coordinate storage. Scalar height and slope queries and batch writes allocate no
temporary objects per point. Coordinate division, interpolation order, inclusive outer edges, triangle diagonal ties,
and normal signed zeros follow the existing heightfield queries. Finite-difference shading normals remain in
`math/grid-gradient.ts`. Heightfield layers validate and capture producer grids, retain one sampler per captured grid,
and discard it when the grid clears or becomes invalid. The layer query adapter owns null-grid behavior and copying
for draping; the numeric batch writer changes only in-bounds z values and rejects storage that overlaps grid samples.

Polygon ear clipping uses `ArrayBackedLinkedList`, an array-backed circular doubly linked list of stable integer indices.
The list owns neighbor links and constant-time removal. The polygon compiler owns traversal order, hole bridges,
geometric checks, and fill verification. `RectangleIndex` owns a packed hierarchy of inclusive numeric bounds with
stable source indices, replacement, removal, and early termination of overlap queries. It copies bounds in input
order, uses 64 bytes per slot, builds in linear time, and updates ancestors in logarithmic time. Overlap queries
can still visit every slot when bounds overlap; input order affects spatial locality and pruning.

`RingQuery` uses edge bounds to select candidates for ring validation and repeated point classification.
Point classification queries a full horizontal strip, then applies the existing boundary and ray predicates.
`PolygonFillQuery` shares those ring indices across diagonal checks and final triangle verification.
Ear clipping maintains separate point and outgoing-edge indices, removes clipped slots, and replaces the previous
vertex's outgoing edge after every removal. Duplicate bridge coordinates keep separate stable indices.
These indices select candidates; geometry predicates and list traversal still determine triangle order and fill.
Rings and bridged boundaries below 128 vertices use direct scans to avoid index construction overhead.
Hole bridging keeps its linear ray scan. All indices live within one synchronous polygon compilation.

Attributes and topology in `layers/heightfield`, label metrics and glyph bytes, and generated mesh attributes each use one bounded
traversal for synchronous creation and asynchronous preparation. The runners in `rendering/preparation` consume those
traversals. Algorithms allocate inside their first step, yield after bounded work, and return their result on completion.
The asynchronous runner yields before the first step, checks cancellation after each yield and at completion, and closes
cancelled traversals. `resumePreparation` continues compound tasks after their initial yield. The kernels for grids, glyphs, and
nonindexed meshes write whole ranges between yields so scheduling adds no per-element checks; synchronous callers
select one complete range. Label traversals bound UTF-16 spans without splitting surrogate pairs, count empty labels as
work units, and keep their cursors across chunks. Label width storage
preserves the existing number precision for synchronous callers and float32 rounding for asynchronous callers.
Synchronous indexed mesh processing keeps its local traversal loop to preserve the existing hot path.
Its asynchronous path uses the shared runner and the same traversal.

Indexed meshes with generated flat normals keep a `CompressedAdjacencyIndex` in compressed sparse row form.
The index maps source vertices to expanded triangle corners; the mesh layer owns attribute expansion, normal generation,
and upload planning. Stable topology reuses the index. Position publications update their corners and affected triangles;
color and UV publications keep existing positions and normals.

`VersionedRangeJournal` owns a covered numeric version window and its conservative byte-range union. It distinguishes
known empty updates from missing history, caches immutable snapshots, and periodically compacts repeated edits. Its
storage tracks changed spans rather than retaining an event for every publication. Queries within the window can return
extra ranges from earlier covered versions; consumers outside the window require a full refresh.
Normalized snapshots merge in a linear traversal; other inputs use `RangeSet` normalization.

Mesh attributes keep these windows through cancelled preparations. Topology changes invalidate their history, and
missing generations trigger a complete attribute rebuild and upload. The mesh layer owns attribute versions and topology
policy; the journal owns numeric continuity and range unions. Empty publications preserve continuity and can reuse
expanded attributes without GPU writes. Preparation copies changed output arrays before editing and uses the same bounded
traversal as synchronous processing. Publication still copies and validates complete source geometry. GPU uploads use the
shared buffer upload planner to coalesce expanded ranges into at most 64 writes per attribute.

`RangeMap` stores sorted integer ranges without overlaps and provides point lookup. Picking uses these snapshots to map GPU
IDs to layer metadata. Submitted readbacks keep their original map when a later frame changes the ID assignments.

`ByteTransferIndex` owns numeric source spans, destination identifiers, and destination offsets. Queries clip and translate
every intersecting span in its original order, preserving duplicated boundary records and wrapped connected-line storage.
A balanced interval tree stores the maximum endpoint of each subtree to skip unrelated spans. Small plans and complete
transfers use linear traversal; reordered matches keep their original write precedence. Shared GPU buffer entries build
and cache the index on their first partitioned update, then keep it across leases and snapshot reassignment. The GPU owner
clips updates to active source bytes and keeps a direct path for one contiguous allocation. Mesh instances use the same
buffer owner. Planar mesh attributes keep direct uploads with the shared planner's write budget.

`partitionSequence` in `algorithms/sequence-partitioning.ts` assigns an integer prefix to bounded windows with context
before and after each owned range. Context clamps at source boundaries or wraps, while ownership never overlaps.
Scalar callbacks avoid temporary partition objects. Range mapping writes caller-defined ranges in destination order.
Callers check input bounds once before traversing. The algorithm retains no complete plan. Context counts cannot exceed
the source length, so each window needs at most three source spans. Connected lines use one context record on each
side; strips reserve the final endpoint, and loops wrap both ends. Rendering owns segment and join identities, byte
conversion, device limits, allocation keys, and the complete-buffer path. Shared instance storage owns actual transfers.

`planBufferUploads` owns byte-range selection without owning source snapshots or GPU resources. It clips ranges to
available bytes, aligns writes to four bytes, and merges overlaps and adjacency through `RangeSet`. A configurable
write cost merges clean gaps when their byte cost is no greater than the saved call cost. `coalesceRanges` in `algorithms/`
owns this numeric optimization for sorted intervals without overlaps. It minimizes covered length plus range count times
overhead within a range budget. When the initial plan exceeds the budget, it merges the smallest remaining gaps; equal
gaps merge in source order. When the budget requires additional merges, selection retains the smaller set of gaps to
merge or keep in a `BoundedHeap`. For m ranges after cost-based merging and budget b, k is min(m - b, b - 1).
Selection uses O(k) storage and planning takes O(n log(k + 1)) time, including sorting the selected indices into source
order. A one-range budget uses a direct merge. Other plans take linear time.
The GPU planner retains alignment, clipping, and validation and applies the numeric optimizer before partition mapping.
Partition mapping can increase actual transferred bytes and GPU write count by duplicating boundary records or splitting
ranges. Consumers use zero call overhead by default to preserve clean gaps. The planner reuses normalized inputs and
leaves other inputs unchanged. Shared instance storage plans source ranges before partition mapping; labels and planar
mesh attributes use the same planner. Partition mapping owns duplicated boundary records, wrapped storage, and destination
limits.

`BoundedHeap` in `structures/` retains the smallest values under a caller-defined order. Its greatest retained value
occupies the root, so a rejected addition takes constant time. Accepted additions take O(log(k + 1)) time for capacity k.
Storage grows with retained values; construction does not allocate the full capacity. Draining transfers the values in
heap order without copying and resets the heap. Callers keep comparison keys stable and supply any required tie order.
Range coalescing stores gap indices and compares their sizes and source positions, avoiding one object per input gap.

Performance examples embed local copies of `Float64RingBuffer` for bounded numeric sample windows. Each diagnostic
script contains its helper; the rendering runtime does not collect sample history.

Use direct module imports. These directories identify ownership rather than independent package boundaries.
Public entrypoints re-export the supported API from these owners; internal implementation must not import public
components from the same package.

## API architecture

### Use declarative structure for durable relationships

Web Components define stable scene structure, including frames, cameras, layers, and authored markers. This structure
keeps composition compatible with HTML, component lifecycle, accessibility, and framework-independent use.

Do not turn the element tree into a high-frequency transport. Large or frequently changing collections must use the
typed source and publication APIs instead of creating or updating thousands of child elements.

### Compose coordinate frames through nesting or references

DOM nesting and `frame="name"` establish a coordinate frame's transform parent. An explicit reference replaces
DOM transform ancestry; position, orientation, and explicit poses then use that named frame. Every renderable layer
accepts the same reference to select its owning frame. An omitted reference preserves DOM ancestry.

The scene-local named registry resolves references independently of document order and refreshes after structural,
name, or reference changes. The CPU registry also works before WebGPU becomes available. The dependency graph
captures parent relationships and checks cycles when its topology changes. Evaluation follows dependency order and
shares ancestor results within each snapshot. Its cycle traversal visits each coordinate frame at most once.
Scenes without references retain the DOM evaluation path.

Missing, duplicate, cross-scene, and cyclic targets report `frame-unresolved` on the referring element. An invalid
resolved chain suppresses descendants and referrers while unrelated content remains usable. Removing a target
leaves references unresolved; it never moves content to the scene root. Visibility follows the resolved chain,
including hidden ancestors, as well as ordinary DOM hiding. Cameras use the same registry and error code.

### Joint motion

`nve-scene-joint` specialises a frame with one degree of freedom. Its declarative position and orientation
are the joint origin; the effective local pose is origin × motion. Revolute and continuous joints rotate
about a normalised local axis, prismatic joints translate along it, and fixed joints add no motion.
Calibration uses `scale * value + offset`. A synchronous `value` assignment becomes visible at the next
render boundary. `setPose` retains explicit authority until `setPose(null)` restores the stored inputs.

Optional limits report `joint-limit` once per crossing while applying the value and keeping the chain valid.
Reversed limits disable checking and report the same diagnostic; continuous joints ignore limits.
A mimic joint uses `mimic-multiplier * target.effectiveValue + mimic-offset` instead of its own value.
Scene supports only one level: the target must be a joint in the same scene and must not itself mimic.
Mimic resolution can read enclosing scopes; it cannot bind into a different entity's private scope.
Invalid types, axes, numeric inputs, and mimic references report `joint-type`, `joint-axis`, `joint-value`,
and `joint-mimic`, respectively. These invalidate only the affected transform and its dependent chains.
Joints own no transport, time, history, interpolation, or description decoding.

### Model entities and name scopes

`nve-scene-model` specialises a frame with exactly a name scope, a `joints` view, and `tint`.
Bodies remain individually pickable and keep their feature IDs. Models currently add no instancing or file loading.
Position, orientation, explicit poses, frame references, visibility, and lifecycle retain frame semantics.
Models own no transport, time, history, interpolation, or description decoding.

Frames, joints, and named bodies inside a model belong to its scope. Bare names must not contain `/`;
`frame-name` rejects that separator. Unqualified `frame` and `mimic` references search the nearest enclosing
model first, then each outer scope and the scene. A duplicate in a nearer scope shadows an outer name and
remains unresolved. Duplicate checking is per scope, so separate entities can reuse internal names.
Qualified references walk model scopes with `/`, such as `arm/tcp` or `cell/arm/tcp`. Document order has no effect.
An unnamed model works internally; an outside qualified reference to its member reports `model-name`
until the model has a name or the reference no longer addresses it.

The read-only `joints` view exposes `get`, `set`, `has`, `names`, `values`, and `reset` for the current scope,
excluding nested models. Its membership follows DOM connection and removal. `set` assigns the joint's value;
`values` returns a plain object, and `reset` zeroes non-mimic joints. Unknown names through `get` or `set`
report `model-joint` and invalidate the entity chain until a valid access or reset corrects the input.
Model tint multiplies through nested model tints and each body's own tint in the existing linear-light
color pipeline. Tint changes preserve captured geometry and topology.

### Geometry decoder registry

`nve-scene-body src="robot.stl"` loads one rigid visual. The final URL path segment selects a lower-case extension;
query parameters and fragments do not affect dispatch. Missing or unknown extensions report `body-src`, name the
URL, and start no fetch or decoder import. Bodies have no `format` attribute. The URL fragment supports future sub-asset
selection and reaches the decoder unchanged, including the leading `#` and percent escapes. An absent fragment is
an empty string. STL ignores the fragment.

`loadGeometry(url, { format?, signal })` uses the same table and infers the extension when format is absent.
`decodeGeometry(bytes, { format, signal, fragment? })` captures the selected bytes before asynchronous decoding.
Both return geometry independently of elements and WebGPU. File headers, streamed bytes, and compiled allocations
have bounds. Source changes, direct geometry assignments, and disconnection cancel pending body requests;
only the newest request can install geometry. `loadComplete` resolves after capture, before GPU presentation.
Direct geometry assignment clears `src`; clearing `src` restores authored shapes.

`registerGeometryDecoder(extension, loader)` adds an external decoder without adding its dependencies to Scene.
The extension accepts an optional leading dot and uses lower-case comparison. Registration throws for any existing
extension, including built-ins. The loader returns a promise of a module exposing
`decode(bytes, { fragment, signal })`, which returns a promise of `SceneBodyGeometry`. Loading remains lazy;
applications can keep third-party runtime dependencies in separate packages. Decoders preserve coordinates and units, respect
cancellation, and bound their decoded allocations. The element validates and captures returned geometry through the
existing body pipeline. This registry only selects geometry decoders; it differs from the general visualizer
plug-in registry excluded by the non-goals.

When description loading arrives, it follows the same concept rule: `nve-scene-model src="robot.urdf"` loads an entity
through a separate extension-keyed description decoder table. `loadDescription()` provides the function form, and
`registerDescriptionDecoder()` admits external decoders. Formats never introduce their own model elements. Models currently
have none of these loading APIs; description decoding remains future work.

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

Mesh geometry publication has a current exception: each publication copies the complete published attribute and
validates the complete geometry, even for a small range. Published ranges guide later attribute patches and GPU
uploads. Range-proportional capture and validation remain design targets for this path.

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

`SharedDeviceService` owns one device shared by Scene instances. Each scene owns its canvas context and renderer
resources. Disconnection releases those scene resources and removes the scene's device-loss listener while retaining
the shared device for later connections. Device loss invalidates affected renderers and starts automatic recovery.
A second loss within ten seconds blocks further automatic recovery until a scene reconnects.

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

Scene fails closed for spatial and record data that it knows is invalid. It reports invalid geometry, transforms, and
records through local Scene diagnostics and keeps unrelated layers usable. Immediate violations of a JavaScript API
contract may throw before Scene stores the value.

Appearance handling has a separate default policy. Unsupported CSS colors can fall back without diagnostics; mesh
colors fall back to white. These defaults do not permit repair of invalid geometry, transforms, or records.

Use a whole-scene unavailable state only when Scene cannot render reliably, such as adapter acquisition, canvas
configuration, device loss, or a required renderer failure. The adapter must reject malformed domain messages and
unsupported producer values or report them at the affected Scene boundary instead of presenting a WebGPU outage.

`body-src` and `shape-kind` report body and shape failures. `body-dual-source` remains reserved; assigned
geometry overrides shape children without a diagnostic. Frame references use
`frame-unresolved`; duplicate names use `frame-name-duplicate`, and invalid bare names use `frame-name`.
Joint diagnostics are `joint-type`, `joint-axis`, `joint-value`, `joint-limit`, and `joint-mimic`.
Model diagnostics are `model-joint` and `model-name`. Limit warnings apply the value and retain chain validity;
invalid inputs suppress the affected contribution and its dependent chains.

Diagnostics must identify the affected element and provide a stable error code. Scene must not silently repair spatial
or record data in a way that changes its meaning. The application decides whether to keep an older snapshot, show stale
state, retry, or replace the source.

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
