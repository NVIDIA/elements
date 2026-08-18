// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_WGSL, STREAM_WGSL } from './layouts/wgsl.js';
import type { SceneGPUDevice, SceneGPURenderPipeline } from '../../internal/gpu/platform.js';
import { OIT_WGSL, oitTargetStates } from './transparency.js';

interface StreamDevice extends SceneGPUDevice {
  createRenderPipeline(descriptor: unknown): SceneGPURenderPipeline;
  createShaderModule(descriptor: unknown): unknown;
}

export interface StreamPipelines {
  readonly biasedLine: PipelinePair;
  readonly line: PipelinePair;
  readonly point: PipelinePair;
  readonly triangle: PipelinePair;
}

export interface PipelinePair {
  readonly opaque: SceneGPURenderPipeline;
  readonly transparent: SceneGPURenderPipeline;
}

/** Positive depth bias keeps co-planar reference grids behind scene geometry. */
export const GRID_DEPTH_BIAS = 3000;

interface PairOptions {
  readonly code: string;
  readonly device: StreamDevice;
  readonly format: string;
  readonly depthBias?: number;
}

export function createStreamPipelines(device: StreamDevice, format: string): StreamPipelines {
  return {
    line: createPair({ code: LINE_SHADER, device, format }),
    point: createPair({ code: POINT_SHADER, device, format }),
    triangle: createPair({ code: TRIANGLE_SHADER, device, format }),
    biasedLine: createPair({
      code: LINE_SHADER,
      depthBias: GRID_DEPTH_BIAS,
      device,
      format
    })
  };
}

function createPair(options: PairOptions): PipelinePair {
  const module = options.device.createShaderModule({ code: options.code });
  const create = (transparent: boolean) =>
    options.device.createRenderPipeline({
      layout: 'auto',
      vertex: { module, entryPoint: 'vertexMain' },
      fragment: {
        module,
        entryPoint: transparent ? 'fragmentOit' : 'fragmentMain',
        targets: transparent ? oitTargetStates() : [{ format: options.format }]
      },
      primitive: { topology: 'triangle-list', frontFace: 'ccw', cullMode: 'none' },
      depthStencil: {
        depthCompare: 'less',
        depthWriteEnabled: !transparent,
        format: 'depth24plus',
        ...(options.depthBias === undefined
          ? {}
          : { depthBias: options.depthBias, depthBiasClamp: 0, depthBiasSlopeScale: 0 })
      }
    });
  return { opaque: create(false), transparent: create(true) };
}

const SCENE_FIELDS =
  'viewProjection: mat4x4f, frame: mat4x4f, pixelRatio: f32, viewportWidth: f32, viewportHeight: f32, size: f32, count: f32, topology: f32, worldUnit: f32';

const COLOR_WGSL = /* wgsl */ `
fn color(value: vec4f) -> vec4f { let rgb = select(pow((value.rgb + vec3f(0.055)) / vec3f(1.055), vec3f(2.4)), value.rgb / vec3f(12.92), value.rgb <= vec3f(0.04045)); return vec4f(rgb * value.a, value.a); }
`;

export const UNIFORMS = /* wgsl */ `
struct Scene { ${SCENE_FIELDS} }
@group(0) @binding(0) var<uniform> scene: Scene;
struct Output { @builtin(position) position: vec4f, @location(0) color: vec4f }
${COLOR_WGSL}
${OIT_WGSL}
fn fragmentOpaque(input: Output) -> vec4f { if (input.color.a < 1.0) { discard; } return input.color; }
fn fragmentTransparent(input: Output) -> NveOitOutput { if (input.color.a <= 0.0 || input.color.a >= 1.0) { discard; } return nve_oit(input.color, input.position.z); }
`;

