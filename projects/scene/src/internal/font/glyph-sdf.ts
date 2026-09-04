// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const DISTANCE_INFINITY = 1e20;

export interface GlyphSDFRasterizerOptions {
  readonly buffer: number;
  readonly cutoff: number;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly radius: number;
}

export interface RasterizedGlyphSDF {
  readonly advance: number;
  readonly data: Uint8ClampedArray;
  readonly height: number;
  readonly top: number;
  readonly width: number;
}

interface DistanceTransformWorkspace {
  readonly boundaries: Float64Array;
  readonly inner: Float64Array;
  readonly line: Float64Array;
  readonly outer: Float64Array;
  readonly sites: Uint32Array;
}

interface DistanceFieldOptions {
  readonly alpha: Uint8ClampedArray;
  readonly cutoff: number;
  readonly height: number;
  readonly radius: number;
  readonly width: number;
  readonly workspace: DistanceTransformWorkspace;
}

export interface SignedDistanceFieldOptions {
  readonly cutoff: number;
  readonly height: number;
  readonly radius: number;
  readonly width: number;
}

interface DistanceGridOptions {
  readonly distances: Float64Array;
  readonly height: number;
  readonly width: number;
  readonly workspace: DistanceTransformWorkspace;
}

interface DistanceLineOptions {
  readonly distances: Float64Array;
  readonly length: number;
  readonly offset: number;
  readonly stride: number;
  readonly workspace: DistanceTransformWorkspace;
}

/** Rasterizes browser font glyphs into signed-distance fields for GPU sampling. */
export class GlyphSDFRasterizer {
  readonly #buffer: number;
  readonly #context: CanvasRenderingContext2D;
  readonly #cutoff: number;
  readonly #radius: number;
  readonly #size: number;
  readonly #workspace: DistanceTransformWorkspace;

  constructor(options: GlyphSDFRasterizerOptions) {
    this.#buffer = options.buffer;
    this.#cutoff = options.cutoff;
    this.#radius = options.radius;
    this.#size = Math.ceil(options.fontSize + options.buffer * 4);
    this.#context = createRasterContext(this.#size);
    this.#context.font = `${options.fontSize}px ${options.fontFamily}`;
    this.#context.textAlign = 'left';
    this.#context.textBaseline = 'alphabetic';
    this.#context.fillStyle = 'black';
    const maximumFieldSize = this.#size + this.#buffer;
    this.#workspace = createWorkspace(maximumFieldSize);
  }

