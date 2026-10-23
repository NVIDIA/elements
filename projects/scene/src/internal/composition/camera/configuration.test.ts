// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type {
  CameraConfiguration,
  CameraElement,
  CameraPropertyName,
  SceneCameraBehavior,
  SceneCameraFollowMode,
  SceneCameraProjectionMode
} from './configuration.js';
import type { SceneCameraProjection } from './math.js';

describe('camera configuration types', () => {
  it('limits navigation and projection modes to supported values', () => {
    expectTypeOf<SceneCameraBehavior>().toEqualTypeOf<'orbit' | 'follow' | 'top' | 'pose'>();
    expectTypeOf<SceneCameraFollowMode>().toEqualTypeOf<'position' | 'pose'>();
    expectTypeOf<SceneCameraProjectionMode>().toEqualTypeOf<SceneCameraProjection['mode']>();
    expectTypeOf<CameraConfiguration['behavior']>().toEqualTypeOf<SceneCameraBehavior>();
    expectTypeOf<CameraConfiguration['followMode']>().toEqualTypeOf<SceneCameraFollowMode>();
    expectTypeOf<CameraConfiguration['projection']>().toEqualTypeOf<SceneCameraProjectionMode>();
  });

  it('combines configuration with a DOM element and tracks every configurable property', () => {
    expectTypeOf<CameraElement>().toExtend<HTMLElement>();
    expectTypeOf<CameraElement>().toExtend<CameraConfiguration>();
    expectTypeOf<CameraPropertyName>().toEqualTypeOf<keyof CameraConfiguration>();
    expectTypeOf<'requestUpdate'>().not.toExtend<CameraPropertyName>();
    expectTypeOf<CameraConfiguration['frame']>().toEqualTypeOf<string | null>();
  });
});
