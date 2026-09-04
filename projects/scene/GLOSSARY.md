---
{
  title: 'Scene 3D Rendering Glossary',
  description: 'Definitions of 3D graphics and WebGPU terms used by contributors to the Scene project.',
  layout: 'docs.11ty.js'
}
---

# Scene 3D Rendering Glossary

This glossary explains the graphics vocabulary used in `@nvidia-elements/scene` for contributors who know web development but may be new to 3D rendering. It covers terms that appear in the public API, documentation, shaders, rendering architecture, and performance code. It isn't a general survey of every computer graphics technique.

The shortest useful model of the renderer is:

```text
application snapshot -> frame composition -> CPU staging -> GPU resources -> render passes -> canvas
```

Scene uses a right-handed, REP-103-aligned world coordinate system. +X points forward, +Y points left, and +Z points up. Linear values use meters unless an API explicitly uses CSS pixels, and angular values use radians.

## A

**Accumulation** — The weighted sum of translucent fragment colors and alpha values in Scene's OIT pass. The composite pass divides accumulated color by accumulated alpha before applying revealage.

**Active count** — The number of records a layer captures as its complete active prefix during publication. It can differ from both source capacity and a layer's independent `countLimit`.

**Active prefix** — The contiguous range of records from index zero through `count - 1` that a packed record source currently exposes. A buffer can reserve more capacity than this range without rendering the unused records.

**Adapter** — In WebGPU, the browser's representation of a physical or software GPU that can create a GPU device. In Scene's data API, an external source adapter also means the typed wrapper created around application-owned packed bytes, such as the value returned by `createPointSource()`.

**Alignment** — A constraint that requires a byte offset or allocation size to fall on a particular boundary. GPU formats, buffer copies, and mapped readback rows impose alignment rules that Scene's layouts and resource code must honor.

**Alpha** — The color channel that represents opacity. An alpha of zero is fully transparent, an alpha of one is fully opaque, and values between them are translucent. Packed `unorm8x4` colors store alpha from 0 through 255.

**Alpha blending** — The operation that combines a fragment's color and alpha with color already stored in a render target. Scene uses ordinary blending for final composition and weighted blended order-independent transparency for translucent geometry.

**Altitude** — The physical distance between a top camera and its target. It doesn't control the visible orthographic extent; `frustumHeight` controls that extent independently.

**Angle** — A measure of rotation. Scene expresses heading, azimuth, polar angle, field of view, and other angular values in radians, not degrees.

**Aspect ratio** — Viewport width divided by viewport height. A projection matrix uses this ratio to prevent geometry from stretching when the canvas isn't square.

**Atlas** — One texture that packs many smaller images into regions. Scene builds a font atlas of signed-distance-field glyphs so many labels can share one texture and sampler.

**Attribute** — Data associated with a vertex or instance, such as position, normal, color, texture coordinates, or an instance transform. This graphics meaning differs from an HTML attribute, though Scene's Web Components also have HTML attributes.

**Axis** — One direction in a coordinate basis. Scene uses X, Y, and Z axes; its axes component draws X red, Y green, and Z blue in positive or bidirectional mode.

**Azimuth** — The orbit camera's horizontal angle around its target. Scene combines it with the target heading when calculating the camera position.

## B

**Back face** — The side of a triangle opposite its front face. The vertex winding order determines which side is the front.

**Back-face culling** — Skipping triangles whose back faces point toward the camera. Scene's solid marker and mesh pipelines use counterclockwise front faces and cull back faces.

**Basis** — A set of perpendicular directions used to describe a coordinate system. Scene's world basis is forward-left-up, while its optical camera basis is right-down-forward.

**Bilinear interpolation** — Interpolation across a rectangular grid cell using the four corner samples. Height-field methods such as `heightAt()` describe this continuous surface, which can differ from the two triangles that Scene actually renders for the cell.

**Billboard** — Geometry oriented toward the camera so its face remains readable as the view changes. Scene's 3D labels are camera-facing billboards built from glyph quads.

**Bind group** — A WebGPU object that bundles shader-visible resources, much like passing a stable input object to shader functions. A bind group can contain buffers, samplers, and texture views and must match a bind group layout expected by the pipeline.

**Binding** — A numbered shader input location within a bind group. WGSL annotations such as `@group(0) @binding(1)` connect shader declarations to resources supplied by JavaScript.

**Bounding volume** — A simple shape that encloses more detailed geometry and makes visibility or intersection tests cheaper. Scene uses marker bounds and bounding spheres during GPU visibility compaction.

**Borrowed bytes** — Application-owned packed storage wrapped by an external source adapter. Scene reads and captures the bytes when the layer publishes but doesn't take ownership of the original allocation.

**Buffer** — A linear allocation of bytes. JavaScript typed arrays are CPU buffers; WebGPU buffers store data that shader stages, draw commands, or readback code use on the GPU.

**Buffer capacity** — The maximum record count that fits in a fixed allocation. Capacity reserves storage; it doesn't determine how many records render.

**Buffer upload** — Copying data from CPU-visible memory into a GPU buffer, commonly with `GPUQueue.writeBuffer()`. Scene tracks changed ranges to avoid uploading an unchanged allocation.

## C

**Camera** — The pose and projection that determine which part of the world appears on the canvas. Unlike a DOM element with visual content, a camera contributes view state that transforms every rendered item.

