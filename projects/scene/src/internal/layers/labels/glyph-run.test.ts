// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { LabelFontAtlas, LabelGlyphMetric } from './font/atlas.js';
import { createLabelGlyphRun, LABEL_GLYPH_STRIDE, prepareLabelGlyphRun } from './glyph-run.js';
import { PREPARATION_CHUNK_SIZE, type PreparationContext } from '../../rendering/preparation.js';

describe(createLabelGlyphRun.name, () => {
  it('centers visible glyphs, preserves whitespace advances, and replaces unsupported characters', () => {
    const atlas = createAtlas();
    const run = createLabelGlyphRun(['A🙂 A', '\t\n'], 2, atlas);
    const view = new DataView(run.bytes.buffer, run.bytes.byteOffset, run.bytes.byteLength);

    expect([...run.offsets]).toEqual([0, 3, 3]);
    expect(run.bytes).toHaveLength(LABEL_GLYPH_STRIDE * 3);
    expect(readGlyph(view, 0)).toMatchObject({ height: 10, labelIndex: 0, width: 6, x: -13.5, y: -4 });
    expect(readGlyph(view, 1)).toMatchObject({ height: 9, labelIndex: 0, width: 5, x: -5.5, y: -5 });
    expect(readGlyph(view, 2)).toMatchObject({ height: 10, labelIndex: 0, width: 6, x: 5.5, y: -4 });
  });

  it('limits the run to the active label prefix', () => {
    const run = createLabelGlyphRun(['A', 'AA'], 1, createAtlas());

    expect([...run.offsets]).toEqual([0, 1]);
    expect(run.bytes).toHaveLength(LABEL_GLYPH_STRIDE);
  });

  it('preserves the existing width precision of synchronous and scheduled glyph packing', async () => {
    const base = createAtlas();
    const atlas = {
      ...base,
      glyphs: new Map(base.glyphs).set('A', glyph({ height: 10, width: 6, xAdvance: 0.1, yOffset: 2 }))
    };
    const sync = createLabelGlyphRun(['AAA'], 1, atlas);
    const scheduled = (await prepareLabelGlyphRun({
      atlas,
      context: createSequencedContext(true),
      count: 1,
      texts: ['AAA']
    }))!;

    expect([...sync.offsets]).toEqual([0, 3]);
    expect(scheduled.offsets).toEqual(sync.offsets);
    expect(readGlyph(new DataView(sync.bytes.buffer), 2).x).toBe(0.05000000074505806);
    expect(readGlyph(new DataView(scheduled.bytes.buffer), 2).x).toBe(0.04999999329447746);
  });

  it('resumes within a label without splitting Unicode code points or losing its cursor', async () => {
    const atlas = createAtlas();
    const texts = ['A'.repeat(PREPARATION_CHUNK_SIZE - 1) + '🙂 A', 'A🙂'];
    const expected = createLabelGlyphRun(texts, 2, atlas);
    let yields = 0;
    const prepared = await prepareLabelGlyphRun({
      atlas,
      context: {
        isCurrent: () => true,
        yield: async () => {
          yields += 1;
        }
      },
      count: 2,
      texts
    });

    expect(prepared).toEqual(expected);
    expect(yields).toBe(3);
    expect([...prepared!.offsets]).toEqual([0, PREPARATION_CHUNK_SIZE + 1, PREPARATION_CHUNK_SIZE + 3]);
    const view = new DataView(prepared!.bytes.buffer);
    expect(readGlyph(view, PREPARATION_CHUNK_SIZE - 1)).toMatchObject({ height: 9, labelIndex: 0, width: 5 });
    expect(readGlyph(view, PREPARATION_CHUNK_SIZE + 1)).toMatchObject({ labelIndex: 1, x: -7.5 });
  });

  it.each([2, 3])('cancels an empty label prefix at yield %i in metric or byte generation', async stopAt => {
    let yields = 0;
    await expect(
      prepareLabelGlyphRun({
        atlas: createAtlas(),
        context: {
          isCurrent: () => yields < stopAt,
          yield: async () => {
            yields += 1;
          }
        },
        count: PREPARATION_CHUNK_SIZE + 1,
        texts: []
      })
    ).resolves.toBeUndefined();
    expect(yields).toBe(stopAt);
  });

  it('prepares the same glyph run after yielding outside the requesting task', async () => {
    const atlas = createAtlas();
    const sync = createLabelGlyphRun(['A A', '🙂'], 2, atlas);
    const deferred = createDeferredYield();
    let settled = false;
    const pending = prepareLabelGlyphRun({ atlas, context: deferred.context, count: 2, texts: ['A A', '🙂'] }).then(
      result => {
        settled = true;
        return result;
      }
    );

    await Promise.resolve();
    expect(settled).toBe(false);
    deferred.release();

    const prepared = await pending;
    expect(prepared?.bytes).toEqual(sync.bytes);
    expect(prepared?.offsets).toEqual(sync.offsets);
  });

  it('discards a glyph run when its generation changes between chunks', async () => {
    let yields = 0;
    const context: PreparationContext = {
      isCurrent: () => yields < 2,
      yield: async () => {
        yields += 1;
      }
    };

    await expect(
      prepareLabelGlyphRun({ atlas: createAtlas(), context, count: 1, texts: ['A'.repeat(PREPARATION_CHUNK_SIZE + 1)] })
    ).resolves.toBeUndefined();
    expect(yields).toBe(2);
  });

  it('treats absent text and every normalized whitespace character as empty glyph runs', async () => {
    const atlas = createAtlas();

    expect(createLabelGlyphRun([], 2, atlas)).toEqual({ bytes: new Uint8Array(), offsets: new Uint32Array(3) });
    expect(createLabelGlyphRun(['\t\r\n'], 1, atlas)).toEqual({
      bytes: new Uint8Array(),
      offsets: new Uint32Array(2)
    });
    await expect(
      prepareLabelGlyphRun({ atlas, context: createSequencedContext(true), count: 2, texts: [] })
    ).resolves.toEqual({ bytes: new Uint8Array(), offsets: new Uint32Array(3) });
  });

  it('rejects an atlas without either a requested or replacement glyph', async () => {
    const atlas = { ...createAtlas(), glyphs: new Map<string, LabelGlyphMetric>() };

    expect(() => createLabelGlyphRun(['A'], 1, atlas)).toThrow('no replacement glyph');
    await expect(
      prepareLabelGlyphRun({ atlas, context: createSequencedContext(true), count: 1, texts: ['A'] })
    ).rejects.toThrow('no replacement glyph');
  });

  it('discards work during glyph-byte generation and before installing completed bytes', async () => {
    const options = {
      atlas: createAtlas(),
      count: 1,
      texts: ['A'.repeat(PREPARATION_CHUNK_SIZE + 1)]
    };

    await expect(
      prepareLabelGlyphRun({ ...options, context: createSequencedContext(true, true, false) })
    ).resolves.toBeUndefined();
    await expect(
      prepareLabelGlyphRun({ ...options, context: createSequencedContext(true, true, true, false) })
    ).resolves.toBeUndefined();
    await expect(
      prepareLabelGlyphRun({ ...options, context: createSequencedContext(true, true, true, true, false) })
    ).resolves.toBeUndefined();
    await expect(
      prepareLabelGlyphRun({ ...options, context: createSequencedContext(true, true, true, true, true, false) })
    ).resolves.toBeUndefined();
  });
});

