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
 * @summary Matched cone scenes compare declarative and packed marker data. Use this comparison to assess API ergonomics for directional volumes.
 */
export const ConeComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative cone scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cones>
            <nve-scene-marker position="[0,0,0.75]" scale="[1,1,1.5]" color="rgba(118,185,0,0.85)"></nve-scene-marker>
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
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/cones/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 1 });
      const cone = markers.add({ color: 'rgba(118,185,0,0.85)' });
      cone.position.set(0, 0, 0.75);
      cone.scale.set(1, 1, 1.5);
      markers.commit();
      document.querySelector('#imperative-cone').instances = markers;
    </script>
  `
};

/**
 * @summary Matched cube scenes compare declarative and packed marker data. Use this comparison to assess API ergonomics for bounded perception volumes.
 */
export const CubeComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative cube scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cubes>
            <nve-scene-marker
              position="[0,0,0.75]"
              scale="[1.5,1.2,1.5]"
              color="rgba(118,185,0,0.24)"
              outline-color="rgba(118,185,0,0.95)"
            ></nve-scene-marker>
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
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/cubes/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 1 });
      const cube = markers.add({
        color: 'rgba(118,185,0,0.24)',
        outlineColor: 'rgba(118,185,0,0.95)'
      });
      cube.position.set(0, 0, 0.75);
      cube.scale.set(1.5, 1.2, 1.5);
      markers.commit();
      document.querySelector('#imperative-cube').instances = markers;
    </script>
  `
};

/**
 * @summary Matched cylinder scenes compare declarative and packed marker data. Use this comparison to assess API ergonomics for columnar measurements.
 */
export const CylinderComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative cylinder scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-cylinders>
            <nve-scene-marker position="[0,0,0.75]" scale="[1,1,1.5]" color="rgba(118,185,0,0.85)"></nve-scene-marker>
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
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/cylinders/define.js';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 1 });
      const cylinder = markers.add({ color: 'rgba(118,185,0,0.85)' });
      cylinder.position.set(0, 0, 0.75);
      cylinder.scale.set(1, 1, 1.5);
      markers.commit();
      document.querySelector('#imperative-cylinder').instances = markers;
    </script>
  `
};

/**
 * @summary Matched mesh scenes share property-authored geometry while comparing declarative and packed marker instances. Use this comparison to assess instance ergonomics without implying that mesh topology is available as HTML attributes.
 */
export const MeshComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative instance</h2>
        <nve-scene aria-label="Declarative mesh instance scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-mesh id="declarative-mesh">
            <nve-scene-marker position="[0,0,0.6]" color="rgba(118,185,0,0.85)"></nve-scene-marker>
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
        mesh.positions = positions;
        mesh.normals = normals;
        mesh.indices = indices;
      }

      const markers = new MarkerBuffer({ capacity: 1 });
      const marker = markers.add({ color: 'rgba(118,185,0,0.85)' });
      marker.position.set(0, 0, 0.6);
      markers.commit();
      imperativeMesh.instances = markers;
    </script>
  `
};

/**
 * @summary Matched pyramid scenes compare declarative and packed marker data. Use this comparison to assess API ergonomics for bounded directional markers.
 */
export const PyramidComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative pyramid scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-pyramids>
            <nve-scene-marker position="[0,0,0.75]" scale="[1,1,1.5]" color="rgba(118,185,0,0.85)"></nve-scene-marker>
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
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/pyramids/define.js';
      import '@nvidia-elements/scene/scene/define.js';

      const markers = new MarkerBuffer({ capacity: 1 });
      const pyramid = markers.add({ color: 'rgba(118,185,0,0.85)' });
      pyramid.position.set(0, 0, 0.75);
      pyramid.scale.set(1, 1, 1.5);
      markers.commit();
      document.querySelector('#imperative-pyramid').instances = markers;
    </script>
  `
};

/**
 * @summary Matched sphere scenes compare declarative and packed marker data. Use this comparison to assess API ergonomics for radial extents.
 */
export const SphereComparison = {
  render: () => html`
    <div nve-layout="grid gap:md">
      <section nve-layout="span:6 column gap:xs">
        <h2 nve-text="heading sm">Declarative</h2>
        <nve-scene aria-label="Declarative sphere scene" style="min-height: 320px">
          <nve-scene-gridlines></nve-scene-gridlines>
          <nve-scene-spheres>
            <nve-scene-marker position="[0,0,0.75]" scale="[1.5,1.5,1.5]" color="rgba(118,185,0,0.85)"></nve-scene-marker>
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
      import { MarkerBuffer } from '@nvidia-elements/scene';
      import '@nvidia-elements/scene/gridlines/define.js';
      import '@nvidia-elements/scene/scene/define.js';
      import '@nvidia-elements/scene/spheres/define.js';

      const markers = new MarkerBuffer({ capacity: 1 });
      const sphere = markers.add({ color: 'rgba(118,185,0,0.85)' });
      sphere.position.set(0, 0, 0.75);
      sphere.scale.set(1.5, 1.5, 1.5);
      markers.commit();
      document.querySelector('#imperative-sphere').instances = markers;
    </script>
  `
};