**Camera space (view space)** — Coordinates expressed relative to the camera after the view transform. Scene derives a right-handed view matrix from its world-from-optical-camera pose.

**Canvas context** — The WebGPU connection to an HTML canvas. Scene configures this context, acquires its current texture for each rendered frame, and unconfigures it on disconnect.

**Cell** — One rectangle between four adjacent samples in a height field. Scene splits each cell into two triangles along a fixed diagonal.

**Clip coordinates** — Homogeneous coordinates produced by the view-projection transform before division by the `w` component. The GPU clips primitives against the clip volume at this stage.

**Clip plane** — A boundary of the visible volume. The near and far planes bound depth, while the left, right, top, and bottom planes bound the image extent.

**Clip space** — The coordinate space after projection and before perspective division. A point outside the clip volume doesn't appear in the viewport.

**Clipping** — Removing the portions of primitives outside the visible clip volume. This differs from culling, which can reject a complete primitive or object before rasterization.

**Clear color** — The color written to a render target when a pass begins with a clear operation. Scene derives its canvas clear color from the component's computed background color.

**Color attachment** — A texture view that receives color output from a render pass. Scene's opaque pass targets the canvas, while its transparency pass targets accumulation and revealage textures.

**Color space** — A convention that maps stored numeric channels to perceived color. Scene presents through an sRGB canvas format but performs calculations that require blending in suitable render-target formats.

**Column-major matrix** — A matrix stored one column after another in memory. Scene's public 4-by-4 matrices use column-major order, and nested transforms compose as `world = parent × local`.

**Command buffer** — A finalized sequence of GPU commands. Scene finishes a command encoder and submits the resulting command buffer to the device queue.

**Command encoder** — A WebGPU recorder for render passes, compute passes, copies, and related GPU work. Encoding describes future GPU work; submitting the finished command buffer schedules that work.

**Compaction** — Building a smaller list of records that need drawing. Scene's marker compute pass rejects invisible and zero-alpha instances, then writes separate opaque and transparent instance-index lists for indirect drawing.

**Compute pass** — A WebGPU pass that runs compute shaders rather than rasterizing primitives. Scene uses compute work for tasks such as marker compaction and height-field normal generation.

**Compute shader** — A general-purpose GPU program launched as workgroups. Unlike vertex and fragment shaders, it doesn't directly produce a rasterized image.

**Coordinate frame** — A named local origin and orientation relative to a parent. `nve-scene-frame` composes nested rigid transforms so sensors, robots, annotations, and other content can keep numerically small local coordinates.

**Coordinate system** — The origin, axis directions, handedness, units, and rotation conventions used to interpret numeric positions and orientations.

**Counterclockwise (CCW)** — A winding direction. Scene treats counterclockwise mesh triangles as front-facing and normalizes polygon outer rings to this direction.

**CPU staging** — Preparing data in CPU-owned memory before GPU upload. Scene validates, snapshots, normalizes, derives, and packs source data in staging storage so the renderer owns a coherent input.

**CSS pixel** — The logical pixel unit used by browser layout. Scene's pixel-sized points, lines, and labels use CSS pixels and account for device pixel ratio when converting to canvas pixels.

**Cross product** — A vector operation that returns a vector perpendicular to two input vectors. Its direction depends on operand order and coordinate-system handedness. Scene uses cross products to build camera bases and surface normals.

**Culling** — Rejecting geometry that can't contribute visible pixels. Examples include back-face culling and frustum culling.

## D

**Depth** — A projected measure of how far a fragment lies through the view volume. WebGPU normalized depth ranges from zero at the near plane to one at the far plane in Scene's projection helpers.

**Depth attachment** — The render-pass texture that stores depth values. Scene uses a `depth24plus` attachment for normal color rendering and a float depth output for picking readback.

**Depth bias** — A small offset to generated depth that reduces unwanted overlap artifacts. Scene's line renderer can apply depth bias to improve the visibility of lines drawn over surfaces.

**Depth buffer** — The image-sized storage containing the closest accepted depth for each pixel. It supplies the state used by depth testing.

**Depth test** — The comparison between an incoming fragment's depth and the stored depth. A passing fragment can contribute color; closer geometry hides a failing fragment.

**Depth write** — Updating the depth buffer after a fragment passes its depth test. Scene enables depth writes for opaque geometry and disables them for transparent accumulation so translucent draw order doesn't decide visibility.

**Device** — The logical WebGPU connection used to create resources and submit work. A device exposes capabilities and limits and can become lost.

**Device loss** — The state in which a WebGPU device can no longer perform work. Scene discards device-owned resources, obtains a recovered device when possible, and rebuilds from the last captured layer snapshots.

**Device pixel** — A physical canvas pixel. CSS coordinates and device-pixel coordinates can differ because of device pixel ratio, browser zoom, and canvas resolution.

**Device pixel ratio** — The scale between CSS pixels and device pixels. Scene accounts for it when sizing the canvas, projecting points, sizing pixel-unit geometry, and converting pointer coordinates for picking.

**Dirty range** — The part of a source that changed since its prior capture. `publish({ start, count })` identifies dirty records, which Scene translates into merged byte ranges for GPU upload.

