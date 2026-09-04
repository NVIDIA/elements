// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  supportsSceneGPUDrawPass,
  type SceneGPUBindGroup,
  type SceneGPUBuffer,
  type SceneGPUDevice,
  type SceneGPUDrawPass,
  type SceneGPURenderPass,
  type SceneGPURenderPipelineDevice,
  type SceneGPURenderPipeline,
  type SceneGPUSampler,
  type SceneGPUTexture
} from '../gpu/platform.js';
import { writeMat4ToFloat32 } from '../math/mat4.js';
import { OIT_WGSL, oitTargetStates } from '../rendering/transparency.js';
import type { Matrix4 } from '../types.js';
import type { LabelRenderItem } from '../rendering/render-items.js';
import { getLabelFontAtlas, LABEL_REFERENCE_LINE_HEIGHT, type LabelFontAtlas } from '../font/atlas.js';
import { createLabelGlyphRun, LABEL_GLYPH_STRIDE, prepareLabelGlyphRun, type LabelGlyphRun } from './glyph-run.js';
import { createPreparationContext, PREPARATION_CHUNK_SIZE } from '../preparation.js';

const BUFFER_COPY_DST = 0x08;
const BUFFER_STORAGE = 0x80;
const BUFFER_UNIFORM = 0x40;
const TEXTURE_COPY_DST = 0x02;
const TEXTURE_BINDING = 0x04;
const LABEL_UNIFORM_BYTE_LENGTH = 160;

interface LabelRendererDevice extends SceneGPURenderPipelineDevice {
  readonly queue: SceneGPUDevice['queue'] & {
    writeBuffer(buffer: SceneGPUBuffer, bufferOffset: number, data: ArrayBufferView): void;
    writeTexture(
      destination: { texture: SceneGPUTexture },
      data: ArrayBufferView,
      layout: { bytesPerRow: number },
      size: { width: number; height: number }
    ): void;
  };
  createBindGroup(descriptor: Parameters<NonNullable<SceneGPUDevice['createBindGroup']>>[0]): SceneGPUBindGroup;
  createBuffer(descriptor: Parameters<NonNullable<SceneGPUDevice['createBuffer']>>[0]): SceneGPUBuffer;
  createSampler(descriptor?: Parameters<NonNullable<SceneGPUDevice['createSampler']>>[0]): SceneGPUSampler;
  createTexture(descriptor: Parameters<NonNullable<SceneGPUDevice['createTexture']>>[0]): SceneGPUTexture;
}

interface LabelLayerResources {
  bindGroups: WeakMap<SceneGPURenderPipeline, SceneGPUBindGroup>;
  glyph: SceneGPUBuffer;
  glyphCapacity: number;
  glyphCount: number;
  label: SceneGPUBuffer;
  labelByteLength: number;
  labelCount: number;
  sourceBytes: Uint8Array;
  sourceCount: number;
  textVersion: number;
  readonly uniform: SceneGPUBuffer;
  readonly uniformValues: Float32Array;
}

interface LabelPreparation {
  readonly count: number;
  readonly resources: LabelLayerResources;
  readonly sourceCount: number;
  readonly texts: readonly string[];
  readonly textVersion: number;
}

/** Owns the SDF atlas and GPU storage used by packed label layers. */
export class LabelRenderer {
  readonly #atlas: LabelFontAtlas;
  readonly #colorPipeline: SceneGPURenderPipeline;
  readonly #device: LabelRendererDevice;
  readonly #layers = new Map<HTMLElement, LabelLayerResources>();
  readonly #onFailure: (error: unknown) => void;
  readonly #preparations = new Map<HTMLElement, LabelPreparation>();
  readonly #pickId = new Uint32Array(1);
  readonly #pickPipeline: SceneGPURenderPipeline;
  readonly #sampler: SceneGPUSampler;
  readonly #texture: SceneGPUTexture;
  readonly #requestRender: () => void;

  constructor(
    device: LabelRendererDevice,
    requestRender: () => void = () => undefined,
    onFailure: (error: unknown) => void = () => undefined
  ) {
    this.#device = device;
    this.#requestRender = requestRender;
    this.#onFailure = onFailure;
    this.#atlas = getLabelFontAtlas();
    this.#sampler = device.createSampler({ magFilter: 'linear', minFilter: 'linear' });
    this.#texture = createAtlasTexture(device, this.#atlas);
    this.#colorPipeline = createLabelPipeline(device, 'color');
    this.#pickPipeline = createLabelPipeline(device, 'pick');
  }