function createSequencedContext(...checks: boolean[]): PreparationContext {
  let index = 0;
  const fallback = checks.at(-1) ?? true;
  return {
    isCurrent: () => checks[index++] ?? fallback,
    yield: async () => undefined
  };
}

function createDeferredYield(): { readonly context: PreparationContext; release(): void } {
  let pending = true;
  let release: () => void = () => undefined;
  return {
    context: {
      isCurrent: () => true,
      yield: () => (pending ? new Promise<void>(resolve => (release = resolve)) : Promise.resolve())
    },
    release: () => {
      pending = false;
      release();
    }
  };
}

function createAtlas(): LabelFontAtlas {
  const glyphs = new Map<string, LabelGlyphMetric>([
    [' ', glyph({ height: 0, width: 0, xAdvance: 4, yOffset: 0 })],
    ['A', glyph({ height: 10, width: 6, xAdvance: 8, yOffset: 2 })],
    ['�', glyph({ height: 9, width: 5, xAdvance: 7, yOffset: 1 })]
  ]);
  return { data: new Uint8Array(), glyphs, height: 1, lineHeight: 12, replacement: '�', width: 1 };
}

function glyph(options: {
  readonly height: number;
  readonly width: number;
  readonly xAdvance: number;
  readonly yOffset: number;
}): LabelGlyphMetric {
  return { ...options, u1: 0.1, u2: 0.2, v1: 0.3, v2: 0.4 };
}

function readGlyph(view: DataView, index: number) {
  const offset = index * LABEL_GLYPH_STRIDE;
  return {
    height: view.getFloat32(offset + 16, true),
    labelIndex: view.getUint32(offset, true),
    width: view.getFloat32(offset + 12, true),
    x: view.getFloat32(offset + 4, true),
    y: view.getFloat32(offset + 8, true)
  };
}