**Distance field** — A grid whose value at each sample represents distance to a boundary. Scene encodes signed distances around glyph edges into its font atlas.

**Dot product** — A scalar measure of how closely two vectors point in the same direction. Renderers use it for projection, plane tests, and lighting calculations.

**Double precision** — 64-bit floating-point representation, exposed in JavaScript through `Float64Array`. Scene uses it for CPU-side frame and camera composition before converting GPU inputs to single precision.

**Draw call** — A command that tells the GPU to assemble and rasterize vertices with the currently bound pipeline and resources. Batching many records into one layer reduces the number of draw calls compared with drawing each item separately.

**Draping** — Replacing or offsetting geometry heights so it follows a terrain surface. Scene provides height-field methods for draping points onto either the bilinear field or the rendered triangle surface.

## E

**Ear clipping** — A polygon triangulation algorithm that repeatedly removes a valid triangle, or "ear," from a polygon boundary. Scene uses it after bridging holes in valid polygon input.

**Elevation** — Height along the local +Z axis. A height field stores one elevation for each regularly spaced XY sample.

**Elevation grid** — See **height field**.

**External source** — A typed descriptor over packed bytes owned by another producer. It preserves layout identity so equal byte lengths can't make Scene confuse marker, point, line, label, and triangle records.

## F

**Face** — A surface of a solid. In triangle rendering, a face normally means one triangle or a group of triangles that represents a larger planar surface.

**Far plane** — The farthest clipping plane of the camera frustum. The GPU clips geometry beyond it, and increasing its distance relative to the near plane can reduce depth precision.

**Feature ID** — An application-owned unsigned 32-bit identity associated with a logical pick target. Unlike a transient buffer index, it can remain stable when records move or an application reuses storage slots.

**Field offset** — The byte position of a field inside one packed record. A layout descriptor publishes offsets so external producers can write canonical bytes correctly.

**Field of view (FOV)** — The angular extent visible through a perspective camera. Scene configures the vertical field of view in radians; the aspect ratio determines the horizontal extent.

**Flat shading** — Lighting a whole triangle with one face normal, producing a faceted look. Scene generates flat normals when a mesh doesn't supply normals; indexed geometry may need expansion so adjacent faces can have different normals at a shared position.

**Follow camera** — A camera behavior that tracks one uniquely named Scene frame. Position mode tracks only translation, while pose mode also tracks the frame heading; an orbit contribution can supply the remaining viewing offset and projection.

**Foreshortening** — The perspective effect that makes an object's projected size shrink as its camera distance increases. Orthographic projection doesn't produce this effect.

**Fragment** — A candidate pixel sample produced when the rasterizer covers a primitive. A fragment shader calculates its outputs, and depth or blending operations determine its final contribution.

**Fragment discard** — A shader operation that prevents a fragment from updating its attachments. Scene discards fragments with unsuitable alpha in opaque, transparent, label, texture, and picking paths.

**Fragment shader** — A GPU program that runs for rasterized fragments. Scene's fragment shaders calculate color, lighting, transparency outputs, label coverage, or picking IDs and depth.

**Frame** — An overloaded graphics term. A **coordinate frame** is a local coordinate system; a **rendered frame** is one submitted image and its captured scene state. Code and documentation should qualify the term when either meaning could fit.

**Frame hierarchy** — A tree of coordinate frames whose transforms inherit from their ancestors. Invalid frame transforms suppress the affected subtree because Scene can't place it coherently in world space.

**Frame-local coordinates (local space)** — Positions expressed relative to the nearest coordinate frame. Scene composes those coordinates through the ancestor chain to produce world coordinates.

**Frame rate** — The number of rendered frames per second. It isn't the same as simulation update rate, sensor rate, or display refresh rate, even when those values happen to match.

**Frustum** — The visible volume defined by a camera projection. It resembles a truncated pyramid for perspective projection and a box for orthographic projection.

**Frustum culling** — Rejecting objects whose bounding volumes lie fully outside the camera frustum. Scene performs marker visibility checks during GPU compaction.

**Frustum height** — The vertical world-space extent visible through an orthographic camera. It behaves like a zoom level without changing the physical camera altitude.

## G

**Generation** — A distinct captured version of source or render state. Scene preserves generation boundaries so a render or delayed pick result doesn't mix records, topology, transforms, or identities from different application snapshots.

**Geometry** — Numeric data that describes drawable shape: positions plus optional normals, colors, texture coordinates, and indices. A Scene mesh captures these arrays separately from its instances and material state.

**Glyph** — The rendered shape for a character. Scene converts browser-font glyphs to signed-distance-field atlas regions and draws each visible glyph as two triangles.

**Glyph run** — The ordered glyph data needed to draw a text string or group of strings, including atlas location, placement, and metrics.

**GPU (graphics processing unit)** — A processor optimized for running large numbers of similar operations in parallel. Scene uses the GPU for vertex transformation, rasterization, shading, visibility compaction, height-field work, and picking passes.

**GPU readback** — Copying GPU results into CPU-readable memory. Readback is asynchronous and comparatively expensive, so Scene uses it for picking but provides `getRay()` for application-owned geometric queries that don't need an ID pass.

**GPU resource** — A device-owned object such as a buffer, texture, sampler, bind group, pipeline, or query set. GPU resources don't survive device loss and require explicit lifecycle management.

