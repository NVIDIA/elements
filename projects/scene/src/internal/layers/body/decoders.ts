// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneBodyGeometry } from './types.js';

/** Lower-case extension identifying a built-in or registered geometry decoder. */
export type SceneGeometryFormat = string;

/** Decoder inputs shared by built-in and external geometry formats. */
export interface GeometryDecoderOptions {
  /** Original URL fragment, including # and percent escapes; empty when absent. */
  readonly fragment: string;
  readonly signal?: AbortSignal;
}

/** A lazily loaded decoder returning body geometry in the file's coordinates and units. */
export interface GeometryDecoderModule {
  decode(bytes: Uint8Array<ArrayBuffer>, options: GeometryDecoderOptions): Promise<SceneBodyGeometry>;
}

/** Loads a decoder module on the first request for its format. */
export type GeometryDecoderLoader = () => Promise<GeometryDecoderModule>;

// The only built-in format dispatch table. Decoder code stays behind dynamic imports.
const decoders = new Map<string, GeometryDecoderLoader>([['stl', () => import('./decoders/stl.js')]]);

/**
 * Registers an external lazy geometry decoder shared by body src, loadGeometry(), and
 * decodeGeometry(). Accepts letters and digits with an optional leading dot; extensions
 * compare without case. Duplicate registration, including built-in STL, throws TypeError.
 * The loader returns a module exposing decode(bytes, { fragment, signal }) and runs only
 * when that extension needs decoding. External packages own any decoder dependencies.
 * This registry dispatches geometry formats, not arbitrary visualizer plug-ins.
 */
export function registerGeometryDecoder(extension: string, loader: GeometryDecoderLoader): void {
  const key = normalizeExtension(extension);
  if (decoders.has(key)) throw new TypeError(`A geometry decoder is already registered for ".${key}".`);
  if (typeof loader !== 'function') throw new TypeError('A geometry decoder loader must be a function.');
  decoders.set(key, loader);
}

/** Selects a loader without importing decoder code. */
export function getGeometryDecoder(format: SceneGeometryFormat): GeometryDecoderLoader {
  const decoder = decoders.get(normalizeExtension(format));
  if (!decoder) throw new TypeError(`Unsupported geometry format "${format}".`);
  return decoder;
}

/** Infers a format from the final URL path segment, excluding query and fragment. */
export function inferGeometryFormat(url: string | URL): SceneGeometryFormat {
  const { pathname } = new URL(url, 'https://scene.invalid/');
  const filename = pathname.slice(pathname.lastIndexOf('/') + 1);
  const dot = filename.lastIndexOf('.');
  const extension = dot < 0 ? '' : filename.slice(dot + 1).toLowerCase();
  if (!decoders.has(extension)) throw new TypeError(`No geometry decoder for URL "${url}".`);
  return extension;
}

function normalizeExtension(extension: string): string {
  if (typeof extension !== 'string' || !/^\.?[a-z0-9]+$/i.test(extension))
    throw new TypeError('A geometry decoder extension must contain letters or digits, with an optional leading dot.');
  return extension.replace(/^\./, '').toLowerCase();
}