  rasterize(character: string): RasterizedGlyphSDF {
    const metrics = this.#context.measureText(character);
    const top = Math.ceil(metrics.actualBoundingBoxAscent);
    const glyphWidth = Math.max(
      0,
      Math.min(this.#size - this.#buffer, Math.ceil(metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft))
    );
    const glyphHeight = Math.max(
      0,
      Math.min(this.#size - this.#buffer, top + Math.ceil(metrics.actualBoundingBoxDescent))
    );
    const width = glyphWidth + this.#buffer * 2;
    const height = glyphHeight + this.#buffer * 2;
    const data = new Uint8ClampedArray(width * height);

    if (glyphWidth > 0 && glyphHeight > 0) {
      this.#rasterizeAlpha(character, data, { glyphHeight, glyphWidth, top, width });
      encodeSignedDistanceField({
        alpha: data,
        cutoff: this.#cutoff,
        height,
        radius: this.#radius,
        width,
        workspace: this.#workspace
      });
    }

    return { advance: metrics.width, data, height, top, width };
  }

  #rasterizeAlpha(
    character: string,
    data: Uint8ClampedArray,
    metrics: { readonly glyphHeight: number; readonly glyphWidth: number; readonly top: number; readonly width: number }
  ): void {
    const { glyphHeight, glyphWidth, top, width } = metrics;
    this.#context.clearRect(0, 0, this.#size, this.#size);
    this.#context.fillText(character, this.#buffer, this.#buffer + top);
    const pixels = this.#context.getImageData(this.#buffer, this.#buffer, glyphWidth, glyphHeight).data;
    for (let y = 0; y < glyphHeight; y += 1) {
      for (let x = 0; x < glyphWidth; x += 1) {
        data[(y + this.#buffer) * width + x + this.#buffer] = Number(pixels[(y * glyphWidth + x) * 4 + 3]);
      }
    }
  }
}

/** Creates an SDF from one byte of alpha coverage per pixel. */
export function createSignedDistanceField(
  alpha: Uint8ClampedArray,
  options: SignedDistanceFieldOptions
): Uint8ClampedArray {
  const data = alpha.slice();
  encodeSignedDistanceField({
    ...options,
    alpha: data,
    workspace: createWorkspace(Math.max(options.width, options.height))
  });
  return data;
}

function createRasterContext(size: number): CanvasRenderingContext2D {
  /* istanbul ignore if -- SSR imports the module, but only the browser renderer instantiates it. */
  if (typeof globalThis.document === 'undefined') {
    throw new Error('Canvas 2D is required to build the label font atlas.');
  }
  const canvas = globalThis.document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas 2D is required to build the label font atlas.');
  return context;
}

function createWorkspace(maximumFieldSize: number): DistanceTransformWorkspace {
  const area = maximumFieldSize * maximumFieldSize;
  return {
    boundaries: new Float64Array(maximumFieldSize + 1),
    inner: new Float64Array(area),
    line: new Float64Array(maximumFieldSize),
    outer: new Float64Array(area),
    sites: new Uint32Array(maximumFieldSize)
  };
}

function encodeSignedDistanceField(options: DistanceFieldOptions): void {
  const { alpha, cutoff, height, radius, width, workspace } = options;
  const length = width * height;
  initializeDistanceGrids(alpha, length, workspace);
  transformSquaredDistances({ distances: workspace.outer, height, width, workspace });
  transformSquaredDistances({ distances: workspace.inner, height, width, workspace });
  for (let index = 0; index < length; index += 1) {
    const signedDistance = Math.sqrt(Number(workspace.outer[index])) - Math.sqrt(Number(workspace.inner[index]));
    alpha[index] = Math.round(255 - 255 * (signedDistance / radius + cutoff));
  }
}

function initializeDistanceGrids(
  alpha: Uint8ClampedArray,
  length: number,
  workspace: DistanceTransformWorkspace
): void {
  workspace.outer.fill(DISTANCE_INFINITY, 0, length);
  workspace.inner.fill(0, 0, length);
  for (let index = 0; index < length; index += 1) {
    const coverage = Number(alpha[index]) / 255;
    if (coverage === 0) continue;
    if (coverage === 1) {
      workspace.outer[index] = 0;
      workspace.inner[index] = DISTANCE_INFINITY;
      continue;
    }
    const edgeDistance = 0.5 - coverage;
    workspace.outer[index] = edgeDistance > 0 ? edgeDistance * edgeDistance : 0;
    workspace.inner[index] = edgeDistance < 0 ? edgeDistance * edgeDistance : 0;
  }
}

// Separable exact Euclidean distance transform described by Felzenszwalb and Huttenlocher:
// https://cs.brown.edu/people/pfelzens/papers/dt-final.pdf
function transformSquaredDistances(options: DistanceGridOptions): void {
  const { distances, height, width, workspace } = options;
  for (let x = 0; x < width; x += 1) {
    transformLine({ distances, length: height, offset: x, stride: width, workspace });
  }
  for (let y = 0; y < height; y += 1) {
    transformLine({ distances, length: width, offset: y * width, stride: 1, workspace });
  }
}

// eslint-disable-next-line max-statements -- The linear-time lower-envelope algorithm is clearest as one pass.
function transformLine(options: DistanceLineOptions): void {
  const { distances, length, offset, stride, workspace } = options;
  const { boundaries, line, sites } = workspace;
  let envelopeEnd = 0;
  sites[0] = 0;
  boundaries[0] = -DISTANCE_INFINITY;
  boundaries[1] = DISTANCE_INFINITY;
  line[0] = Number(distances[offset]);

  for (let candidate = 1; candidate < length; candidate += 1) {
    line[candidate] = Number(distances[offset + candidate * stride]);
    let intersection = 0;
    while (envelopeEnd >= 0) {
      const site = Number(sites[envelopeEnd]);
      intersection =
        (Number(line[candidate]) - Number(line[site]) + candidate * candidate - site * site) / (2 * (candidate - site));
      if (intersection > Number(boundaries[envelopeEnd])) break;
      envelopeEnd -= 1;
    }
    envelopeEnd += 1;
    sites[envelopeEnd] = candidate;
    boundaries[envelopeEnd] = intersection;
    boundaries[envelopeEnd + 1] = DISTANCE_INFINITY;
  }

  envelopeEnd = 0;
  for (let point = 0; point < length; point += 1) {
    while (Number(boundaries[envelopeEnd + 1]) < point) envelopeEnd += 1;
    const site = Number(sites[envelopeEnd]);
    const delta = point - site;
    distances[offset + point * stride] = Number(line[site]) + delta * delta;
  }
}