## H

**Handedness** — The relationship between the positive X, Y, and Z axes. Scene's world and view calculations are right-handed, which affects cross products, rotations, and triangle winding.

**Heading** — Rotation about the world or target +Z axis. Scene uses heading to orient orbit and top-camera targets.

**Height field** — A surface represented by one height for each point on a regular 2D grid. This structure represents terrain efficiently but can't represent overhangs or more than one height at the same XY location.

**Hole ring** — A closed polygon boundary that removes an interior region from the outer ring. Scene requires holes to be inside the outer ring, nonintersecting, disjoint, and unnested before triangulation.

**Homogeneous coordinates** — Four-component coordinates `[x, y, z, w]` that let 4-by-4 matrices express translation and perspective along with rotation and scale. Positions normally use `w = 1`, while directions use `w = 0`.

**Hot path** — Code that runs frequently enough for small costs to matter, such as per-frame matrix work, record scans, shader dispatch, and draw submission. Scene marks some hot paths to explain deliberate low-allocation or scalar implementations.

## I

**ID pass (picking pass)** — A render pass that draws selectable geometry with encoded identifiers instead of display colors. Scene reads the ID and depth at one device pixel, resolves them against a retained table, and returns a `ScenePickHit`.

**Identity transform** — A transform that leaves coordinates unchanged: zero translation, no rotation, and unit scale. A Scene frame without an authored pose is a valid identity frame.

**Image bitmap** — The browser image source represented by `ImageBitmap`. `SceneMesh.setTexture()` captures an independently owned copy for rendering and device recovery without closing the caller's bitmap.

**Index** — An integer that references a vertex or record. A geometry index selects a vertex; a packed-source index selects a record; and a pick target index identifies a logical target in the submitted snapshot.

**Index buffer** — A GPU buffer containing vertex indices. Indexed drawing can reuse vertices shared by triangles instead of duplicating every vertex attribute.

**Indexed geometry** — Geometry whose triangle vertices refer to entries in vertex arrays through an index array. Scene stores mesh indices as unsigned 32-bit integers arranged in triangle triples.

**Indirect draw** — A draw whose counts come from a GPU buffer rather than immediate JavaScript arguments. Scene's compaction pass writes draw arguments so the GPU can draw only retained instances without a CPU readback.

**Instance** — One placement of reusable geometry with its own transform and colors. In Scene, a marker record commonly supplies the position, quaternion orientation, scale, face color, and outline color for one instance.

**Instance buffer** — Packed storage containing per-instance values. Scene reads marker records as instance data while reusing one primitive, mesh, polygon, or model geometry definition.

**Instancing** — Drawing the same geometry many times with different per-instance data. On the GPU, this resembles rendering a list with one shared template instead of creating a different geometry resource for every item.

**Interpolation** — Estimating values between known samples. The GPU interpolates vertex outputs across triangles; Scene also performs bilinear terrain interpolation. Time interpolation belongs to the application, not Scene.

**Inverse matrix** — A matrix that reverses another matrix's transform. Scene uses inverse transforms to convert world points to local coordinates and to unproject viewport coordinates into world-space rays or pick positions.

## L

**Layer** — A Scene element that owns and batches one kind of renderable content, such as cubes, lines, labels, a height field, or a mesh. Think of a layer as a specialized canvas renderer nested in the DOM, not one DOM node per rendered record.

**Lighting** — Calculating color variation from surface orientation and a light model. Scene applies a small built-in lighting function to lit marker and mesh surfaces; line, point, triangle-soup, and polygon rendering is unlit.

**Line list** — A GPU primitive topology in which each independent pair of vertices forms a line. Scene also uses line-list geometry for cube outlines.

**Line loop** — Scene's connected-line topology that joins consecutive records and connects the last record back to the first.

**Line segment** — A straight path between two endpoints. Picking a Scene line returns a segment target with both submitted vertex indices.

**Line strip** — Scene's default connected-line topology, where each record after the first creates a segment from the preceding record.

**Linear color** — Color values proportional to light intensity, which makes arithmetic such as interpolation and blending physically meaningful. sRGB values are nonlinear display encodings and normally require conversion around rendering calculations.

**Little-endian** — A byte order that stores the least-significant byte first. Scene's canonical packed record wire formats require little-endian numeric writes.

**Local space** — See **frame-local coordinates**.

## M

**Marker** — Scene's per-instance placement record or its declarative `nve-scene-marker` counterpart. A marker isn't merely a visual pin; it can place and tint primitives, meshes, polygons, and compound models.

**Material** — The data and shader behavior that determine how a surface looks. Scene exposes a deliberately small material model: base color, optional per-vertex or per-instance colors, optional mesh texture, opacity, and either built-in lighting or unlit rendering.

**Matrix** — A rectangular numeric structure used to transform coordinates. Scene uses 4-by-4 matrices for translation, rotation, scale, view transforms, projection, and their compositions.

**Mesh** — A collection of vertices and triangles representing a surface. `nve-scene-mesh` accepts custom positions and optional indices, normals, UV coordinates, colors, and a texture.

**Model** — A compound reusable object built from one or more primitive parts. Scene compiles model parts into mesh geometry and then places copies with marker instances.

**Model space** — Coordinates relative to an object's own origin before its instance and ancestor-frame transforms. Scene part positions, orientations, and scales are model-local.

