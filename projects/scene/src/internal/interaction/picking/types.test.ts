// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type {
  PickCompletion,
  PickRequest,
  PickRequestKind,
  SceneClick,
  ScenePickHit,
  ScenePickTarget,
  ScenePointerEnter,
  ScenePointerLeave
} from './types.js';

describe('pick payload types', () => {
  it('requires vertex indices only for segment and triangle targets', () => {
    expectTypeOf<ScenePickTarget['kind']>().toEqualTypeOf<
      'instance' | 'label' | 'point' | 'segment' | 'triangle' | 'surface'
    >();
    expectTypeOf<Extract<ScenePickTarget, { kind: 'segment' }>['vertexIndices']>().toEqualTypeOf<
      readonly [number, number]
    >();
    expectTypeOf<Extract<ScenePickTarget, { kind: 'triangle' }>['vertexIndices']>().toEqualTypeOf<
      readonly [number, number, number]
    >();
    expectTypeOf<{ kind: 'surface' }>().toExtend<ScenePickTarget>();
    expectTypeOf<{ kind: 'point' }>().not.toExtend<ScenePickTarget>();
    expectTypeOf<{ kind: 'segment'; index: number }>().not.toExtend<ScenePickTarget>();
    expectTypeOf<{
      kind: 'triangle';
      index: number;
      vertexIndices: readonly [number, number];
    }>().not.toExtend<ScenePickTarget>();
  });

  it('adds a positioning source to clicks while preserving shared hit details', () => {
    expectTypeOf<SceneClick>().toExtend<ScenePickHit>();
    expectTypeOf<SceneClick['source']>().toEqualTypeOf<HTMLElement>();
    expectTypeOf<ScenePointerEnter>().toEqualTypeOf<ScenePickHit>();
    expectTypeOf<ScenePointerLeave>().toEqualTypeOf<ScenePickHit>();
    expectTypeOf<ScenePickHit['worldPosition']>().toEqualTypeOf<readonly [number, number, number]>();
    expectTypeOf<ScenePickHit['featureId']>().toEqualTypeOf<number | undefined>();
  });

  it('retains request identity and nullable completion results', () => {
    expectTypeOf<PickRequestKind>().toEqualTypeOf<'pointerdown' | 'pointerup' | 'click' | 'hover'>();
    expectTypeOf<PickCompletion['request']>().toEqualTypeOf<PickRequest>();
    expectTypeOf<PickCompletion['hit']>().toEqualTypeOf<ScenePickHit | null>();
    expectTypeOf<PickCompletion<{ id: number }>['hit']>().toEqualTypeOf<{ id: number } | null>();
  });
});