  prepare(
    item: LabelRenderItem,
    projection: Matrix4,
    frame: { readonly pixelRatio: number; readonly viewportHeight: number; readonly viewportWidth: number }
  ): void {
    const bytes = item.data.bytes;
    if (!bytes || !item.data.ready) {
      this.#suspendLayer(item.layer);
      return;
    }
    const resources = this.#ensureResources(item, bytes);
    const uniforms = resources.uniformValues;
    uniforms.fill(0);
    writeMat4ToFloat32(uniforms, projection);
    writeMat4ToFloat32(uniforms, item.frameMatrix, 16);
    uniforms[32] = frame.pixelRatio;
    uniforms[33] = frame.viewportWidth;
    uniforms[34] = frame.viewportHeight;
    uniforms[35] = item.scaleUnit === 'world' ? 1 : 0;
    this.#device.queue.writeBuffer(resources.uniform, 0, uniforms);
  }

  /** Reports whether the current label generation has drawable GPU data installed. */
  readyFor(item: LabelRenderItem): boolean {
    if (!item.data.ready || item.data.bytes === null || !item.data.hasVisibleText) return true;
    const resources = this.#layers.get(item.layer);
    return Boolean(
      resources &&
        resources.textVersion === item.data.textVersion &&
        resources.sourceCount === item.data.sourceCount &&
        resources.labelCount === item.data.count
    );
  }