**Model-view-projection (MVP)** — The conventional composition that transforms model-local vertices through world and camera space into clip space. Scene keeps reusable view-projection and frame or instance transforms as separate shader inputs where useful, but the mathematical pipeline is the same.

## N

**Near plane** — The closest clipping plane of the camera frustum. The GPU clips geometry closer than this plane. Keeping it as far from zero as the application permits generally improves depth precision.

**Normal** — A unit vector perpendicular to a surface. Shaders use normals for lighting, and Scene's line records use a normal to control world-width path orientation.

**Normal vector** — See **normal**.

**Normalization** — Scaling a nonzero vector or quaternion to length one without changing its direction or rotation. Scene normalizes valid quaternions at input boundaries.

**Normalized device coordinates (NDC)** — Coordinates after perspective division converts clip-space values by `w`. In WebGPU, visible X and Y range from -1 through 1 and depth ranges from 0 through 1. Scene maps NDC to browser client coordinates in `getClientPoint()`.

**Normalized unsigned integer (`unorm`)** — An integer format that shaders read as a floating-point value from zero through one. Scene's `unorm8x4` packed colors store four one-byte RGBA channels in four bytes.

**Nonindexed geometry** — Geometry that lists every triangle vertex directly, with each consecutive group of three vertices forming a triangle. This format is simple but can duplicate shared positions and attributes.

## O

**Occlusion** — The condition in which closer geometry hides farther geometry. Depth testing handles geometric occlusion; `getClientPoint()` only projects coordinates and doesn't report whether another object covers the point.

**OIT composite pass** — The full-screen render pass that reads Scene's accumulation and revealage textures and blends the resolved translucent result over opaque canvas color.

**Opaque** — Fully blocking background color at the relevant sample, normally represented by alpha one. Scene draws opaque geometry first with depth writes enabled.

**Optical camera basis** — Scene's camera-local REP-103 convention: +X points right in the image, +Y points down, and +Z points forward through the image plane. Camera pose quaternions describe this optical basis in world space.

**Orbit camera** — A camera behavior that positions the eye around a target using distance, polar angle, azimuth, and target heading. Pointer, touch, wheel, and keyboard controls can change this behavior.

**Order-independent transparency (OIT)** — A transparency technique designed to reduce or remove dependence on the order in which translucent objects draw. Scene uses weighted blended OIT, which accumulates approximate color and coverage without sorting every triangle by depth.

**Orientation** — An object's rotation relative to another coordinate space. Scene represents authored orientations as XYZW quaternions.

**Origin** — The point `[0, 0, 0]` in a coordinate space. A nested frame creates a new local origin, and a height field can offset its first XY sample with its `origin` value.

**Orthographic projection** — A projection in which parallel lines remain parallel and visible size doesn't decrease with distance. Scene's top camera always uses this projection, and `frustumHeight` controls its vertical extent.

**Outer ring** — The boundary enclosing a polygon's filled region. Scene orients it counterclockwise before triangulation.

**Outline** — A separate line rendering of a shape boundary. Cube marker instances can use an outline color distinct from their face color.

## P

**Packed record** — One fixed-stride binary structure containing the fields for a marker, point, line vertex, triangle vertex, or label. Packed records reduce object allocation and make application-to-GPU transfer predictable.

**Packed record buffer** — Scene-owned fixed-capacity CPU storage with typed record handles and version tracking. Examples include `MarkerBuffer`, `PointBuffer`, and `LineVertexBuffer`.

**Perspective division** — Dividing clip coordinates by their `w` component to produce NDC. It creates the perspective effect in which farther objects appear smaller.

**Perspective projection** — A projection that models foreshortening, so visible size decreases with distance from the camera. Field of view, aspect ratio, and near and far planes define it.

**Pick** — Resolving the rendered target beneath viewport coordinates. Scene performs an ID-and-depth pass, asynchronously reads one pixel, and reconstructs a world-space hit.

**Pick hit** — Scene's immutable result for a successful pick. It includes browser client coordinates, owning element and layer, logical target, optional feature ID, and reconstructed world position.

**Pick target** — The source-level meaning of a hit, such as an instance, label, point, segment, triangle, or surface. It prevents callers from guessing what a numeric index represents.

**Pipeline** — An immutable WebGPU object that defines shader stages and fixed rendering or compute state. A render pipeline includes vertex layouts, shaders, primitive topology, culling, color targets, blending, and depth behavior.

**Pixel** — A sample location in an image. In Scene APIs, distinguish a CSS pixel used for layout from a device pixel used by the canvas render targets.

**Pixel-sized geometry** — Points, line widths, or labels whose visible size stays fixed in CSS pixels as camera distance changes. This mode favors readability over physical scale.

**Point** — A position rendered as a camera-facing square with a uniform or record color. Scene point size can use CSS pixels or world units.

**Point cloud** — A collection of many independent 3D points that sensors or sampling can produce. Scene represents it efficiently with a `PointBuffer` and one points layer.

**Polar angle** — The orbit camera's angle measured down from +Z. Zero places the eye above the target, and π places it below.

**Polygon** — A filled planar region defined by an outer ring and optional hole rings. Scene accepts simple XY polygons, normalizes their winding, bridges holes, and triangulates them for GPU rendering.

