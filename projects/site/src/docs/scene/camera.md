---
{
  title: 'Scene Camera',
  description: 'Camera poses, orbit, follow, and top behaviors, plus bounds queries and explicit fitting for Scene.',
  layout: 'docs.11ty.js',
  tag: 'nve-scene-camera'
}
---

## Installation

{% install 'nve-scene-camera' %}

## Camera conventions

Scene uses the REP-103 optical basis for camera-local view calculations: +X points right in the image, +Y points down in the image, and +Z points forward through the image plane. World-space Scene data continues to use +X forward, +Y left, and +Z up. See the authoritative [coordinate and frame conventions](/docs/scene/frame/#coordinate-and-unit-conventions).

Camera target positions, direct camera positions, clipping distances, and orbit distances use meters. Heading, polar angle, azimuth, and vertical field of view use radians. Every resolved camera snapshot contains a world-space optical pose and either a perspective or orthographic projection with explicit `near` and `far` clipping distances.

A pose camera accepts an XYZW world-from-camera quaternion and preserves roll. Set `frame` to compose the pose with one uniquely named frame that has a valid transform chain. Duplicate, unresolved, and invalid frame references remain inert until they recover. Built-in pointer, touch, wheel, and keyboard controls don't change an active pose camera.

For unfamiliar content, query selected geometry with `scene.getBounds()` and explicitly call `scene.fitCamera(camera, bounds)`. See [bounds and camera fitting](/docs/scene/camera/#bounds-and-camera-fitting) for snapshot semantics, padding, projection handling, and follow ownership.

## Behavior-specific properties

Scene reports a `camera-property-inactive` warning when an application explicitly supplies a property that the selected behavior ignores. Defaults alone don't warn. HTML attributes and JavaScript property assignments both express intent, including an assignment equal to a default value.

| Behavior | Active inputs                                                                |
| -------- | ---------------------------------------------------------------------------- |
| `pose`   | Position, orientation, optional frame, projection, and clipping              |
| `orbit`  | Target, heading, distance, angles, distance limits, projection, and clipping |
| `follow` | Frame and follow mode                                                        |
| `top`    | Target, heading, altitude, orthographic extent, and clipping                 |

Numeric range failures remain separate from compatibility warnings. An invalid active value makes that camera contribution inert. An inactive but valid property doesn't disable the selected behavior.

## Behavior Orbit

{% example 'nve-scene-camera' 'BehaviorOrbit' %}

Set `behavior="orbit"` to add pointer, touch, wheel, and keyboard navigation around a target.

An orbit contribution can compose with one `follow` contribution. The follow camera supplies the moving target, while the orbit camera continues to own its distance, viewing angles, and projection.

## Behavior Follow

{% example 'nve-scene-camera' 'BehaviorFollow' %}

## Behavior Top

{% example 'nve-scene-camera' 'BehaviorTop' %}

A top camera always uses an orthographic projection. `altitude` controls the physical camera distance above its target. `frustumHeight` controls the visible vertical extent, so changing zoom doesn't move the camera.

```html
<nve-scene-camera
  behavior="top"
  target="[0,0,0]"
  altitude="80"
  frustum-height="34"
></nve-scene-camera>
```

Top cameras use `altitude` for their physical distance and `frustumHeight` for their visible orthographic extent. Configure either value independently.

## Bounds and camera fitting

Use `scene.getBounds()` to query selected spatial content, then `scene.fitCamera()` to choose an initial view. Neither operation automatically repeats when data, frames, visibility, or the viewport changes. Applications decide when to fit; users keep their view during playback and streaming updates.

```typescript
// Assign or publish the initial content, then wait for declarative frame inputs and layout.
await Promise.all([scene.updateComplete, vehicleFrame.updateComplete]);
const bounds = scene.getBounds({ content: [vehicleFrame] });
scene.fitCamera(camera, bounds, { padding: 0.1 });
```

Select layers, frames, ancestor containers, or the scene itself. Supply an explicit selection. Overlapping roots contribute each layer once, and nested scenes don't contribute. Every selected or excluded element must belong to the queried scene; foreign elements throw `TypeError`.

Reference geometry can distort a useful view. Select the data subtree, as the vehicle playback example does, or exclude grid and axes branches:

```typescript
const bounds = scene.getBounds({ content: [scene], exclude: [grid, axes] });
scene.fitCamera(camera, bounds);
```

### Query snapshot

The result describes the latest captured assignment or successful publication for each selected layer, combined with current effective frame transforms. It describes published CPU content, independently of the last submitted GPU frame. A query doesn't publish producer edits, consume pending uploads, allocate GPU resources, or wait for `scene.ready`. Capture related sources and transforms together before querying a coherent application snapshot. Declarative frame properties take effect during their component update; `frame.setPose()` takes effect immediately.

The result is a frozen, independent world-space axis-aligned box with `minimum` and `maximum` XYZ tuples in meters. Composition and accumulation preserve JavaScript number precision, including large frame origins. An empty selection or content with no contributing geometry returns `null`.

| Content or state                                                     | Contribution                                                                                                            |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Primitive instances                                                  | Conservative geometry boxes transformed by instance and ancestor frame poses; arrows extend from origin toward the head |
| Meshes, models, polygons                                             | Captured geometry bounds, transformed by each effective instance; geometry without instances uses its identity instance |
| Terrain                                                              | Captured grid positions and heights                                                                                     |
| Triangle vertices                                                    | Published effective vertex prefix                                                                                       |
| World-sized points                                                   | Positions expanded to contain the camera-facing square at any orientation                                               |
| World-width lines                                                    | Positions expanded for width and bounded joins; an incomplete topology contributes nothing                              |
| Pixel-sized points and lines                                         | Positions only                                                                                                          |
| Labels, including world-scaled labels                                | Anchors only, independent of text metrics, fonts, and the camera                                                        |
| `countLimit`                                                         | Restricts the published active prefix exactly as rendering does                                                         |
| `[hidden]` layer or ancestor                                         | Omitted unless `includeHidden: true`; arbitrary CSS visibility doesn't change query selection                           |
| Empty or invalid source, invalid frame chain, pending custom element | No contribution; unrelated valid content still contributes                                                              |
| Unloaded model asset                                                 | No contribution; await `model.loadComplete` before querying loaded geometry                                             |

Bounds don't depend on opacity, occlusion, or renderer culling. Transparent records still contribute. Bounds can be conservative for curved primitives, transformed mesh boxes, and line joins. Pixel footprints and label text can extend beyond a fitted view; increase padding when those footprints matter. Query detached scene-owned content before GPU initialization. Buffer capacity doesn't contribute: valid empty sources return no geometry, according to each source's capacity contract.

### Explicit fitting

`scene.fitCamera(camera, bounds, options)` accepts an explicit enabled, valid `pose`, `orbit`, or `top` camera belonging to the scene. It returns `true` after applying camera inputs and scheduling rendering. It doesn't wait for submission or emit a navigation event. Passing `null` bounds returns `false` without changing inputs.

Fitting preserves projection mode, perspective field of view, orientation, roll, and orbit viewing angles. A standalone orbit or top camera targets the box center; a pose camera moves to view the center while preserving its optical rotation. A framed pose keeps its frame and local orientation. An orbit composed with follow keeps the tracked target and heading, adjusting distance and projection extent to contain the box around that target. A follow-only camera has no fitting operation.

Perspective fitting accounts for all box corners and their depths. Orthographic fitting adjusts `frustumHeight` independently of physical distance or top-camera altitude. Both modes derive positive near and far clipping distances with numerical slack. Orbit fitting preserves `minDistance` and expands `maxDistance` when required for containment. These clipping distances describe the fitted box; applications displaying additional moving content may choose wider clipping distances afterward.

`padding` defaults to `0.1`, reserving ten percent of each viewport dimension at **each** edge. It must be finite, at least zero, and less than `0.5`. `aspect` defaults to the scene's current width divided by height. Supply a positive finite `aspect` to fit before layout, or wait until both viewport dimensions are nonzero. Fitting remains explicit after a resize.

Planar and linear boxes fit normally. A single point has no natural scale, so fitting uses a virtual one-meter box centered on its anchor; the query still returns the original point bounds. Malformed or reversed bounds, invalid padding or aspect, and fit arithmetic that produces non-finite results throw without applying fitted camera inputs. Disabled, conflicted, unresolved, invalid, and follow-only cameras throw `InvalidStateError`; a foreign camera throws `TypeError`.

The public `SceneBounds`, `SceneBoundsQueryOptions`, and `SceneCameraFitOptions` types are available from `@nvidia-elements/scene` and `@nvidia-elements/scene/scene`.