  #suspendLayer(layer: HTMLElement): void {
    this.#preparations.delete(layer);
    const resources = this.#layers.get(layer);
    if (resources) resources.glyphCount = 0;
  }

  draw(pass: SceneGPURenderPass, item: LabelRenderItem): void {
    if (!supportsSceneGPUDrawPass(pass)) return;
    this.#draw(pass, item, this.#colorPipeline);
  }

  drawPick(pass: SceneGPURenderPass, item: LabelRenderItem, pickId: number): void {
    if (!supportsSceneGPUDrawPass(pass)) return;
    const resources = this.#layers.get(item.layer);
    if (!resources) return;
    this.#pickId[0] = pickId;
    this.#device.queue.writeBuffer(resources.uniform, 144, this.#pickId);
    this.#draw(pass, item, this.#pickPipeline);
  }

  prune(liveLayers: ReadonlySet<HTMLElement>): void {
    for (const [layer, resources] of this.#layers) {
      if (liveLayers.has(layer)) continue;
      destroyLayerResources(resources);
      this.#layers.delete(layer);
      this.#preparations.delete(layer);
    }
  }

  disconnect(): void {
    this.#layers.forEach(destroyLayerResources);
    this.#layers.clear();
    this.#preparations.clear();
    this.#texture.destroy?.();
  }

  #draw(pass: SceneGPUDrawPass, item: LabelRenderItem, pipeline: SceneGPURenderPipeline): void {
    const resources = this.#layers.get(item.layer);
    if (!resources || resources.glyphCount === 0 || !item.data.hasVisibleText) return;
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, this.#bindGroup(resources, pipeline));
    pass.draw(resources.glyphCount * 6);
  }

  #bindGroup(resources: LabelLayerResources, pipeline: SceneGPURenderPipeline): SceneGPUBindGroup {
    let bindGroup = resources.bindGroups.get(pipeline);
    if (bindGroup) return bindGroup;
    bindGroup = this.#device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: resources.uniform } },
        { binding: 1, resource: { buffer: resources.label } },
        { binding: 2, resource: { buffer: resources.glyph } },
        { binding: 3, resource: this.#sampler },
        { binding: 4, resource: this.#texture.createView() }
      ]
    });
    resources.bindGroups.set(pipeline, bindGroup);
    return bindGroup;
  }

  #ensureResources(item: LabelRenderItem, bytes: Uint8Array): LabelLayerResources {
    let resources = this.#layers.get(item.layer);
    if (!resources || resources.labelByteLength !== bytes.byteLength) {
      resources = this.#replaceResources(item, bytes, resources);
    } else {
      this.#writeChangedLabels(resources, item, bytes);
    }
    this.#prepareChangedText(resources, item);
    return resources;
  }

  #replaceResources(
    item: LabelRenderItem,
    bytes: Uint8Array,
    previous: LabelLayerResources | undefined
  ): LabelLayerResources {
    this.#preparations.delete(item.layer);
    const glyphCapacity = LABEL_GLYPH_STRIDE;
    const resources: LabelLayerResources = {
      bindGroups: new WeakMap(),
      glyph: this.#device.createBuffer({ size: glyphCapacity, usage: BUFFER_COPY_DST | BUFFER_STORAGE }),
      glyphCapacity,
      glyphCount: 0,
      label: this.#device.createBuffer({
        size: Math.max(4, bytes.byteLength),
        usage: BUFFER_COPY_DST | BUFFER_STORAGE
      }),
      labelByteLength: bytes.byteLength,
      labelCount: -1,
      sourceBytes: bytes,
      sourceCount: -1,
      textVersion: -1,
      uniform: this.#device.createBuffer({ size: LABEL_UNIFORM_BYTE_LENGTH, usage: BUFFER_COPY_DST | BUFFER_UNIFORM }),
      uniformValues: new Float32Array(LABEL_UNIFORM_BYTE_LENGTH / 4)
    };
    if (bytes.byteLength > 0) this.#device.queue.writeBuffer(resources.label, 0, bytes);
    if (previous) destroyLayerResources(previous);
    this.#layers.set(item.layer, resources);
    return resources;
  }

  #writeChangedLabels(resources: LabelLayerResources, item: LabelRenderItem, bytes: Uint8Array): void {
    if (resources.sourceBytes !== bytes) {
      if (bytes.byteLength > 0) this.#device.queue.writeBuffer(resources.label, 0, bytes);
      resources.sourceBytes = bytes;
      return;
    }
    for (const range of item.data.uploadRanges) {
      const end = Math.min(bytes.byteLength, range.offset + range.size);
      if (end > range.offset) {
        // eslint-disable-next-line local-performance/no-gpu-upload-in-loop -- The stream supplies merged ranges to this bounded upload loop.
        this.#device.queue.writeBuffer(resources.label, range.offset, bytes.subarray(range.offset, end));
      }
    }
  }

  // eslint-disable-next-line complexity -- Ready and pending generations compare independent count and text identities.
  #prepareChangedText(resources: LabelLayerResources, item: LabelRenderItem): void {
    if (
      resources.textVersion === item.data.textVersion &&
      resources.sourceCount === item.data.sourceCount &&
      resources.labelCount === item.data.count
    )
      return;
    const pending = this.#preparations.get(item.layer);
    if (
      pending?.resources === resources &&
      pending.textVersion === item.data.textVersion &&
      pending.sourceCount === item.data.sourceCount &&
      pending.count === item.data.count
    )
      return;
    const preparation = {
      count: item.data.count,
      resources,
      sourceCount: item.data.sourceCount,
      texts: item.data.texts,
      textVersion: item.data.textVersion
    };
    if (labelGlyphWorkIsBounded(preparation.texts, preparation.count)) {
      this.#preparations.delete(item.layer);
      this.#installGlyphRun(
        resources,
        preparation,
        createLabelGlyphRun(preparation.texts, preparation.count, this.#atlas)
      );
      return;
    }
    this.#preparations.set(item.layer, preparation);
    if (resources.sourceCount !== item.data.sourceCount || resources.labelCount !== item.data.count) {
      resources.glyphCount = 0;
    }
    void this.#runTextPreparation(item.layer, preparation);
  }

  async #runTextPreparation(layer: HTMLElement, preparation: LabelPreparation): Promise<void> {
    const isCurrent = () =>
      this.#preparations.get(layer) === preparation && this.#layers.get(layer) === preparation.resources;
    try {
      const glyphRun = await prepareLabelGlyphRun({
        atlas: this.#atlas,
        context: createPreparationContext(isCurrent),
        count: preparation.count,
        texts: preparation.texts
      });
      if (!glyphRun || !isCurrent()) return;
      this.#installGlyphRun(preparation.resources, preparation, glyphRun);
      this.#preparations.delete(layer);
      this.#requestRender();
    } catch (error) {
      if (!isCurrent()) return;
      this.#preparations.delete(layer);
      this.#onFailure(error);
    }
  }

  #installGlyphRun(resources: LabelLayerResources, preparation: LabelPreparation, glyphRun: LabelGlyphRun): void {
    const required = glyphRun.bytes.byteLength;
    if (required > resources.glyphCapacity) {
      resources.glyph.destroy();
      resources.glyphCapacity = nextBufferCapacity(required, LABEL_GLYPH_STRIDE);
      resources.glyph = this.#device.createBuffer({
        size: resources.glyphCapacity,
        usage: BUFFER_COPY_DST | BUFFER_STORAGE
      });
      resources.bindGroups = new WeakMap();
    }
    if (required > 0) this.#device.queue.writeBuffer(resources.glyph, 0, glyphRun.bytes);
    resources.glyphCount = required / LABEL_GLYPH_STRIDE;
    resources.labelCount = preparation.count;
    resources.sourceCount = preparation.sourceCount;
    resources.textVersion = preparation.textVersion;
  }
}