**Pose** — A position and orientation expressed in the same coordinate frame. Scene poses contain a three-component position and an XYZW quaternion but no scale.

**Pose camera** — A camera behavior with an explicitly supplied world or frame-relative optical pose and projection. It preserves roll and ignores built-in navigation input.

**Premultiplied alpha** — A color representation in which RGB channels already include multiplication by alpha. Scene configures its canvas with premultiplied alpha and produces compatible colors during opaque and OIT composition.

**Primitive** — A basic drawable shape or assembly unit. WebGPU primitives include triangles and lines; Scene's higher-level unit primitives include cubes, spheres, cones, cylinders, and pyramids.

**Primitive topology** — The rule that assembles ordered vertices into points, lines, or triangles. Examples include triangle list and line list. Scene's public line topology separately describes how line records become connected segments.

**Producer** — Application code, a worker, a decoder, or another system that creates source arrays or packed records. The producer owns timing and mutation; Scene captures explicitly published state.

**Projection** — The transform and rules that map camera-space geometry into clip space. Scene supports perspective and orthographic projections.

**Projection matrix** — The 4-by-4 matrix encoding the camera projection. It maps the visible frustum into WebGPU clip space.

**Publish** — The explicit operation that validates and captures current producer data for one layer. Conceptually, publishing is closer to committing state than notifying observers: unpublished mutations remain outside that layer's render snapshot.

## Q

**Quad** — A four-corner polygon that the GPU renders as two triangles. Scene generates quads for glyphs, square points, and some primitive faces.

**Quaternion** — Four numbers that represent a 3D rotation without the singularities of three-angle representations. Scene uses XYZW order, normalizes finite nonzero inputs, and uses `[0, 0, 0, 1]` for the identity rotation.

**Queue** — The WebGPU interface used to submit command buffers and write data into GPU resources. Queue submission is asynchronous; encoding and submission don't mean the GPU has finished displaying the frame.

## R

**Rasterization** — Converting geometric primitives into fragments on a pixel grid. This stage follows vertex processing and primitive assembly and precedes fragment shading and output tests.

**Ray** — A half-line defined by an origin and normalized direction. `scene.getRay()` unprojects client coordinates into a world-space ray that starts on the camera near plane.

**Readback** — See **GPU readback**.

**Record count** — The number of records in the active prefix of a packed source. It can change without reallocating the source.

**Record handle** — A stable JavaScript object returned by a packed buffer's `add()` or `at()` operation. It provides typed access to one storage slot but doesn't give that slot permanent application identity.

**Record layout** — The declared byte shape of a packed record: its name, stride, fields, types, and offsets. Scene exports canonical descriptors such as `MARKER`, `POINT`, `LINE_VERTEX`, `TRIANGLE_VERTEX`, and `LABEL`.

**Record source** — A typed provider of packed records assigned to a compatible layer. Scene accepts its versioned record buffers and explicit external source adapters but rejects untyped array-buffer views.

**Render pass** — A group of draw calls that share configured color and depth attachments. Scene normally encodes an opaque pass, an optional OIT pass, and an OIT composite pass; picking uses separate attachments and passes.

**Render pipeline** — See **pipeline**.

**Render target** — A texture that receives rendering output. The current canvas texture, the depth texture, OIT textures, and picking ID and depth textures are Scene render targets.

**Rendered frame** — One image encoded and submitted with a coherent set of layer, transform, camera, and resource state. Scene snapshots projection state at submission for later coordinate conversion and picking consistency.

**Renderer** — The subsystem that turns scene state into GPU commands and images. Scene's composition root schedules rendering while specialized renderers own geometry, mesh, label, transparency, and picking resources.

**Rendering pipeline** — The whole data flow from application state through transforms, GPU stages, rasterization, tests, blending, and presentation. This broad concept differs from one concrete WebGPU render-pipeline object.

**Revealage** — The fraction of background that remains visible through accumulated translucent fragments. Scene's weighted OIT pass stores revealage separately, then converts it to opacity during composition.

**RGBA** — A color tuple containing red, green, blue, and alpha channels. Scene APIs generally express floating-point RGBA channels in the range zero through one.

**Right-handed coordinate system** — A coordinate system in which the ordered positive axes follow the right-hand rule. Scene uses +X forward, +Y left, and +Z up for world data.

**Rigid transform** — A transform containing translation and rotation but no scale or shear. Scene coordinate frames are rigid; marker and model-part transforms can also include scale.

**Roll** — Rotation around a camera's forward axis. Scene's explicit pose camera preserves roll, while target-based camera behaviors derive their own up direction.

**Rotation** — A change in orientation around an axis. Scene uses quaternions for general orientation and radians for scalar camera angles.

## S

**Sampler** — A WebGPU object describing how shaders read between and beyond texture samples. Scene uses linear minification and magnification filtering for mesh textures and the label atlas.

**Scale** — Per-axis size multipliers in X, Y, and Z order. Marker and model-part scale changes geometry size; coordinate frames intentionally don't support scale.

**Scene** — The composition root that owns the canvas, current camera, frame registry, layer collection, rendering schedule, picking, and device lifecycle. The application owns transport, time, history, synchronization, and selection of each coherent current snapshot.

