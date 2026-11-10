// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, test, type BenchRunOptions } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { SceneFrame } from './frame.js';
import './define.js';
import '../cubes/define.js';
import '../model/define.js';
import { configureSceneTesting, resetSceneTesting } from '../../test/platform.js';

const options = { iterations: 10, throws: true, time: 750, warmupTime: 200 } satisfies BenchRunOptions;

// Measures synchronous reference assignment and CPU composition, without GPU rendering or Lit update completion.
describe('scene frame reference assignment', () => {
  for (const count of [8, 32, 128]) {
    const models = Array.from(
      { length: count },
      (_, index) => html`
      <nve-scene-model name=${`robot-${index}`} .position=${[index * 2, 0, 0]}>
        <nve-scene-frame name="base" .position=${[1, 0, 0]}></nve-scene-frame>
        <nve-scene-frame name="tool" .position=${[2, 0, 0]}></nve-scene-frame>
        <nve-scene-frame data-payload frame="tool" .position=${[0, 1, 0]}>
          <nve-scene-cubes></nve-scene-cubes>
        </nve-scene-frame>
      </nve-scene-model>
    `
    );
    for (const mode of ['read', 'unchanged', 'changed'] as const) {
      const batch = mode === 'changed' ? 512 : 4096;
      test(`${mode} references in ${count} models, batch ${batch}`, async ({ bench }) => {
        let fixture: HTMLElement;
        let payloads: SceneFrame[];
        await bench(`${batch} synchronous reference operations`, () => {
          let checksum = 0;
          for (let repeat = 0; repeat < batch / count; repeat += 1) {
            const next = mode === 'changed' && repeat % 2 === 0 ? 'base' : 'tool';
            for (const payload of payloads) {
              if (mode !== 'read') payload.frame = next;
              checksum += payload.frame?.length ?? 0;
            }
          }
          return checksum;
        }).run({
          ...options,
          async setup() {
            configureSceneTesting({ requestAdapter: async () => null });
            fixture = await createFixture(html`<nve-scene aria-label="Reference benchmark">${models}</nve-scene>`);
            payloads = [...fixture.querySelectorAll<SceneFrame>('[data-payload]')];
            await Promise.all(
              [...fixture.querySelectorAll<HTMLElement>('nve-scene-model, nve-scene-frame, nve-scene-cubes')].map(
                element => elementIsStable(element)
              )
            );
            if (
              payloads.length !== count ||
              payloads.some((payload, index) => payload.getWorldMatrix()[12] !== index * 2 + 2)
            )
              throw new Error('Every model must resolve its own tool before measurement.');
          },
          teardown() {
            removeFixture(fixture);
            resetSceneTesting();
          }
        });
      });
    }
  }
});