export const POINT_SHADER = /* wgsl */ `
${UNIFORMS}
${STREAM_WGSL}
fn corner(index: u32) -> vec2f { const values = array<vec2f, 6>(vec2f(-1.0,-1.0),vec2f(1.0,-1.0),vec2f(1.0,1.0),vec2f(-1.0,-1.0),vec2f(1.0,1.0),vec2f(-1.0,1.0)); return values[index]; }
fn pointOffset(shape: vec2f, clip: vec4f) -> vec2f { if (scene.worldUnit > 0.5) { let rowX = vec3f(scene.viewProjection[0].x, scene.viewProjection[1].x, scene.viewProjection[2].x); let rowY = vec3f(scene.viewProjection[0].y, scene.viewProjection[1].y, scene.viewProjection[2].y); return shape * scene.size * vec2f(length(rowX), length(rowY)) * 0.5; } let pixels = shape * scene.size * scene.pixelRatio * 0.5; return pixels * vec2f(2.0 / scene.viewportWidth, 2.0 / scene.viewportHeight) * clip.w; }
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Output { let point = nve_load_stream_vertex(index / 6u); let clip = scene.viewProjection * scene.frame * vec4f(point.position, 1.0); var output: Output; output.position = clip + vec4f(pointOffset(corner(index % 6u), clip), 0.0, 0.0); output.color = color(point.color); return output; }
@fragment fn fragmentMain(input: Output) -> @location(0) vec4f { return fragmentOpaque(input); }
@fragment fn fragmentOit(input: Output) -> NveOitOutput { return fragmentTransparent(input); }
`;

export const TRIANGLE_SHADER = /* wgsl */ `
${UNIFORMS}
${STREAM_WGSL}
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Output { let vertex = nve_load_stream_vertex(index); var output: Output; output.position = scene.viewProjection * scene.frame * vec4f(vertex.position, 1.0); output.color = color(vertex.color); return output; }
@fragment fn fragmentMain(input: Output) -> @location(0) vec4f { return fragmentOpaque(input); }
@fragment fn fragmentOit(input: Output) -> NveOitOutput { return fragmentTransparent(input); }
`;