**Scene graph** — A hierarchy of objects and transforms used to organize renderable content. Scene deliberately uses a small DOM-backed form of this pattern: nested frame and layer elements describe stable structure, while packed sources carry dynamic bulk data.

**Scene snapshot** — One coherent set of transforms, sensor buffers, annotations, camera state, and related data chosen by the application for rendering. Scene validates and captures snapshots but doesn't create temporal coherence across separate application assignments.

**Scene unit (world unit)** — One unit of distance in scene coordinates. Scene's documented spatial convention treats linear world values as meters. Pixel-unit APIs are explicit exceptions.

**Screen space** — Coordinates measured relative to the rendered image or viewport after projection. Scene uses browser client coordinates for its public picking and projection helpers.

**Shader** — A GPU program. WebGPU shaders use WGSL and run in a defined stage such as vertex, fragment, or compute.

**Shader module** — A WebGPU object created from WGSL source. Pipelines select entry-point functions from the module for their stages.

**Shading** — Calculating the appearance of rendered fragments. It can include color, lighting, texture sampling, transparency, and edge coverage.

**Signed distance field (SDF)** — A field that stores distance to a shape boundary with different signs inside and outside. Scene samples glyph SDFs in the fragment shader to draw scalable text with smooth edges and glyph-aware picking.

**Simple polygon** — A polygon whose boundary doesn't cross itself. Scene requires the outer ring and every hole ring to be simple before triangulation.

**Single precision** — 32-bit floating-point representation, exposed in JavaScript through `Float32Array` and used broadly by GPUs. Scene keeps frame composition in double precision on the CPU, then rounds render values to single precision at the GPU upload boundary.

**Slope (inclination)** — The angle between a terrain surface and horizontal. Height-field smooth queries derive it from the bilinear surface, while surface queries use the rendered triangle face.

**Smooth shading** — Interpolating vertex normals across a triangle so lighting changes continuously instead of showing each face boundary. Scene derives smooth normals for height fields.

**Snapshot** — An owned, stable capture of mutable source state. It plays the role of immutable UI state: rendering and recovery can use it even if the producer mutates its working buffers later.

**sRGB** — A standard nonlinear color encoding used by web content and displays. Scene configures its canvas for the sRGB color space and requests an sRGB presentation view format.

**Storage buffer** — A shader-readable and optionally shader-writable GPU buffer suited to large structured data. Scene uses storage buffers for packed records, instance indices, glyph data, and compute results.

**Storage partition** — One allocation-sized section of a packed source. Scene partitions large sources so every storage-buffer binding fits the GPU device's maximum buffer and binding-size limits while retaining complete primitives at boundaries.

**Stride** — The byte distance from the beginning of one record or vertex to the beginning of the next. A source's byte length must align with its canonical layout stride.

**Subdivision** — Splitting geometry into smaller primitives to approximate a smoother shape. Scene creates its unit sphere by subdividing an icosahedron and projecting new positions to the sphere radius.

**Surface** — The visible boundary represented by triangles. A height field exposes separate smooth-field and triangle-surface queries because their interpolated results aren't always identical.

## T

**Tessellation** — Converting a higher-level shape into renderable primitives. Scene tessellates unit solids, models, polygons, and height fields into indexed triangles on the CPU.

**Texel** — One sample in a texture, analogous to a pixel in an image but not necessarily mapped one-to-one to a screen pixel.

**Texture** — An image-like GPU resource sampled by shaders or used as a render target. Scene uses textures for mesh images, the label atlas, depth, OIT accumulation and revealage, picking, and canvas presentation.

**Texture coordinates (UV coordinates)** — Two-component coordinates that map a mesh vertex to a texture location. Scene passes supplied UV values through unchanged and uploads an `ImageBitmap` without vertically flipping it.

**Texture filtering** — The rule used to calculate a texture value between stored texels or at a different display size. Scene uses linear filtering for mesh and label textures.

**Texture origin** — The corner from which texture coordinates address image data. Scene uploads an `ImageBitmap` without a vertical flip, so the input's browser-defined image orientation remains authoritative.

**Texture view** — A WebGPU interpretation of all or part of a texture for use as a shader resource or render-pass attachment. Pipelines bind and render to views rather than directly to texture allocations.

**Top camera** — A camera behavior that looks down at a target with an orthographic projection. Altitude controls physical placement, while frustum height controls visible extent.

**Topology** — Connectivity: which vertices form primitives and how those primitives relate. Updating mesh indices changes topology; updating only positions changes shape without changing connectivity.

**Transform** — A mapping from one coordinate space to another. Translation, rotation, and scale combine into model or instance transforms; view and projection transforms carry world positions to clip space.

**Transform chain** — The ordered composition of local and ancestor transforms needed to reach world space. A Scene frame reference is resolvable only when the complete relevant chain is valid.

**Translation** — Moving a point or object without rotating or scaling it. Scene positions use X, Y, and Z translation components.

**Transparency** — The general property of allowing background color to contribute through foreground geometry. See **alpha**, **alpha blending**, and **order-independent transparency**.

**Transparent** — Code often uses this term for any record whose alpha is less than fully opaque, including partially translucent, fully invisible, and other nonopaque values. Human-facing prose should distinguish transparent from translucent when the difference matters.

**Triangle** — The fundamental filled primitive in Scene. Three vertices define a planar surface with an orientation, and Scene tessellates larger shapes into triangle lists.

