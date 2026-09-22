// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import '@nvidia-elements/scene/cones/define.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/cylinders/define.js';
import '@nvidia-elements/scene/gridlines/define.js';
import '@nvidia-elements/scene/mesh/define.js';
import '@nvidia-elements/scene/pyramids/define.js';
import '@nvidia-elements/scene/spheres/define.js';

export default {
  title: 'Elements/Scene/Primitive APIs',
  component: 'nve-scene-apis'
};

/**
 * @summary Matched cone scenes compare declarative and packed source records. Use this comparison to assess API ergonomics for directional volumes.
 */
export const ConeComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative cone scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cones source='[{"position":[0,0,0.75],"size":[1,1,1.5],"color":"rgba(118,185,0,0.85)"}]'>
          </nve-scene-cones>
        </nve-scene>
      </section>

      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Imperative</h2>
        <nve-scene aria-label="Imperative cone scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cones id="imperative-cone"></nve-scene-cones>
        </nve-scene>
      </section>
    </div>

    <script type="module">
      import { ConeBuffer } from '@nvidia-elements/scene/cones';
      import '@nvidia-elements/scene/cones/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const cones = new ConeBuffer({ capacity: 1 });
      const cone = cones.add({ color: 'rgba(118,185,0,0.85)' });
      cone.position.set(0, 0, 0.75);
      cone.size.set(1, 1, 1.5);
      document.querySelector('#imperative-cone').source = cones;
    </script>
  `
};

/**
 * @summary Matched cube scenes compare declarative and packed source records. Use this comparison to assess API ergonomics for bounded perception volumes.
 */
export const CubeComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative cube scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cubes source='[{"position":[0,0,0.75],"size":[1.5,1.2,1.5],"color":"rgba(118,185,0,0.24)","outlineColor":"rgba(118,185,0,0.95)"}]'>
          </nve-scene-cubes>
        </nve-scene>
      </section>

      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Imperative</h2>
        <nve-scene aria-label="Imperative cube scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cubes id="imperative-cube"></nve-scene-cubes>
        </nve-scene>
      </section>
    </div>

    <script type="module">
      import { CubeBuffer } from '@nvidia-elements/scene/cubes';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const cubes = new CubeBuffer({ capacity: 1 });
      const cube = cubes.add({
        color: 'rgba(118,185,0,0.24)',
        outlineColor: 'rgba(118,185,0,0.95)'
      });
      cube.position.set(0, 0, 0.75);
      cube.size.set(1.5, 1.2, 1.5);
      document.querySelector('#imperative-cube').source = cubes;
    </script>
  `
};

/**
 * @summary Matched cylinder scenes compare declarative and packed source records. Use this comparison to assess API ergonomics for columnar measurements.
 */
export const CylinderComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative cylinder scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cylinders source='[{"position":[0,0,0.75],"size":[1,1,1.5],"color":"rgba(118,185,0,0.85)"}]'>
          </nve-scene-cylinders>
        </nve-scene>
      </section>

      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Imperative</h2>
        <nve-scene aria-label="Imperative cylinder scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cylinders id="imperative-cylinder"></nve-scene-cylinders>
        </nve-scene>
      </section>
    </div>

    <script type="module">
      import { CylinderBuffer } from '@nvidia-elements/scene/cylinders';
      import '@nvidia-elements/scene/cylinders/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const cylinders = new CylinderBuffer({ capacity: 1 });
      const cylinder = cylinders.add({ color: 'rgba(118,185,0,0.85)' });
      cylinder.position.set(0, 0, 0.75);
      cylinder.size.set(1, 1, 1.5);
      document.querySelector('#imperative-cylinder').source = cylinders;
    </script>
  `
};

/**
 * @summary Matched mesh scenes share property-authored geometry while comparing static and packed instances. Use this comparison to assess instance ergonomics without implying that mesh topology is available as HTML attributes.
 */
export const MeshComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative instance</h2>
        <nve-scene aria-label="Declarative mesh instance scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-mesh id="declarative-mesh" source='[{"position":[0,0,0.6],"color":"rgba(118,185,0,0.85)"}]'>
          </nve-scene-mesh>
        </nve-scene>
      </section>

      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Imperative instance</h2>
        <nve-scene aria-label="Imperative mesh instance scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-mesh id="imperative-mesh"></nve-scene-mesh>
        </nve-scene>
      </section>
    </div>

    <script type="module">
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/mesh/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const positions = new Float32Array([0, 0, 0.75, 0.7, 0, 0, 0, 0.5, 0, -0.7, 0, 0, 0, -0.5, 0, 0, 0, -0.45]);
      const normals = new Float32Array([0, 0, 1, 1, 0, 0, 0, 1, 0, -1, 0, 0, 0, -1, 0, 0, 0, -1]);
      const indices = new Uint32Array([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, 5, 2, 1, 5, 3, 2, 5, 4, 3, 5, 1, 4]);
      const declarativeMesh = document.querySelector('#declarative-mesh');
      const imperativeMesh = document.querySelector('#imperative-mesh');

      for (const mesh of [declarativeMesh, imperativeMesh]) {
        mesh.geometry = { indices, normals, positions };
      }

      const markers = new MarkerBuffer({ capacity: 1 });
      const marker = markers.add({ color: 'rgba(118,185,0,0.85)' });
      marker.position.set(0, 0, 0.6);
      imperativeMesh.source = markers;
    </script>
  `
};

/**
 * @summary Matched pyramid scenes compare declarative and packed source records. Use this comparison to assess API ergonomics for bounded directional markers.
 */
export const PyramidComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative pyramid scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-pyramids source='[{"position":[0,0,0.75],"size":[1,1,1.5],"color":"rgba(118,185,0,0.85)"}]'>
          </nve-scene-pyramids>
        </nve-scene>
      </section>

      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Imperative</h2>
        <nve-scene aria-label="Imperative pyramid scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-pyramids id="imperative-pyramid"></nve-scene-pyramids>
        </nve-scene>
      </section>
    </div>

    <script type="module">
      import { PyramidBuffer } from '@nvidia-elements/scene/pyramids';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/pyramids/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const pyramids = new PyramidBuffer({ capacity: 1 });
      const pyramid = pyramids.add({ color: 'rgba(118,185,0,0.85)' });
      pyramid.position.set(0, 0, 0.75);
      pyramid.size.set(1, 1, 1.5);
      document.querySelector('#imperative-pyramid').source = pyramids;
    </script>
  `
};

/**
 * @summary Matched sphere scenes compare declarative and packed source records. Use this comparison to assess API ergonomics for radial extents.
 */
export const SphereComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative sphere scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-spheres source='[{"position":[0,0,0.75],"size":[1.5,1.5,1.5],"color":"rgba(118,185,0,0.85)"}]'>
          </nve-scene-spheres>
        </nve-scene>
      </section>

      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Imperative</h2>
        <nve-scene aria-label="Imperative sphere scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-spheres id="imperative-sphere"></nve-scene-spheres>
        </nve-scene>
      </section>
    </div>

    <script type="module">
      import { SphereBuffer } from '@nvidia-elements/scene/spheres';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/spheres/define.js';

      const spheres = new SphereBuffer({ capacity: 1 });
      const sphere = spheres.add({ color: 'rgba(118,185,0,0.85)' });
      sphere.position.set(0, 0, 0.75);
      sphere.size.set(1.5, 1.5, 1.5);
      document.querySelector('#imperative-sphere').source = spheres;
    </script>
  `
};