export function supportsLabelRenderer(device: SceneGPUDevice): device is LabelRendererDevice {
  return (
    typeof device.createBindGroup === 'function' &&
    typeof device.createBuffer === 'function' &&
    typeof device.createRenderPipeline === 'function' &&
    typeof device.createSampler === 'function' &&
    typeof device.createShaderModule === 'function' &&
    typeof device.createTexture === 'function' &&
    typeof device.queue.writeBuffer === 'function' &&
    typeof device.queue.writeTexture === 'function'
  );
}

function createAtlasTexture(device: LabelRendererDevice, atlas: LabelFontAtlas): SceneGPUTexture {
  const texture = device.createTexture({
    format: 'r8unorm',
    size: [atlas.width, atlas.height],
    usage: TEXTURE_COPY_DST | TEXTURE_BINDING
  });
  device.queue.writeTexture(
    { texture },
    atlas.data,
    { bytesPerRow: atlas.width },
    { width: atlas.width, height: atlas.height }
  );
  return texture;
}

function createLabelPipeline(device: LabelRendererDevice, pass: 'color' | 'pick'): SceneGPURenderPipeline {
  const module = device.createShaderModule({ code: createLabelShader(pass) });
  return device.createRenderPipeline({
    layout: 'auto',
    vertex: { module, entryPoint: 'vertexMain' },
    fragment: {
      module,
      entryPoint: 'fragmentMain',
      targets: pass === 'color' ? oitTargetStates() : [{ format: 'rgba8uint' }, { format: 'r32float' }]
    },
    primitive: { topology: 'triangle-list', frontFace: 'ccw', cullMode: 'none' },
    depthStencil: { format: 'depth24plus', depthWriteEnabled: pass === 'pick', depthCompare: 'less' }
  });
}