const LINE_BODY = /* wgsl */ `
${LINE_WGSL}
${COLOR_WGSL}
${OIT_WGSL}
struct LineOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) distance: f32,
  @interpolate(linear) @location(5) screenDistance: f32,
  @interpolate(flat) @location(2) segmentLength: f32,
  @interpolate(flat) @location(3) dashGap: vec2f,
  @interpolate(flat) @location(4) segmentIndex: u32,
}
fn corner(index: u32) -> vec2f { const values = array<vec2f, 6>(vec2f(0.0,-1.0),vec2f(0.0,1.0),vec2f(1.0,1.0),vec2f(0.0,-1.0),vec2f(1.0,1.0),vec2f(1.0,-1.0)); return values[index]; }
fn isLoop() -> bool { return scene.topology > 0.5 && scene.topology < 1.5; }
fn isSegments() -> bool { return scene.topology > 1.5; }
fn projected(position: vec3f) -> vec4f { return scene.viewProjection * scene.frame * vec4f(position, 1.0); }
fn pixels(clip: vec4f) -> vec2f { return clip.xy / clip.w * vec2f(scene.viewportWidth, scene.viewportHeight) * 0.5; }
fn direction2(start: vec2f, end: vec2f) -> vec2f { let delta = end - start; return select(vec2f(0.0), normalize(delta), dot(delta, delta) > 0.000001); }
fn direction3(start: vec3f, end: vec3f) -> vec3f { let delta = end - start; return select(vec3f(0.0), normalize(delta), dot(delta, delta) > 0.000001); }
fn clipOffset(position: vec4f, offset: vec2f) -> vec4f { return position + vec4f(offset * vec2f(2.0 / scene.viewportWidth, 2.0 / scene.viewportHeight) * position.w, 0.0, 0.0); }
fn empty(segment: u32) -> LineOutput { var output: LineOutput; output.position = vec4f(0.0,0.0,2.0,1.0); output.color = vec4f(0.0); output.distance = 0.0; output.screenDistance = 0.0; output.segmentLength = 0.0; output.dashGap = vec2f(0.0); output.segmentIndex = segment; return output; }
fn outputAt(position: vec4f, value: vec4f, distance: f32, screenDistance: f32, segmentLength: f32, dashGap: vec2f, segment: u32) -> LineOutput { var output: LineOutput; output.position = position; output.color = color(value); output.distance = distance; output.screenDistance = screenDistance; output.segmentLength = segmentLength; output.dashGap = dashGap; output.segmentIndex = segment; return output; }
fn segmentStart(segment: u32) -> u32 { return select(segment, segment * 2u, isSegments()); }
fn segmentEnd(start: u32, count: u32) -> u32 { return select(start + 1u, 0u, isLoop() && start + 1u == count); }
fn joinedOffset2(first: vec2f, second: vec2f, firstHalf: f32, secondHalf: f32, side: f32, shape: u32) -> vec2f { let outerFirst = first * side * firstHalf; let outerSecond = second * side * secondHalf; let miter = normalize(first + second) * side; let averageHalf = 0.5 * (firstHalf + secondHalf); let miterLength = averageHalf / max(abs(dot(miter, first)), 0.000001); let joined = select(vec2f(0.0), miter * miterLength, miterLength <= max(firstHalf, secondHalf) * 4.0); return select(outerFirst, select(joined, outerSecond, shape == 2u), shape == 0u); }
fn joinedOffset3(first: vec3f, second: vec3f, firstHalf: f32, secondHalf: f32, side: f32, shape: u32) -> vec3f { let outerFirst = first * side * firstHalf; let outerSecond = second * side * secondHalf; let miter = normalize(first + second) * side; let averageHalf = 0.5 * (firstHalf + secondHalf); let miterLength = averageHalf / max(abs(dot(miter, first)), 0.000001); let joined = select(vec3f(0.0), miter * miterLength, miterLength <= max(firstHalf, secondHalf) * 4.0); return select(outerFirst, select(joined, outerSecond, shape == 2u), shape == 0u); }
fn screenSegment(segment: u32, shape: vec2f, count: u32) -> LineOutput { let startIndex = segmentStart(segment); let start = nve_load_line_vertex(startIndex); let end = nve_load_line_vertex(segmentEnd(startIndex, count)); if (start.width <= 0.0) { return empty(segment); } let startClip = projected(start.position); let endClip = projected(end.position); let unit = direction2(pixels(startClip), pixels(endClip)); if (dot(unit, unit) < 0.000001) { return empty(segment); } let normal = vec2f(-unit.y, unit.x); let halfWidth = start.width * scene.pixelRatio * 0.5; let base = select(startClip, endClip, shape.x > 0.5); let length = distance(pixels(startClip), pixels(endClip)); return outputAt(clipOffset(base, normal * halfWidth * shape.y), start.color, 0.0, shape.x * length, length, vec2f(start.dash, start.gap) * scene.pixelRatio, segment); }
fn worldSegment(segment: u32, shape: vec2f, count: u32) -> LineOutput { let startIndex = segmentStart(segment); let start = nve_load_line_vertex(startIndex); let end = nve_load_line_vertex(segmentEnd(startIndex, count)); if (start.width <= 0.0) { return empty(segment); } let delta = end.position - start.position; let sideValue = cross(delta, start.normal); if (dot(delta, delta) < 0.000001 || dot(sideValue, sideValue) < 0.000001) { return empty(segment); } let side = normalize(sideValue); let base = select(start.position, end.position, shape.x > 0.5); let length = distance(start.position, end.position); return outputAt(projected(base + side * start.width * 0.5 * shape.y), start.color, shape.x * length, 0.0, length, vec2f(start.dash, start.gap), segment); }
fn joinPoint(join: u32) -> u32 { return select(join + 1u, join, isLoop()); }
fn screenJoin(join: u32, shape: u32, count: u32) -> LineOutput { let pointIndex = joinPoint(join); let previousIndex = select(pointIndex - 1u, count - 1u, pointIndex == 0u); let nextIndex = select(pointIndex + 1u, 0u, pointIndex + 1u == count); let previous = nve_load_line_vertex(previousIndex); let point = nve_load_line_vertex(pointIndex); if (previous.width <= 0.0 || point.width <= 0.0 || previous.gap > 0.0 || point.gap > 0.0) { return empty(pointIndex); } let pointClip = projected(point.position); let incoming = direction2(pixels(projected(previous.position)), pixels(pointClip)); let outgoing = direction2(pixels(pointClip), pixels(projected(nve_load_line_vertex(nextIndex).position))); let turn = incoming.x * outgoing.y - incoming.y * outgoing.x; if (dot(incoming,incoming) < 0.000001 || dot(outgoing,outgoing) < 0.000001 || abs(turn) < 0.000001) { return empty(pointIndex); } let first = vec2f(-incoming.y,incoming.x); let second = vec2f(-outgoing.y,outgoing.x); let side = select(1.0,-1.0,turn>0.0); let offset = joinedOffset2(first, second, previous.width * scene.pixelRatio * 0.5, point.width * scene.pixelRatio * 0.5, side, shape); return outputAt(clipOffset(pointClip, offset), point.color, 0.0, 0.0, 0.0, vec2f(0.0), pointIndex); }
fn worldJoin(join: u32, shape: u32, count: u32) -> LineOutput { let pointIndex = joinPoint(join); let previousIndex = select(pointIndex - 1u, count - 1u, pointIndex == 0u); let nextIndex = select(pointIndex + 1u, 0u, pointIndex + 1u == count); let previous = nve_load_line_vertex(previousIndex); let point = nve_load_line_vertex(pointIndex); let next = nve_load_line_vertex(nextIndex); if (previous.width <= 0.0 || point.width <= 0.0 || previous.gap > 0.0 || point.gap > 0.0) { return empty(pointIndex); } let incoming = direction3(previous.position, point.position); let outgoing = direction3(point.position, next.position); let firstValue = cross(incoming, previous.normal); let secondValue = cross(outgoing, point.normal); if (dot(firstValue,firstValue) < 0.000001 || dot(secondValue,secondValue) < 0.000001) { return empty(pointIndex); } let first = normalize(firstValue); let second = normalize(secondValue); var planeNormal = point.normal; let normalSum = previous.normal + point.normal; if (dot(normalSum,normalSum) > 0.000001) { planeNormal = normalize(normalSum); } let turn = dot(cross(incoming,outgoing), planeNormal); if (abs(turn) < 0.000001) { return empty(pointIndex); } let side = select(1.0,-1.0,turn>0.0); let offset = joinedOffset3(first, second, previous.width * 0.5, point.width * 0.5, side, shape); return outputAt(projected(point.position + offset), point.color, 0.0, 0.0, 0.0, vec2f(0.0), pointIndex); }
fn segmentCount(count: u32) -> u32 { if (isSegments()) { return count / 2u; } if (isLoop()) { return count; } return select(0u, count - 1u, count > 0u); }
fn joinCount(count: u32) -> u32 { if (isSegments()) { return 0u; } if (isLoop()) { return count; } return select(0u, count - 2u, count > 1u); }
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> LineOutput { let count = u32(scene.count); let segments = segmentCount(count); let segmentVertices = segments * 6u; if (index < segmentVertices) { if (scene.worldUnit > 0.5) { return worldSegment(index / 6u, corner(index % 6u), count); } return screenSegment(index / 6u, corner(index % 6u), count); } let join = (index - segmentVertices) / 3u; if (join >= joinCount(count)) { return empty(0u); } if (scene.worldUnit > 0.5) { return worldJoin(join, (index-segmentVertices)%3u, count); } return screenJoin(join, (index-segmentVertices)%3u, count); }
fn lineVisible(input: LineOutput) -> bool { if (input.color.a <= 0.0) { return false; } let dash = input.dashGap.x; let gap = input.dashGap.y; if (gap <= 0.0) { return true; } let distanceAlong = select(input.screenDistance, input.distance, scene.worldUnit > 0.5); let period = dash + gap; let centered = distanceAlong - input.segmentLength * 0.5 + dash * 0.5; let phase = centered - floor(centered / period) * period; return phase <= dash; }
`;

function createLineShader(pick: boolean): string {
  const pickField = pick ? ', pickId: u32' : '';
  const fragment = pick
    ? /* wgsl */ `
struct PickOutput { @location(0) id: vec4u, @location(1) depth: f32 }
@fragment fn fragmentMain(input: LineOutput) -> PickOutput { if (!lineVisible(input)) { discard; } let id = scene.pickId + input.segmentIndex; return PickOutput(vec4u(id & 255u, (id >> 8u) & 255u, (id >> 16u) & 255u, id >> 24u), input.position.z); }
`
    : /* wgsl */ `
@fragment fn fragmentMain(input: LineOutput) -> @location(0) vec4f { if (!lineVisible(input) || input.color.a < 1.0) { discard; } return input.color; }
@fragment fn fragmentOit(input: LineOutput) -> NveOitOutput { if (!lineVisible(input) || input.color.a >= 1.0) { discard; } return nve_oit(input.color, input.position.z); }
`;
  return `struct Scene { ${SCENE_FIELDS}${pickField} }\n@group(0) @binding(0) var<uniform> scene: Scene;\n${LINE_BODY}\n${fragment}`;
}

export const LINE_SHADER = createLineShader(false);
export const LINE_PICK_SHADER = createLineShader(true);