**Triangle list** — A primitive topology in which each independent group of three indices or vertices forms one triangle.

**Triangle soup** — Independent triangle data without higher-level mesh connectivity or material structure. `nve-scene-triangles` renders a streamed, unlit triangle soup from consecutive triples of triangle-vertex records.

**Triangulation** — Converting a polygonal surface into triangles. Scene triangulates height-field cells, polygon boundaries and holes, unit primitives, and compound model parts.

**Typed array** — A JavaScript view such as `Float32Array`, `Uint32Array`, or `Uint8Array` over binary memory. Scene uses typed arrays for predictable layouts, efficient copies, and direct compatibility with GPU data formats.

## U

**Uniform buffer** — A small read-only GPU buffer whose values remain the same across many shader invocations in a draw. Scene uses uniforms for view-projection matrices, frame transforms, viewport dimensions, counts, and layer settings.

**Unit primitive** — A canonical shape centered around its local origin with standard dimensions. Marker scale and transforms turn Scene's shared unit cube, sphere, cone, cylinder, or pyramid into a placed object.

**Unit vector** — A vector with length one. Directions, surface normals, and normalized ray directions use unit vectors so their magnitude doesn't unintentionally affect calculations.

**Unlit rendering** — Rendering colors without applying a lighting model. This technique helps data visualization keep the supplied color predictable regardless of surface direction.

**Unprojection** — Reversing view-projection mapping to recover a world-space position or ray from screen coordinates and depth. Scene unprojects picking depth into a hit position and unprojects near and far points for `getRay()`.

**Upload range** — A byte interval copied into an existing GPU buffer. Scene merges overlapping or adjacent dirty intervals before upload.

**UV coordinates** — See **texture coordinates**.

## V

**Vector** — An ordered numeric tuple used for positions, directions, colors, and related quantities. Scene's `Vec3` type contains three mutable numeric components.

**Vertex** — One input point to primitive assembly, together with any attributes associated with it. A position alone isn't always a complete vertex; normals, colors, and UV coordinates can occupy parallel arrays.

**Vertex attribute** — See **attribute**.

**Vertex buffer** — A GPU buffer read by the vertex stage according to a declared stride and attribute layout. Scene uses vertex buffers for reusable primitive geometry and mesh attribute arrays.

**Vertex shader** — A GPU program that runs for each submitted vertex. It transforms geometry into clip space and passes values such as color, normal, UV coordinates, and picking ID toward rasterization.

**Vertex stream** — An ordered sequence of packed vertex records. Scene streams points, line vertices, and triangle vertices through fixed-capacity CPU buffers and matching GPU storage.

**View matrix** — The inverse of the camera's world transform, expressed in the renderer's view convention. It converts world coordinates into camera space.

**View-projection matrix** — The projection matrix multiplied by the view matrix. Scene applies it to world-space geometry to produce clip coordinates and inverts it for unprojection.

**View space** — See **camera space**.

**Viewport** — The rectangular region of the canvas that receives the projected image. Scene's helpers map among world coordinates, normalized device coordinates, device pixels, and browser client coordinates for an axis-aligned viewport.

**Visibility** — Whether geometry can contribute to the current rendered image. Visibility can depend on clipping, culling, alpha, depth testing, valid source data, and a valid transform chain.

## W

**WebGPU** — The browser GPU API that Scene uses to create resources, compile WGSL shaders, encode passes, submit commands, and present to a canvas. WebGPU is lower-level than the DOM and retains explicit resource and synchronization concepts.

**Weighted blended OIT** — Scene's order-independent transparency approximation. The transparent pass accumulates depth- and alpha-weighted premultiplied color plus revealage, and a full-screen pass composites the result over opaque color.

**WGSL (WebGPU Shading Language)** — The shader language used by WebGPU. Scene embeds WGSL source for vertex, fragment, and compute entry points in TypeScript modules.

**Winding order** — The order in which a triangle's vertices appear when viewed from one side. Scene treats counterclockwise triangles as front-facing and clockwise rings as polygon holes after normalization.

**Wire format** — A precisely specified binary representation that producers and consumers can share. Scene's exported layout descriptors define names, strides, field types, offsets, and little-endian writes for packed record formats.

**Workgroup** — A group of compute shader invocations that the GPU schedules together and that can cooperate through workgroup-local features. Scene calculates a dispatch count from the record count and each compute shader's declared workgroup size.

**World coordinates (world space)** — Coordinates after Scene composes all local and ancestor frame transforms into its root coordinate system. Picks report world positions, while frame helpers convert between world and local values.

**World unit** — See **scene unit**.

**World-sized geometry** — Points, line widths, or labels whose size uses scene units, so perspective projection makes them shrink with distance. This mode represents physical scale rather than constant readability.

## Z

**Z-buffer** — Another name for the depth buffer, based on the conventional use of projected Z as depth.

**Z-fighting** — Flickering or unstable visibility when surfaces produce nearly equal depth values. Separating surfaces, moving the near plane outward, or applying a suitable depth bias can reduce it.

**Zero copy** — A data path that avoids an otherwise unnecessary memory copy. External source adapters borrow producer bytes, but publishing still captures owned render state so later producer mutation can't change a submitted snapshot implicitly.