// eslint-disable-next-line max-lines-per-function -- Shared color and picking WGSL stays together to preserve identical glyph geometry.
function createLabelShader(pass: 'color' | 'pick'): string {
  const pick = pass === 'pick';
  return /* wgsl */ `
struct Scene {
  viewProjection: mat4x4f,
  frame: mat4x4f,
  pixelRatio: f32,
  viewportWidth: f32,
  viewportHeight: f32,
  worldUnit: f32,
  pickId: u32,
}
struct Label { position: vec3f, scale: f32, color: vec4f }
struct Glyph { labelIndex: u32, xy: vec2f, size: vec2f, uv1: vec2f, uv2: vec2f }
struct Output {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) uv: vec2f,
  @interpolate(flat) @location(2) labelIndex: u32,
}
${pick ? 'struct PickOutput { @location(0) id: vec4u, @location(1) depth: f32 }' : OIT_WGSL}
@group(0) @binding(0) var<uniform> scene: Scene;
@group(0) @binding(1) var<storage, read> labelWords: array<u32>;
@group(0) @binding(2) var<storage, read> glyphWords: array<u32>;
@group(0) @binding(3) var atlasSampler: sampler;
@group(0) @binding(4) var atlasTexture: texture_2d<f32>;
fn loadLabel(index: u32) -> Label {
  let offset = index * 5u;
  let packed = labelWords[offset + 4u];
  let encoded = vec4f(f32(packed & 255u), f32((packed >> 8u) & 255u), f32((packed >> 16u) & 255u), f32(packed >> 24u)) / 255.0;
  let linear = select(pow((encoded.rgb + vec3f(0.055)) / vec3f(1.055), vec3f(2.4)), encoded.rgb / vec3f(12.92), encoded.rgb <= vec3f(0.04045));
  return Label(vec3f(bitcast<f32>(labelWords[offset]), bitcast<f32>(labelWords[offset + 1u]), bitcast<f32>(labelWords[offset + 2u])), bitcast<f32>(labelWords[offset + 3u]), vec4f(linear, encoded.a));
}
fn loadGlyph(index: u32) -> Glyph {
  let offset = index * 9u;
  return Glyph(glyphWords[offset], vec2f(bitcast<f32>(glyphWords[offset + 1u]), bitcast<f32>(glyphWords[offset + 2u])), vec2f(bitcast<f32>(glyphWords[offset + 3u]), bitcast<f32>(glyphWords[offset + 4u])), vec2f(bitcast<f32>(glyphWords[offset + 5u]), bitcast<f32>(glyphWords[offset + 6u])), vec2f(bitcast<f32>(glyphWords[offset + 7u]), bitcast<f32>(glyphWords[offset + 8u])));
}
fn corner(index: u32) -> vec2f {
  const values = array<vec2f, 6>(vec2f(0.0,0.0),vec2f(1.0,0.0),vec2f(1.0,1.0),vec2f(0.0,0.0),vec2f(1.0,1.0),vec2f(0.0,1.0));
  return values[index];
}
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Output {
  let glyph = loadGlyph(index / 6u);
  let label = loadLabel(glyph.labelIndex);
  let shape = corner(index % 6u);
  let local = (glyph.xy + glyph.size * shape) * (label.scale / ${String(LABEL_REFERENCE_LINE_HEIGHT)}.0);
  let anchor = scene.viewProjection * scene.frame * vec4f(label.position, 1.0);
  var offset: vec2f;
  if (scene.worldUnit > 0.5) {
    let rowX = vec3f(scene.viewProjection[0].x, scene.viewProjection[1].x, scene.viewProjection[2].x);
    let rowY = vec3f(scene.viewProjection[0].y, scene.viewProjection[1].y, scene.viewProjection[2].y);
    offset = local * vec2f(length(rowX), length(rowY));
  } else {
    let pixels = local * scene.pixelRatio;
    offset = pixels * vec2f(2.0 / scene.viewportWidth, 2.0 / scene.viewportHeight) * anchor.w;
  }
  var output: Output;
  output.position = anchor + vec4f(offset, 0.0, 0.0);
  output.color = vec4f(label.color.rgb * label.color.a, label.color.a);
  output.uv = mix(glyph.uv1, glyph.uv2, shape);
  output.labelIndex = glyph.labelIndex;
  return output;
}
fn coverage(input: Output) -> f32 {
  let distance = textureSample(atlasTexture, atlasSampler, input.uv).r;
  let width = max(fwidth(distance), 0.001);
  return smoothstep(0.75 - width, 0.75 + width, distance);
}
${
  pick
    ? '@fragment fn fragmentMain(input: Output) -> PickOutput { if (coverage(input) <= 0.5 || input.color.a <= 0.0) { discard; } let id = scene.pickId + input.labelIndex; return PickOutput(vec4u(id & 255u, (id >> 8u) & 255u, (id >> 16u) & 255u, id >> 24u), input.position.z); }'
    : '@fragment fn fragmentMain(input: Output) -> NveOitOutput { let alpha = input.color.a * coverage(input); if (alpha <= 0.0) { discard; } return nve_oit(vec4f(input.color.rgb * alpha / max(input.color.a, 0.00001), alpha), input.position.z); }'
}
`;
}

function nextBufferCapacity(required: number, stride: number): number {
  let capacity = stride;
  while (capacity < required) capacity *= 2;
  return capacity;
}

function labelGlyphWorkIsBounded(texts: readonly string[], count: number): boolean {
  let work = count;
  if (work > PREPARATION_CHUNK_SIZE) return false;
  for (let index = 0; index < count; index += 1) {
    // Glyph generation traverses each string twice: once for metrics and once for bytes.
    work += (texts[index]?.length ?? 0) * 2;
    if (work > PREPARATION_CHUNK_SIZE) return false;
  }
  return true;
}

function destroyLayerResources(resources: LabelLayerResources): void {
  resources.glyph.destroy();
  resources.label.destroy();
  resources.uniform.destroy();
}
